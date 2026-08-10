-- Real one-click security-header remediation, executed on the customer's own
-- server through the Kada Nigrani agent (the only server the platform can
-- actually reach) — the honest counterpart to the copy-paste config on the
-- website detail page.
--
-- SAFETY DECISIONS (deliberate):
--   * Only the SAFE headers are auto-applied: X-Frame-Options,
--     X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and HSTS.
--     Content-Security-Policy is intentionally NOT auto-applied — a strict CSP
--     routinely breaks real sites (blocks their own scripts/CDNs) and
--     `nginx -t` still passes, so a config-test rollback wouldn't catch the
--     breakage. CSP stays copy-only/manual (see securityFixConfig.js).
--   * The action is a fixed action_key; the real command is hardcoded in the
--     agent (kada-nigrani-agent.sh) — never a raw command from the database.
--   * The agent backs up any existing snippet, runs `nginx -t`, reloads, and
--     rolls back if the test fails.
--   * Requires an admin (hosts:manage) to trigger, and only for a host in the
--     same org as the monitor.

-- 1. Allow the new action_key (superset of the current 0036 list).
alter table host_commands drop constraint host_commands_action_key_check;
alter table host_commands add constraint host_commands_action_key_check
  check (action_key in (
    'ping', 'clear_temp', 'restart_service', 'reload_nginx', 'reload_apache',
    'restart_docker_container', 'renew_ssl_certbot', 'apply_security_headers'
  ));

-- 2. Link a command to the website monitor it fixes, so a follow-up scan can
--    verify the fix actually took effect.
alter table host_commands add column if not exists monitor_id uuid references monitors (id) on delete set null;

-- 3. Catalog entry (keeps the UI's action list in sync).
create or replace function list_runbook_actions()
returns table (action_key text, label text, description text, risk text, needs_arg boolean, arg_label text)
language sql immutable as $$
  select * from (values
    ('ping',                    'Agent health ping',        'Confirms the agent is alive and returns uptime/load. Harmless.',            'safe',   false, null),
    ('clear_temp',              'Clear agent temp files',   'Removes the agent''s own scratch files under /tmp. Harmless.',              'safe',   false, null),
    ('reload_nginx',            'Reload Nginx config',      'Gracefully reloads Nginx without dropping connections.',                    'low',    false, null),
    ('reload_apache',           'Reload Apache config',     'Gracefully reloads Apache (apachectl graceful).',                          'low',    false, null),
    ('renew_ssl_certbot',       'Renew SSL (Certbot)',      'Runs certbot renew on this host. Only renews certs already due; no-op otherwise. Requires certbot to already be installed and configured.', 'low', false, null),
    ('apply_security_headers',  'Apply security headers',   'Adds the safe protective headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS) via a managed config snippet, tests, and reloads. CSP is left for manual review. Backs up and rolls back on failure.', 'medium', false, null),
    ('restart_docker_container','Restart Docker container', 'Restarts one container by name. Brief downtime for that container.',        'medium', true,  'Container name'),
    ('restart_service',         'Restart system service',   'systemctl restart of one allowlisted service. Brief downtime.',             'medium', true,  'Service name')
  ) as t(action_key, label, description, risk, needs_arg, arg_label);
$$;

-- 4. Extend request_host_command's allowlist (manual runbook path).
create or replace function request_host_command(p_host_agent_id uuid, p_action_key text, p_arg text default null)
returns host_commands
language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  v_org_id uuid;
  v_arg    text;
  v_cmd    host_commands;
begin
  select organization_id into v_org_id from host_agents where id = p_host_agent_id;
  if v_org_id is null or not is_org_member(v_org_id) then
    raise exception 'Host not found or not authorized';
  end if;
  if p_action_key not in ('ping','clear_temp','restart_service','reload_nginx','reload_apache','restart_docker_container','renew_ssl_certbot','apply_security_headers') then
    raise exception 'Unknown action: %', p_action_key;
  end if;
  if p_action_key in ('restart_service','restart_docker_container') then
    v_arg := trim(coalesce(p_arg, ''));
    if v_arg = '' or v_arg !~ '^[A-Za-z0-9._-]{1,64}$' then
      raise exception 'This action requires a valid name (letters, numbers, . _ - only)';
    end if;
  else
    v_arg := null;
  end if;
  insert into host_commands (organization_id, host_agent_id, action_key, arg, requested_by)
  values (v_org_id, p_host_agent_id, p_action_key, v_arg, auth.uid())
  returning * into v_cmd;
  return v_cmd;
end;
$$;

-- 5. The one-click website fix: enqueue apply_security_headers for the host
--    that runs this site, linked to the monitor for verification. The user's
--    click IS the approval, so it goes straight to 'approved' for the agent.
create or replace function apply_website_fix(p_monitor_id uuid, p_host_agent_id uuid)
returns host_commands
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_org uuid; v_horg uuid; v_cmd host_commands;
begin
  select organization_id into v_org from monitors where id = p_monitor_id;
  select organization_id into v_horg from host_agents where id = p_host_agent_id;
  if v_org is null or v_horg is null or v_org <> v_horg then
    raise exception 'Monitor and host must belong to the same organization';
  end if;
  if not is_org_member(v_org) then raise exception 'Not authorized'; end if;
  if not has_org_permission(v_org, 'hosts', 'manage') then
    raise exception 'Not authorized to apply server changes';
  end if;
  if exists (select 1 from host_commands
             where monitor_id = p_monitor_id and action_key = 'apply_security_headers'
               and status in ('proposed', 'approved', 'running')) then
    raise exception 'A security-header fix is already in progress for this site';
  end if;
  insert into host_commands (organization_id, host_agent_id, monitor_id, action_key, arg, source, status, requested_by, root_cause, trigger_metric)
  values (v_org, p_host_agent_id, p_monitor_id, 'apply_security_headers', null, 'manual', 'approved', auth.uid(),
          'Add the safe protective headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS) via the agent. CSP is left for manual review to avoid breaking the site.',
          'security headers')
  returning * into v_cmd;
  return v_cmd;
end;
$$;
grant execute on function apply_website_fix(uuid, uuid) to authenticated;

-- 6. Verify-and-close: when a fresh security scan lands for a monitor whose
--    fix ran successfully, confirm the safe headers are now actually present.
create or replace function _verify_security_fix()
returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update host_commands hc
     set verify_result = case
           when not ('x-frame-options' = any(new.missing_headers))
            and not ('x-content-type-options' = any(new.missing_headers))
           then 'recovered' else 'not_improved' end,
         verified_at = now()
   where hc.monitor_id = new.monitor_id
     and hc.action_key = 'apply_security_headers'
     and hc.status = 'success'
     and hc.verify_result is null;
  return new;
end;
$$;

drop trigger if exists verify_security_fix on security_snapshots;
create trigger verify_security_fix
  after insert or update on security_snapshots
  for each row execute function _verify_security_fix();

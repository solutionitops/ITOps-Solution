-- Self-Healing: the first autonomous loop, built entirely on the remediation
-- backbone that already exists (host_commands + the agent's whitelisted
-- action executor + request_host_command). This migration adds only the three
-- pieces that were missing between "manual runbooks" and "self-healing":
--
--   1. AUTO-DETECT + AUTO-PROPOSE — a trigger on host_metrics turns a real,
--      measured problem (critical disk pressure) into a proposed remediation
--      with a plain-language root cause, instead of waiting for a human to
--      notice and pick an action.
--   2. AUTONOMY CONTROL — a per-org setting decides whether an auto-detected
--      fix waits for a human ('suggest', the default) or is dispatched
--      immediately ('auto'), or detection is disabled ('off').
--   3. VERIFY-AND-CLOSE — the same trigger checks, on the next metrics report,
--      whether an executed fix actually recovered the condition, closing the
--      loop honestly (recovered vs. not_improved).
--
-- SAFETY: default autonomy is 'suggest', so enabling this feature changes
-- NOTHING until an org explicitly opts into 'auto' — nothing is ever executed
-- on a server without either a human clicking Approve or a deliberate opt-in.
-- The only auto-proposed action is 'clear_temp', already the safest entry in
-- the existing whitelist (it only removes the agent's own scratch files).

-- ---------------------------------------------------------------------------
-- 1. Extend host_commands with a 'proposed' state + self-healing metadata.
-- ---------------------------------------------------------------------------
alter table host_commands drop constraint if exists host_commands_status_check;
alter table host_commands add constraint host_commands_status_check
  check (status in ('proposed', 'approved', 'running', 'success', 'failed', 'cancelled'));

alter table host_commands add column if not exists source text not null default 'manual'
  check (source in ('manual', 'auto'));
alter table host_commands add column if not exists root_cause text;
alter table host_commands add column if not exists confidence int;
alter table host_commands add column if not exists trigger_metric text;
alter table host_commands add column if not exists verified_at timestamptz;
alter table host_commands add column if not exists verify_result text
  check (verify_result is null or verify_result in ('recovered', 'not_improved'));

-- ---------------------------------------------------------------------------
-- 2. Per-org autonomy setting.
-- ---------------------------------------------------------------------------
create table org_healing_settings (
  organization_id uuid primary key references organizations (id) on delete cascade,
  autonomy        text not null default 'suggest' check (autonomy in ('off', 'suggest', 'auto')),
  updated_at      timestamptz not null default now(),
  updated_by      uuid references auth.users (id) on delete set null
);
alter table org_healing_settings enable row level security;
create policy org_healing_settings_select on org_healing_settings
  for select using (is_org_member(organization_id));

create or replace function get_healing_autonomy()
returns text
language sql security definer stable set search_path = public, pg_temp as $$
  select coalesce(
    (select s.autonomy
       from org_healing_settings s
       join memberships m on m.organization_id = s.organization_id
      where m.user_id = auth.uid()
      limit 1),
    'suggest');
$$;
grant execute on function get_healing_autonomy() to authenticated;

create or replace function set_healing_autonomy(p_level text)
returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_org uuid;
begin
  if p_level not in ('off', 'suggest', 'auto') then
    raise exception 'Invalid autonomy level';
  end if;
  select organization_id into v_org from memberships where user_id = auth.uid() limit 1;
  if v_org is null then raise exception 'No organization membership found'; end if;
  -- Changing how much the platform is allowed to touch servers is an
  -- admin-level decision — same gate as managing hosts.
  if not has_org_permission(v_org, 'hosts', 'manage') then
    raise exception 'Not authorized to change automation settings';
  end if;
  insert into org_healing_settings (organization_id, autonomy, updated_by)
    values (v_org, p_level, auth.uid())
    on conflict (organization_id) do update
      set autonomy = excluded.autonomy, updated_at = now(), updated_by = auth.uid();
  return p_level;
end;
$$;
grant execute on function set_healing_autonomy(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Detection + verification, driven off real metrics as they arrive.
-- ---------------------------------------------------------------------------
create or replace function _self_healing_on_metric()
returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_autonomy  text;
  v_open      int;
  v_host_name text;
begin
  -- (a) VERIFY & CLOSE: for any auto clear_temp fix that ran and hasn't been
  -- verified yet, this fresh metric is the evidence — did disk actually drop?
  update host_commands hc
     set verify_result = case when new.disk_percent < 85 then 'recovered' else 'not_improved' end,
         verified_at = now()
   where hc.host_agent_id = new.host_agent_id
     and hc.source = 'auto'
     and hc.action_key = 'clear_temp'
     and hc.status = 'success'
     and hc.verify_result is null;

  -- (b) DETECT & PROPOSE: critical disk pressure -> propose the safe first-line
  -- action, gated by the org's autonomy level.
  select autonomy into v_autonomy from org_healing_settings where organization_id = new.organization_id;
  v_autonomy := coalesce(v_autonomy, 'suggest');
  if v_autonomy = 'off' then
    return new;
  end if;

  if new.disk_percent is not null and new.disk_percent >= 90 then
    -- Cooldown: never stack proposals — skip if one is already open for this
    -- host+action or if one was created in the last 30 minutes.
    select count(*) into v_open
      from host_commands
     where host_agent_id = new.host_agent_id
       and action_key = 'clear_temp'
       and source = 'auto'
       and (status in ('proposed', 'approved', 'running')
            or created_at > now() - interval '30 minutes');

    if v_open = 0 then
      select name into v_host_name from host_agents where id = new.host_agent_id;
      insert into host_commands (
        organization_id, host_agent_id, action_key, arg, source, status,
        root_cause, confidence, trigger_metric
      ) values (
        new.organization_id, new.host_agent_id, 'clear_temp', null, 'auto',
        case when v_autonomy = 'auto' then 'approved' else 'proposed' end,
        format('Disk usage on %s is critically high at %s%%. Proposed safe first-line action: clear the agent''s temporary files. If disk stays high afterward, deeper cleanup is required.',
               coalesce(v_host_name, 'this host'), round(new.disk_percent)),
        90,
        format('disk %s%%', round(new.disk_percent))
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists self_healing_on_metric on host_metrics;
create trigger self_healing_on_metric
  after insert on host_metrics
  for each row execute function _self_healing_on_metric();

-- ---------------------------------------------------------------------------
-- 4. Approve / dismiss a proposed auto-remediation, and list the incidents.
-- ---------------------------------------------------------------------------
create or replace function approve_host_command(p_id uuid)
returns host_commands
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_org uuid;
  v_cmd host_commands;
begin
  select organization_id into v_org from host_commands where id = p_id;
  if v_org is null or not is_org_member(v_org) then
    raise exception 'Command not found or not authorized';
  end if;
  if not has_org_permission(v_org, 'hosts', 'manage') then
    raise exception 'Not authorized to approve remediations';
  end if;
  update host_commands
     set status = 'approved', requested_by = coalesce(requested_by, auth.uid())
   where id = p_id and status = 'proposed'
   returning * into v_cmd;
  if v_cmd.id is null then
    raise exception 'This remediation is not awaiting approval';
  end if;
  return v_cmd;
end;
$$;
grant execute on function approve_host_command(uuid) to authenticated;

create or replace function dismiss_host_command(p_id uuid)
returns host_commands
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_org uuid;
  v_cmd host_commands;
begin
  select organization_id into v_org from host_commands where id = p_id;
  if v_org is null or not is_org_member(v_org) then
    raise exception 'Command not found or not authorized';
  end if;
  if not has_org_permission(v_org, 'hosts', 'manage') then
    raise exception 'Not authorized to dismiss remediations';
  end if;
  update host_commands set status = 'cancelled'
   where id = p_id and status = 'proposed'
   returning * into v_cmd;
  if v_cmd.id is null then
    raise exception 'This remediation is not awaiting approval';
  end if;
  return v_cmd;
end;
$$;
grant execute on function dismiss_host_command(uuid) to authenticated;

create or replace function list_healing_incidents(p_limit int default 25)
returns table (
  id uuid, host_agent_id uuid, host_name text, action_key text, status text,
  root_cause text, confidence int, trigger_metric text, verify_result text,
  exit_code int, created_at timestamptz, finished_at timestamptz, verified_at timestamptz
)
language sql security definer stable set search_path = public, pg_temp as $$
  select hc.id, hc.host_agent_id, ha.name, hc.action_key, hc.status,
         hc.root_cause, hc.confidence, hc.trigger_metric, hc.verify_result,
         hc.exit_code, hc.created_at, hc.finished_at, hc.verified_at
    from host_commands hc
    join host_agents ha on ha.id = hc.host_agent_id
    join memberships m on m.organization_id = hc.organization_id and m.user_id = auth.uid()
   where hc.source = 'auto'
   order by hc.created_at desc
   limit least(greatest(p_limit, 1), 100);
$$;
grant execute on function list_healing_incidents(int) to authenticated;

alter publication supabase_realtime add table org_healing_settings;

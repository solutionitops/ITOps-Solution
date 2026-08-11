-- Extend "Linux Fundamentals for IT Operations" from a 2-module primer into a
-- full ITOps/SRE program: real server & website troubleshooting, the metrics
-- monitoring actually watches, and how detection turns into automated
-- remediation — the same detect → decide → apply → verify → close loop the
-- platform's own Self-Healing feature runs (migrations 0092/0093).
--
-- Additive and idempotent, exactly like 0086: looks the course up by slug,
-- guards on whether the new modules already exist, and only grows the course.
-- Every command shown is a real, correct diagnostic — no invented tooling.

do $$
declare
  v_course_id uuid;
  v_mon uuid;   -- How Monitoring Works
  v_perf uuid;  -- Performance Triage
  v_stor uuid;  -- Storage & Logs
  v_net uuid;   -- Networking & Services
  v_sys uuid;   -- Access & System
  v_heal uuid;  -- Monitoring to Auto-Remediation
begin
  select id into v_course_id from cybersachet_courses where slug = 'linux-fundamentals-for-it-operations';
  if v_course_id is null then return; end if;

  if not exists (select 1 from cybersachet_modules where course_id = v_course_id and title = 'How Monitoring Works') then

    update cybersachet_courses set
      level = 'intermediate',
      estimated_minutes = 210,
      description = 'From the Linux basics you use daily to real ITOps/SRE work: diagnosing slow servers, full disks, dead services, DNS and network faults — the exact commands, the metrics monitoring watches, and how detection becomes automated self-healing.',
      capstone = '{
        "title": "Build a self-healing health check for a web service",
        "description": "Tie the whole course together: detect a real problem, fix it automatically, verify recovery, and escalate if it fails — the same loop production monitoring runs.",
        "requirements": [
          "Write a bash script that curls a local web endpoint and reads the HTTP status code",
          "If the status is not 200, log the event with a timestamp and restart the service with systemctl",
          "After restarting, re-check the endpoint and log whether recovery succeeded",
          "If recovery fails, print an escalation line (where a real setup would fire a Slack/PagerDuty webhook)",
          "Add a systemd override with Restart=always and RestartSec=5s so the service also self-restarts on crash",
          "Schedule the script every minute with cron and confirm it writes to its log"
        ],
        "deliverable": "Your auto_heal.sh, the systemd override file, and the crontab line — plus a short note on how this maps to the platform''s Self-Healing loop (detect → propose/apply → verify → close). Self-assessed against the checklist; the goal is a working detect-and-recover loop you understand end to end."
      }'::jsonb
    where id = v_course_id;

    -- ── Module: How Monitoring Works ──────────────────────────────────────
    insert into cybersachet_modules (course_id, title, sort_order, interview_questions) values
      (v_course_id, 'How Monitoring Works', 2, '[
        {"question": "Walk me through what happens between a server problem starting and someone getting paged.", "answer": "A collector (an external synthetic probe hitting HTTP/DNS, or an agent on the host reading CPU/mem/disk) samples on an interval; the samples go to a central engine that stores time-series data and evaluates them against thresholds; when a threshold is breached for long enough, the alerting layer fires — a dashboard, Slack/PagerDuty, or an ITSM ticket."},
        {"question": "What''s the difference between synthetic (external) monitoring and agent-based monitoring?", "answer": "Synthetic probes test the service the way a user would — from outside, over the network (curl, ping, DNS) — so they catch availability and latency including network/DNS issues. Agents run on the host and report what only the host can see: CPU, memory, disk, per-process usage. You want both; each is blind to what the other sees."},
        {"question": "Why alert on \"sustained over threshold\" instead of a single sample?", "answer": "Single samples are noisy — a one-second CPU spike is normal. Alerting on a condition held for a duration (e.g. CPU > 90% for 5 minutes) cuts false pages while still catching real, sustained problems."}
      ]'::jsonb) returning id into v_mon;

    insert into cybersachet_lessons (course_id, module_id, title, body, key_takeaway, sort_order, check_question, check_choices, check_correct_index) values
    (v_course_id, v_mon, 'What monitoring actually does',
     E'Monitoring is a loop, not a dashboard. Something collects data (an external probe curling your site every 30 seconds, or an agent on the server sampling CPU and disk); a central engine stores that time-series data and compares it to thresholds you set; and when a threshold is crossed for long enough, an alert fires — to a dashboard, a chat channel, or a ticket. Website monitoring watches things from the outside: HTTP status codes, response time, SSL expiry, DNS. Server monitoring watches from the inside: CPU load, memory, disk, running processes. The two are complementary — an external probe can tell you the site is down but not that a runaway process ate all the RAM, and an agent can see the RAM but not that DNS stopped resolving for users.',
     'Monitoring is collect → store → evaluate against thresholds → alert. External probes see availability/latency; on-host agents see CPU/memory/disk. You need both.', 0,
     'An external HTTP probe reports your site is up, but users complain it is slow and the app keeps restarting. What is the probe blind to?', '["Nothing — if it is up, it is fine", "On-host signals like memory pressure or a crashing process", "The HTTP status code", "SSL certificate expiry"]'::jsonb, 1),
    (v_course_id, v_mon, 'The metrics that matter',
     E'For websites, the headline metrics are availability (HTTP status — 200 good, 5xx bad), latency (time to first byte, DNS lookup time, SSL handshake time), and certificate health (days until the TLS cert expires). For servers, it is resource utilization (CPU load average, memory used vs cached, swap), storage (per-partition capacity and disk read/write latency), process/service health (is nginx/mysqld actually running), and network throughput (bytes in/out, dropped packets, active connections). The skill isn''t memorizing every metric — it''s knowing which one to look at first for a given symptom, which is exactly what the rest of this course drills.',
     'Know the first metric to reach for per symptom: 5xx → app/logs, high latency → TTFB/DNS, slow box → load average then top, "no space" → df/inodes.', 1,
     'A user reports the site "feels slow." Which single metric best distinguishes a slow SERVER from a slow NETWORK path?', '["HTTP status code", "Disk capacity", "Response-time breakdown (DNS/handshake/TTFB) vs. network latency (ping/mtr)", "SSL expiry days"]'::jsonb, 2)
    on conflict do nothing;

    -- ── Module: Performance Triage ────────────────────────────────────────
    insert into cybersachet_modules (course_id, title, sort_order, interview_questions) values
      (v_course_id, 'Performance Triage', 3, '[
        {"question": "A server is slow. What do you run first and what are you deciding?", "answer": "Start with uptime/top to read the load average and see whether it''s CPU-bound, then vmstat 1 to split CPU vs I/O wait vs memory. You''re deciding which resource is the bottleneck — CPU, memory, or disk I/O — because each has a different fix. Chasing the wrong one wastes the outage."},
        {"question": "Load average is 8 on a box. Is that bad?", "answer": "It depends on core count. Load average is roughly the number of processes wanting the CPU; compare it to nproc. Load 8 on 8 cores is fully utilized but not necessarily overloaded; load 8 on 2 cores means processes are queuing badly. Always read load average relative to cores."},
        {"question": "How do you tell a memory problem from a memory non-problem, given Linux \"uses\" most RAM?", "answer": "free -h shows used vs buff/cache vs available. Linux deliberately fills free RAM with cache, so \"used\" looking high is normal — the number that matters is available and whether swap is being actively used. Sustained swap-in/out (si/so in vmstat) and OOM-killer messages in dmesg are the real memory-pressure signals."}
      ]'::jsonb) returning id into v_perf;

    insert into cybersachet_lessons (course_id, module_id, title, body, key_takeaway, sort_order, check_question, check_choices, check_correct_index) values
    (v_course_id, v_perf, 'Server is slow: CPU, memory, or I/O?',
     E'"Slow" is a symptom, not a cause — the first job is to find which resource is the bottleneck. `uptime` and `top` (or `htop`) show the load average, three numbers for the last 1, 5, and 15 minutes; read them against your core count (`nproc`) — load roughly equal to cores is full utilization, load well above cores means processes are queuing. `vmstat 1` prints one line per second and is the fastest triage tool: the `r` column is processes waiting to run (CPU pressure), `wa` is CPU time lost waiting on disk (I/O pressure), and `si`/`so` are swap in/out (memory pressure). `sar -u 1 5` samples CPU five times so you can see a trend rather than one noisy instant. Whichever column is pegged tells you which of the next lessons to jump to.',
     'Don''t guess "slow" — run vmstat 1 and read r (CPU), wa (I/O wait), si/so (swap) to identify the actual bottleneck before fixing anything.', 0,
     'In `vmstat 1`, a high value in the "wa" column points at which bottleneck?', '["CPU is overloaded", "The CPU is waiting on disk I/O", "Memory is full", "The network is saturated"]'::jsonb, 1),
    (v_course_id, v_perf, 'High CPU and runaway processes',
     E'When the CPU is the bottleneck, find the culprit process. `top` sorted by CPU (press `P`) shows it live; `ps aux --sort=-%cpu | head` gives a clean top-of-list snapshot you can paste into a ticket. `mpstat -P ALL 1` breaks usage down per core — useful when one core is pegged at 100% (a single-threaded hot loop) while the box average looks fine. `pidstat -u 1` attributes CPU to specific PIDs over time. High `%us` (user) points at application code; high `%sy` (system) points at kernel/syscall overhead; high `%wa` sends you back to disk I/O. Once you''ve identified the process, the fix is usually restarting the service or fixing the code — not rebooting the box blind.',
     'ps aux --sort=-%cpu | head names the CPU hog fast; mpstat -P ALL catches a single pegged core the average hides.', 1,
     'The box average CPU looks fine but the app is slow. Which command reveals that ONE core is pegged at 100%?', '["free -h", "df -h", "mpstat -P ALL 1", "du -sh"]'::jsonb, 2),
    (v_course_id, v_perf, 'Memory pressure and the OOM killer',
     E'Linux fills unused RAM with disk cache on purpose, so "used memory is high" is almost never the problem by itself — read `free -h` and look at the `available` column and whether `swap` is being used. Real memory pressure shows up as sustained swap activity (`si`/`so` in `vmstat`) and, at the extreme, the kernel''s OOM (out-of-memory) killer terminating a process to save the system — you''ll see it in `dmesg` or `journalctl -k` as "Out of memory: Killed process...". `ps aux --sort=-%mem | head` finds the biggest consumer, `cat /proc/meminfo` gives the full breakdown, and `pmap -x <PID>` shows where a single process''s memory is going. A process whose memory only ever grows is the classic memory-leak signature.',
     'Judge memory by `available` and swap activity, not "used". Sustained swap + an OOM-kill in dmesg is real pressure; steadily-growing RSS is a leak.', 2,
     'On a healthy Linux box, most RAM shows as "used". Why is that usually fine?', '["It means a memory leak", "Linux uses free RAM for disk cache, which it releases on demand — check the available column instead", "Swap is broken", "The OOM killer is active"]'::jsonb, 1),
    (v_course_id, v_perf, 'Disk I/O is the hidden bottleneck',
     E'A server can have idle CPU and free memory and still crawl because the disk can''t keep up. `iostat -x 1` is the key tool: `%util` near 100% means the disk is saturated, and `await` (average wait per I/O in milliseconds) climbing into the tens or hundreds means requests are queuing. `iotop` shows which process is doing the I/O (like `top` for disk), and `pidstat -d 1` attributes read/write throughput to PIDs. Common causes: a database doing unindexed scans, a log file being written in a tight loop, or a backup job running in business hours. The `wa` column you saw in `vmstat` is what sent you here.',
     'iostat -x 1: %util ~100% and rising await = disk saturation. iotop / pidstat -d name the process doing the I/O.', 3,
     'CPU is idle and RAM is free, but everything is slow. `iostat -x 1` shows %util at 99% and await at 250ms. What''s the bottleneck?', '["CPU", "Memory", "Disk I/O saturation", "Network"]'::jsonb, 2)
    on conflict do nothing;

    -- ── Module: Storage & Logs ────────────────────────────────────────────
    insert into cybersachet_modules (course_id, title, sort_order, interview_questions) values
      (v_course_id, 'Storage & Logs', 4, '[
        {"question": "df says the disk is full but du of the obvious directories doesn''t add up. What''s going on?", "answer": "Two classic causes: (1) inodes are exhausted, not bytes — `df -i` shows this; millions of tiny files fill the inode table while space looks free. (2) A deleted file is still held open by a running process, so the space isn''t reclaimed until the process is restarted — `lsof | grep deleted` finds it."},
        {"question": "A log file is filling the disk. What''s the right fix, and the wrong one?", "answer": "Wrong: `rm` the active log — the process often keeps writing to the now-deleted inode and space isn''t freed. Right: rotate it (logrotate) or truncate it (`: > file`) so the process keeps its handle, and configure logrotate/journald limits so it doesn''t recur. For journald specifically, `journalctl --vacuum-time=7d` or `--vacuum-size=500M`."},
        {"question": "How do you find what''s eating a partition quickly?", "answer": "`du -sh /var/* | sort -rh | head` ranks the biggest subdirectories; `ncdu` gives an interactive drill-down. Start at the partition that df flagged, not at /, so you don''t scan the whole filesystem."}
      ]'::jsonb) returning id into v_stor;

    insert into cybersachet_lessons (course_id, module_id, title, body, key_takeaway, sort_order, check_question, check_choices, check_correct_index) values
    (v_course_id, v_stor, 'Disk is full: bytes, inodes, and ghost files',
     E'"No space left on device" stops logs and applications cold. Start with `df -h` to see which partition is full — it''s often `/var` (logs) or `/`, not the whole disk. Then find the culprit with `du -sh /var/* | sort -rh | head` (biggest subdirectories first) or `ncdu` for an interactive drill-down; `lsblk` shows the physical layout if you suspect the wrong disk. Two traps: first, run out of *inodes* and you get "no space" while `df -h` shows free bytes — `df -i` reveals an exhausted inode table from millions of tiny files. Second, deleting a large file that a process still has open does *not* free the space until that process is restarted — `lsof | grep deleted` finds these "ghost" files. That''s why the right fix for a runaway log is to truncate or rotate it, not `rm` it.',
     'df -h to find the full partition, du/ncdu to find the hog. If bytes look free but you''re "full", check df -i (inodes) and lsof for deleted-but-open files.', 0,
     'df -h shows free space, but the system says "No space left on device". What do you check next?', '["Reboot immediately", "df -i for exhausted inodes", "Add more RAM", "Restart networking"]'::jsonb, 1),
    (v_course_id, v_stor, 'Taming huge and noisy logs',
     E'Logs are the most common thing to fill a disk. `du -sh /var/log/*` shows which log is the offender and `journalctl --disk-usage` reports how much the systemd journal is using. For the journal, `journalctl --vacuum-time=7d` (or `--vacuum-size=500M`) trims it safely. For application logs, `logrotate` (configured in `/etc/logrotate.conf` and `/etc/logrotate.d/`) is the proper long-term fix — it rotates, compresses, and deletes old logs on a schedule so a log can never grow unbounded. When you actually need to read them, `tail -f <logfile>` follows new lines live and `grep -i error <logfile>` filters to the failures. The lasting fix for "disk keeps filling with logs" is configuring rotation, not periodically deleting files by hand.',
     'journalctl --vacuum-* trims the journal; logrotate is the permanent fix for app logs. tail -f + grep -i error to actually read them.', 1,
     'What is the correct long-term fix so application logs can never fill the disk again?', '["A cron job that rm''s logs nightly", "Configure logrotate to rotate/compress/expire them", "Buy a bigger disk", "Delete /var/log"]'::jsonb, 1)
    on conflict do nothing;

    -- ── Module: Networking & Services ─────────────────────────────────────
    insert into cybersachet_modules (course_id, title, sort_order, interview_questions) values
      (v_course_id, 'Networking & Services', 5, '[
        {"question": "\"The website is down.\" How do you localize the fault layer by layer?", "answer": "Work up the stack: `ping <host>` (is the host reachable at all?), `curl -I http://<host>` (does HTTP answer, and with what status?), `traceroute`/`mtr` (where in the path is it failing?), `ss -tulpn` on the server (is the app actually listening on the port?), and `systemctl status <svc>` (is the service even running?). Each step tells you whether to look at network, DNS, the app, or the service."},
        {"question": "A service won''t start. Where''s the real error?", "answer": "`systemctl status <svc>` gives the summary and last lines, but the full story is `journalctl -u <svc> -xe` — the actual stack trace or config error. `systemctl cat <svc>` shows the unit file (wrong ExecStart/paths), and `dmesg | tail` catches kernel-level causes like an OOM kill. The status line alone is rarely enough."},
        {"question": "curl works but the browser can''t reach the site — what class of problem is that?", "answer": "If curl from the server works but external users can''t, suspect the layers between them: a firewall (`firewall-cmd --list-ports`, `ufw status`) blocking the port, the app bound to 127.0.0.1 instead of 0.0.0.0 (`ss -tulpn` shows the bind address), or DNS pointing users at the wrong IP."}
      ]'::jsonb) returning id into v_net;

    insert into cybersachet_lessons (course_id, module_id, title, body, key_takeaway, sort_order, check_question, check_choices, check_correct_index) values
    (v_course_id, v_net, 'Website or application not reachable',
     E'When users can''t reach an app, localize the fault by climbing the stack instead of guessing. `ping <host>` tests basic network reachability (but many hosts block ICMP, so a failed ping isn''t conclusive). `curl -I http://<host>` is more precise — it does a real HTTP request and shows the status code and redirect chain, telling you whether the web server answered at all. `traceroute <host>` (or `mtr`, below) shows where in the network path packets stop. On the server itself, `ss -tulpn` confirms the application is actually listening on the port you expect, and `systemctl status <service>` confirms the service is even running. Each rung tells you which layer to blame: network, DNS, the port/bind, or the service.',
     'Climb the stack: ping (network) → curl -I (HTTP) → traceroute (path) → ss -tulpn (listening?) → systemctl status (running?). Each step narrows the fault.', 0,
     'ping to the host fails but the site loads fine in a browser. Why is that possible?', '["The browser is cached", "Many hosts block ICMP, so ping can fail while HTTP works fine", "DNS is down", "The disk is full"]'::jsonb, 1),
    (v_course_id, v_net, 'Service won''t start, port not listening',
     E'When a service fails or crash-loops, `systemctl status <service>` gives the headline and a few recent lines, but the real error is in `journalctl -u <service> -xe` — the actual exception, missing file, or config syntax error. `systemctl cat <service>` prints the unit file so you can check `ExecStart`, paths, and user; `dmesg | tail` catches kernel-level causes like an OOM kill. A related symptom is "port not listening": the service claims to run but nothing accepts connections. `ss -tulpn | grep <port>` (or the older `netstat -tulpn`) shows what''s bound to the port, `lsof -i :<port>` shows which process, and if the process is listening on `127.0.0.1` it''s reachable locally but not externally. If the app is fine but external users still can''t connect, check the firewall: `firewall-cmd --list-ports` or `ufw status`.',
     'journalctl -u <svc> -xe has the real start error. For "port not listening", ss -tulpn shows the bind (127.0.0.1 vs 0.0.0.0); then check the firewall.', 1,
     'A service is running and `ss -tulpn` shows it listening on 127.0.0.1:8080, but remote users can''t connect. Most likely cause?', '["The disk is full", "It''s bound to localhost only (should be 0.0.0.0) and/or the firewall blocks the port", "DNS is misconfigured", "The CPU is overloaded"]'::jsonb, 1),
    (v_course_id, v_net, 'DNS failures and slow networks',
     E'When hostnames won''t resolve, `dig <domain>` (or `nslookup <domain>`) shows exactly what the DNS servers return; `cat /etc/resolv.conf` shows which resolvers the box is configured to use, and `systemd-resolve --status` shows the effective resolver on systemd hosts. The classic isolating test: `ping 8.8.8.8` — if pinging an IP works but resolving a name doesn''t, the network is fine and the problem is DNS configuration, not connectivity. For a network that''s merely *slow* rather than down, `mtr <host>` combines ping and traceroute to show per-hop latency and packet loss over time (far more useful than a single traceroute), `ip -s link` shows interface errors and dropped packets, and `ethtool <interface>` reports the negotiated link speed and duplex — a NIC that quietly fell back to 100Mbps half-duplex is a real and easily-missed cause of "the network is slow".',
     'ping 8.8.8.8 working while names fail = DNS config problem (check dig + /etc/resolv.conf). For slow networks, mtr shows per-hop loss/latency; ip -s link shows interface errors.', 2,
     '`ping 8.8.8.8` succeeds but `ping google.com` fails with "name resolution". What''s broken?', '["The internet connection", "DNS resolution/configuration, not connectivity", "The web server", "The firewall on port 80"]'::jsonb, 1)
    on conflict do nothing;

    -- ── Module: Access & System ───────────────────────────────────────────
    insert into cybersachet_modules (course_id, title, sort_order, interview_questions) values
      (v_course_id, 'Access & System', 6, '[
        {"question": "A user gets \"Permission denied\" on a file they think they should be able to read. How do you diagnose it?", "answer": "`ls -l` on the file for owner/group/mode, `id <user>` for their groups, and crucially `namei -l <path>` to walk every directory in the path — a missing execute bit on a parent directory blocks access even when the file itself is readable. `getfacl` reveals POSIX ACLs beyond the basic mode. For sudo specifically, `sudo -l` shows exactly what they''re allowed to run."},
        {"question": "Someone can''t SSH in. Where do you look?", "answer": "The auth log — `journalctl -xe` or `tail -f /var/log/auth.log` — shows the real reason (wrong key, account locked, PAM failure). `last -xe` shows recent logins/reboots, and `faillock --user <user>` shows whether repeated failures locked the account."},
        {"question": "The box rebooted unexpectedly. How do you find out why?", "answer": "`journalctl -k -b -1` reads the kernel log from the *previous* boot; `dmesg -T | tail -50` shows recent kernel messages with human timestamps. You''re looking for a kernel panic, an OOM kill, or a hardware error. Repeated unexplained crashes point at hardware, a driver, or failing memory."}
      ]'::jsonb) returning id into v_sys;

    insert into cybersachet_lessons (course_id, module_id, title, body, key_takeaway, sort_order, check_question, check_choices, check_correct_index) values
    (v_course_id, v_sys, 'Login failures and permission denied',
     E'For a login failure over SSH, the answer is in the auth log: `journalctl -xe` or `tail -f /var/log/auth.log` shows the real reason (bad key, wrong password, locked account, PAM rejection). `last -xe` lists recent logins and reboots, and `faillock --user <user>` shows whether too many failed attempts locked the account. For "permission denied" on a file, don''t stop at the file''s own `ls -l` — run `id <user>` to see the user''s groups and, most importantly, `namei -l <path>` to walk every directory in the path: a missing execute (`x`) bit on a *parent* directory blocks access even when the file itself is world-readable, which is the single most common cause of a confusing "denied". `getfacl <file>` reveals POSIX ACLs beyond the basic mode, and `sudo -l` shows exactly which commands a user may run with sudo.',
     'auth.log/journalctl explains failed logins. For "permission denied", namei -l walks the whole path — a parent dir missing +x is the usual culprit, not the file itself.', 0,
     'A file is `-rw-r--r--` (world-readable) but a user still gets "Permission denied" opening it. Most likely cause?', '["The file needs execute permission", "A parent directory in the path is missing execute (x) for that user", "The disk is full", "SELinux is always the cause"]'::jsonb, 1),
    (v_course_id, v_sys, 'Finding files and reading a crash',
     E'When a file or path is missing, `find / -name <file> 2>/dev/null` searches the whole tree (the redirect hides permission-denied noise), `locate <file>` is far faster if the `mlocate` database is present, `ls -lah <path>` inspects a specific location, and `stat <file>` shows exact timestamps and the inode. When the whole system crashes or reboots unexpectedly, the kernel log is where the truth is: `dmesg -T | tail -50` shows recent kernel messages with readable timestamps, and `journalctl -k -b -1` reads the kernel log from the *previous* boot — essential after a reboot, because the current boot''s log won''t contain the crash. A "kernel panic — not syncing" line, an OOM kill, or repeated hardware errors point respectively at a driver/filesystem issue, memory pressure, or failing hardware. `lsmod` lists loaded kernel modules and `free -h` confirms whether memory exhaustion was involved.',
     'find/locate/stat to track down files. After an unexpected reboot, journalctl -k -b -1 reads the PREVIOUS boot''s kernel log — that''s where the panic/OOM/hardware clue lives.', 1,
     'A server rebooted unexpectedly. Which command shows the kernel log from BEFORE the reboot?', '["dmesg (current only)", "journalctl -k -b -1", "systemctl status", "cat /var/log/syslog | head"]'::jsonb, 1)
    on conflict do nothing;

    -- ── Module: From Monitoring to Auto-Remediation ───────────────────────
    insert into cybersachet_modules (course_id, title, sort_order, interview_questions) values
      (v_course_id, 'From Monitoring to Auto-Remediation', 7, '[
        {"question": "What''s the difference between one-click and fully-automated remediation, and when do you use each?", "answer": "One-click keeps a human in the loop — the alert offers a button (\"Restart nginx\") that runs a vetted playbook on approval; use it for anything with blast radius or judgement. Fully-automated runs with no human for safe, well-understood, high-frequency fixes (restart a crashed stateless service, clear a temp cache). The safe default is suggest-and-approve; you graduate an action to fully-automatic only after it''s proven reliable."},
        {"question": "Why must every automated fix verify and be able to roll back?", "answer": "An unverified \"fix\" can make things worse silently. The loop must re-check the condition after acting (did the service return 200? did disk drop?), record the outcome, and undo the change if verification fails — otherwise you''ve automated an outage. Backup-before-change, test, reload, rollback-on-failure is the minimum safe pattern."},
        {"question": "What''s the simplest real self-healing you can add with zero extra tooling?", "answer": "A systemd override with Restart=always and RestartSec=5s — the init system restarts a crashed service automatically. It''s the first layer; a health-check script (curl the endpoint, restart + verify + escalate) on cron is the second, for cases where the process is alive but not actually serving."}
      ]'::jsonb) returning id into v_heal;

    insert into cybersachet_lessons (course_id, module_id, title, body, key_takeaway, sort_order, check_question, check_choices, check_correct_index) values
    (v_course_id, v_heal, 'Self-healing with systemd and health checks',
     E'The cheapest self-healing needs no extra tools: a systemd drop-in override with `Restart=always` and `RestartSec=5s` makes the init system automatically restart a service that crashes. But a process can be *alive and not working* — running yet returning 500s — so the second layer is an active health check. A small bash script curls the endpoint, reads the HTTP status, and if it isn''t 200 logs the event, restarts the service, then re-checks: if it recovered, log success; if not, escalate (in production, fire a Slack/PagerDuty webhook and open a P1). Scheduled every minute with cron, that script is a complete detect → act → verify → escalate loop. The key discipline is the *verify* step — never assume a restart worked; confirm it, and have a path for when it didn''t.',
     'Restart=always handles crashes; a curl-based health check on cron handles "alive but broken". Always verify recovery and escalate on failure — a blind auto-fix can hide an outage.', 0,
     'Why isn''t `Restart=always` alone enough for real self-healing?', '["It restarts too fast", "A process can be running but not actually serving (e.g. returning 500s) — you also need an active health check that verifies behavior", "It only works on Ubuntu", "It requires root"]'::jsonb, 1),
    (v_course_id, v_heal, 'How this platform automates remediation',
     E'Everything in this module is exactly what ITOps Solution''s own Self-Healing does — this is the theory behind a feature you can go use. Detection: an agent on the host reports metrics, and the platform detects a real condition (for example, disk usage crossing 90%). Decision: it maps the condition to a safe, allowlisted runbook action and creates a *proposed* remediation with a plain-language root cause — gated by an autonomy setting (Off / Suggest / Auto-heal) that defaults to requiring human approval. Action: on approval (or automatically, if the org opted in) the agent runs the fixed action — it never executes a raw command from the database — backing up first, testing, and rolling back on failure. Verify & close: the next scan confirms whether the condition actually cleared, recording "recovered" or "not improved" in an audit trail. The website security-header fix works the same way: propose the exact config, and apply it via the agent with backup/test/reload/rollback. Notice what''s deliberately *not* automated — a strict Content-Security-Policy is left for human review because it can break a site in ways a config test won''t catch. That judgement — which fixes are safe to automate and which aren''t — is the real SRE skill.',
     'Real auto-remediation = detect → propose (with autonomy gating) → apply a fixed, allowlisted action via an agent (backup/test/rollback) → verify → audit. Knowing what NOT to auto-apply is as important as the automation.', 1,
     'In a safe auto-remediation design, why apply only fixed allowlisted actions via an agent instead of running commands sent from the monitoring system?', '["It''s faster", "It bounds the blast radius — the agent can only run vetted actions, never arbitrary remote commands", "It avoids writing any logs", "It removes the need to verify"]'::jsonb, 1)
    on conflict do nothing;

    insert into cybersachet_quiz_questions (course_id, question, choices, question_type, correct_index, sort_order) values
    (v_course_id, 'A server is slow. Which command best identifies whether the bottleneck is CPU, memory, or disk I/O?', '["df -h", "vmstat 1", "ls -l", "dig example.com"]'::jsonb, 'single', 1, 10),
    (v_course_id, 'df -h shows free space but you get "No space left on device". What''s the likely cause?', '["The CPU is full", "Exhausted inodes (check df -i) or a deleted-but-open file", "DNS failure", "A firewall rule"]'::jsonb, 'single', 1, 11),
    (v_course_id, 'ping 8.8.8.8 works but ping google.com fails. What is broken?', '["The network cable", "DNS resolution/configuration", "The web server", "The disk"]'::jsonb, 'single', 1, 12),
    (v_course_id, 'A service is running but returns errors; you want it to auto-recover. What is the minimum safe pattern?', '["rm the logs on a schedule", "Detect via health check, restart, then VERIFY recovery and escalate if it fails", "Reboot the server hourly", "Increase RAM"]'::jsonb, 'single', 1, 13),
    (v_course_id, 'Why is a strict Content-Security-Policy deliberately left out of automatic apply?', '["CSP is deprecated", "A strict CSP can break a working site in ways an nginx config test won''t catch — it needs human review", "It''s not a real header", "Agents can''t write it"]'::jsonb, 'single', 1, 14)
    on conflict do nothing;

  end if;
end $$;

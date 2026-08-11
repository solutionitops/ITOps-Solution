-- New Moonsav ITOps Academy course: "Red Hat Enterprise Linux Essential
-- Training". Built directly from the Red Hat Certified System Engineer
-- (EX300) exercise material in Red_Hat_System_Engineer/ — Chapter 1
-- (systemd services & targets, vi/vim, /etc/fstab, SELinux) and Chapter 2
-- (shell variables, conditionals, loops, user input, process management).
-- Every command taught is from those real cheat sheets; a few command
-- corrections are made where the source simplified (e.g. real default
-- targets are multi-user.target / graphical.target).
--
-- Designed to grow: later chapters in the same source (LVM/disks, MariaDB,
-- networking/firewalld, DNS, Apache, NFS, Samba, mail, SSH) can be added as
-- additional modules using this exact additive pattern. Same real-content
-- discipline as every other Academy course; additive and idempotent.

insert into cybersachet_courses (slug, title, description, level, estimated_minutes, published, sort_order, category, min_plan, free_tier, track, capstone) values
  ('rhel-essential-training', 'Red Hat Enterprise Linux Essential Training',
   'Hands-on Red Hat Enterprise Linux for real system administration and RHCE (EX300) prep: managing services with systemd, boot targets, editing config with vi, filesystems and /etc/fstab, and SELinux — then bash scripting and process management to automate it all.',
   'intermediate', 150, true, 120, 'infrastructure', 'PROFESSIONAL', false, 'academy',
   '{
      "title": "Write a RHEL service health-check and audit script",
      "description": "Combine everything from both chapters into one real admin script — the kind you would actually schedule on a production RHEL box.",
      "requirements": [
        "Accept a service name via a -s option using getopts, with a -h help option",
        "Use systemctl is-active to check the service; if it is not active, restart it with systemctl restart and log the action",
        "After restarting, re-check and record whether recovery succeeded (verify, do not assume)",
        "Append every run to a timestamped log file using the userlog.sh pattern ($(date ...), >> logfile)",
        "Loop over a list of services so one run can check several at once",
        "Use an if/[[ ]] conditional on the exit status ($?) and exit non-zero if any service could not be recovered",
        "Note the systemd unit override (Restart=always) that complements the script, and confirm the script is not blocked by SELinux (check its context / audit.log)"
      ],
      "deliverable": "Your health-check script, a sample of its log output, and a one-paragraph note on how you would schedule it (cron or a systemd timer) and how it maps to real monitoring. Self-assessed against the checklist — the goal is a working, safe admin script you fully understand."
    }'::jsonb)
on conflict (slug) do nothing;

-- Named dollar-quote tag ($rhel$) because a lesson body legitimately contains
-- the bash variable $$ (the shell's PID) — a plain $$ block tag would be
-- closed early by it.
do $rhel$
declare
  v_course_id uuid;
  v_ch1 uuid;
  v_ch2 uuid;
begin
  select id into v_course_id from cybersachet_courses where slug = 'rhel-essential-training';
  if v_course_id is null then return; end if;

  if not exists (select 1 from cybersachet_modules where course_id = v_course_id) then

    insert into cybersachet_modules (course_id, title, sort_order, interview_questions) values
      (v_course_id, 'Chapter 1 — Core RHEL Administration', 0, '[
        {"question": "How do you make a service run now AND survive a reboot on RHEL?", "answer": "Two separate actions: systemctl start <svc> runs it now; systemctl enable <svc> makes it start on boot. enable --now does both. status/is-active/is-enabled let you confirm each independently — a service can be running but not enabled, or enabled but currently stopped."},
        {"question": "SELinux is blocking a service that has correct file permissions. Walk me through fixing it properly.", "answer": "Don''t disable SELinux. Confirm the denial in /var/log/audit/audit.log (or sealert/ausearch), then in most cases the fix is the file context: restorecon -v on the path resets it to the policy default, or semanage fcontext adds a persistent rule for a non-standard path. If it''s a supported feature toggle, flip the boolean with setsebool -P. Only for a genuinely new, legitimate access do you build a module with audit2allow."},
        {"question": "What are the six fields of an /etc/fstab line?", "answer": "device (LABEL=/UUID=/path), mountpoint, filesystem type, mount options, dump (0/1), and the fsck pass order (0 = skip, 1 = root, 2 = other filesystems). Use UUID or LABEL rather than /dev names so a disk reorder doesn''t break boot, and test changes with mount -a before rebooting."}
      ]'::jsonb) returning id into v_ch1;

    insert into cybersachet_modules (course_id, title, sort_order, interview_questions) values
      (v_course_id, 'Chapter 2 — Bash Scripting & Process Management', 1, '[
        {"question": "What''s the difference between $@ and $* in a script, and why does quoting matter?", "answer": "Both expand to all positional arguments, but \"$@\" expands to each argument as a separate quoted word (what you almost always want, so arguments with spaces stay intact), while \"$*\" joins them into a single string separated by IFS. Unquoted, both word-split. The habit that prevents most script bugs is quoting variable expansions."},
        {"question": "How do you parse command-line options like -s <name> -h in a bash script?", "answer": "getopts in a while loop: while getopts \":s:h\" opt; do case $opt in s) NAME=$OPTARG;; h) usage;; \\?) echo bad option;; esac; done, then shift $((OPTIND-1)) to drop the parsed options and leave the remaining positional arguments. The leading colon enables silent error handling; a colon after a letter means that option takes an argument (in $OPTARG)."},
        {"question": "A process needs to be reloaded after a config change without dropping connections. Which signal, and how?", "answer": "SIGHUP: kill -HUP <pid> (or pkill -HUP <name>) tells most daemons to re-read their config in place. kill (SIGTERM) asks it to stop gracefully; kill -9 (SIGKILL) forces it and should be the last resort because the process can''t clean up. Find the PID first with pgrep or pidof."}
      ]'::jsonb) returning id into v_ch2;

    insert into cybersachet_lessons (course_id, module_id, title, body, key_takeaway, sort_order, check_question, check_choices, check_correct_index) values
    (v_course_id, v_ch1, 'Managing services with systemd',
     E'On RHEL 7+, systemd manages every background service and systemctl is the one tool you use. `systemctl start httpd`, `stop`, `restart`, and `reload` (re-read config without a full restart) control a service now; `systemctl status httpd` shows whether it''s running plus its recent log lines. Runtime state and boot state are separate: `systemctl enable httpd` makes it start automatically on boot (and `disable` stops that), while `systemctl is-enabled httpd` and `is-active httpd` report each independently — a service can be running but not enabled, or enabled but stopped. `systemctl list-units -t service --all` shows current services, `list-unit-files -t service` shows every installed unit and its enablement. To hard-block a service so it can''t be started even as a dependency, `systemctl mask` it (and `unmask` to reverse). These replace the legacy `service` and `chkconfig` commands you''ll still see in older docs.',
     'systemctl is the single service tool: start/stop/restart/reload/status for now, enable/disable for boot, mask to hard-block. Runtime state and boot state are independent.', 0,
     'Which command makes a service start automatically on every boot?', '["systemctl start httpd", "systemctl enable httpd", "systemctl status httpd", "systemctl mask httpd"]'::jsonb, 1),

    (v_course_id, v_ch1, 'Boot targets and system state',
     E'systemd replaces the old numbered runlevels with named targets. The two you manage most are `multi-user.target` (full text-mode multi-user system — the normal server default) and `graphical.target` (adds the GUI). `systemctl get-default` shows the boot target and `systemctl set-default multi-user.target` changes it. To switch the running system to a target without rebooting, `systemctl isolate multi-user.target`; `systemctl rescue` drops to single-user rescue mode for repairs. Power state is also systemctl: `reboot`, `poweroff`, and `halt`. When a machine boots slowly, `systemd-analyze blame` lists each unit by how long it took to initialize, so you can see exactly what''s delaying startup — the first thing to run on a "why is boot slow" ticket.',
     'Targets replaced runlevels: multi-user.target (text) and graphical.target (GUI). get-default/set-default control boot; systemd-analyze blame finds slow-starting units.', 1,
     'A RHEL server boots slowly. Which command shows which units are taking the longest?', '["systemctl status", "systemd-analyze blame", "systemctl isolate", "uptime"]'::jsonb, 1),

    (v_course_id, v_ch1, 'Editing configuration with vi/vim',
     E'vi (vim) is on every Linux system, so it''s the editor you must be able to use, especially in rescue mode where nothing else exists. It has three modes: command mode (the default — keystrokes are commands), insert mode (`i` to enter, type normally), and ex mode (`:` for line commands). `Esc` always returns to command mode. Saving and quitting are ex commands: `:w` writes, `:q` quits, `:q!` quits discarding changes, and `:wq` (or `:x`) saves and quits. In command mode the daily verbs are `yy` (copy a line), `5yy` (copy 5), `p` (paste), `dd` (delete/cut a line), `5dd`, `x` (delete a character), and `u` (undo). Search with `/text` (forward), `?text` (back), then `n`/`N` for next/previous. `:set number` shows line numbers — handy when an error message points at a line.',
     'Esc returns to command mode; :wq saves and quits, :q! discards. yy/dd/p edit lines and /text searches — the core you need to fix a config file anywhere.', 2,
     'You opened a config file, made changes you now want to throw away, and need to exit. Which command?', '[":wq", ":w", ":q!", ":set number"]'::jsonb, 2),

    (v_course_id, v_ch1, 'Filesystems and /etc/fstab',
     E'/etc/fstab tells the system what to mount at boot and how. Each line has six fields: (1) the device — best given as `UUID=` or `LABEL=` rather than a `/dev/sdaN` name, because device names can change when disks are reordered; (2) the mountpoint; (3) the filesystem type (xfs, ext4, swap, nfs...); (4) mount options (`defaults`, or things like `ro`, `noexec`, `nofail`); (5) the dump flag (0 = don''t back up, 1 = do); and (6) the fsck pass order at boot — 0 skips the check, 1 is reserved for the root filesystem, and 2 for everything else. After editing fstab, always run `mount -a` to mount everything and catch typos *before* you reboot — a bad fstab entry can leave a server unable to boot.',
     'fstab''s six fields: device, mountpoint, fstype, options, dump, fsck-pass. Use UUID/LABEL not /dev names, and test with mount -a before rebooting.', 3,
     'What does the 6th field of an /etc/fstab line control?', '["Whether to back up the partition", "The fsck check order at boot (0 = skip)", "The mount options", "The filesystem type"]'::jsonb, 1),

    (v_course_id, v_ch1, 'SELinux essentials',
     E'SELinux is mandatory access control layered on top of normal permissions — a process can have Unix permission to a file and still be denied by SELinux policy. Check the mode with `getenforce` or `sestatus`; `setenforce 0` (permissive) / `setenforce 1` (enforcing) toggles it at runtime, and `/etc/selinux/config` sets it persistently — but the right instinct is to keep it enforcing, not disable it. Everything has a context; the *type* is what matters. View it with `ls -Z` (files), `ps -Z` (processes), and `id -Z` (your user). When a service works in permissive mode but is denied in enforcing, the cause is almost always a wrong file context: `restorecon -v <path>` resets a file to the policy default (the most common fix), `chcon` sets one temporarily, and `semanage fcontext` adds a persistent rule for a non-standard location. Feature toggles are booleans — `getsebool -a` lists them, `setsebool -P <bool> on` sets one permanently. Denials are logged to `/var/log/audit/audit.log`; `sealert`/`ausearch` translate them into plain language, and for a genuinely new legitimate access you can build a module with `audit2allow`.',
     'Keep SELinux enforcing. Read the denial (audit.log/sealert), then fix the context (restorecon) or flip a boolean (setsebool -P) — audit2allow only for a real new access. ls -Z/ps -Z/id -Z show contexts.', 4,
     'A service runs fine with SELinux permissive but is denied when enforcing. What''s the best FIRST fix?', '["Permanently disable SELinux", "Check the denial and restore the correct file context / boolean", "Run everything as root", "Delete /var/log/audit/audit.log"]'::jsonb, 1),

    (v_course_id, v_ch2, 'Shell variables',
     E'Scripts run on variables. Positional variables carry arguments: `$0` is the script name, `$1`–`$9` the first nine arguments (`${10}` and up need braces), `$#` is the count, `"$@"` is all arguments as a list (each preserved as its own word), and `$*` is all arguments joined into one string. Special variables report state: `$?` is the exit status of the last command (0 = success — the value every script checks), `$$` is the current shell''s PID, and `$!` is the PID of the last backgrounded process. Environment/shell variables describe the session: `$PWD`, `$HOME`, `$UID`, `$PATH`, `$IFS` (the field separator), and `$SECONDS`. The single most important habit is quoting: write `"$var"` (not `$var`) so values with spaces aren''t split into multiple words — the source of a large share of script bugs.',
     '$1..$9 are arguments, $# the count, "$@" the list, $? the last exit status. Always quote "$var" to prevent word-splitting.', 0,
     'Which variable holds the exit status (success/failure) of the command that just ran?', '["$!", "$#", "$?", "$$"]'::jsonb, 2),

    (v_course_id, v_ch2, 'Conditionals and tests',
     E'Bash decisions use test expressions. Use `[[ ]]` for strings and files and `(( ))` for arithmetic. Numeric comparisons inside `[[ ]]` use letter operators: `-eq` (equal), `-ne`, `-lt`, `-le`, `-gt`, `-ge` — e.g. `if [[ $count -gt 10 ]]`. String comparisons use symbols: `=` / `!=`, `==` with a wildcard pattern, `=~` for a regular expression, `-z` (empty) and `-n` (non-empty). File tests are essential in admin scripts: `-e` (exists), `-f` (is a regular file), `-d` (is a directory), and `-r` / `-w` / `-x` (readable/writable/executable), plus `-s` (exists and non-empty). `(( ))` does math with the familiar `==`, `<`, `>`. Combine conditions with `&&` (and), `||` (or), and `!` (not), either between `[ ]` tests or inside a single `[[ ]]`.',
     '[[ ]] tests strings/files — -eq for numbers, = for strings, -f/-d/-e for files; (( )) does arithmetic; combine with && || !.', 1,
     'Inside [[ ]], which operator tests whether two NUMBERS are equal?', '["=", "==", "-eq", "-z"]'::jsonb, 2),

    (v_course_id, v_ch2, 'Loops and control flow',
     E'Admin scripts are built from a handful of blocks. `if ... then ... elif ... else ... fi` branches on conditions. `case $VAR in pattern) commands ;; *) default ;; esac` matches a variable against many fixed patterns — cleaner than a stack of ifs (each branch ends in `;;`). Iteration comes in four shapes: `for ITEM in a b c; do ...; done` loops over a list; the C-style `for (( i=0; i<=5; i++ )); do ...; done` loops by count; `while [ condition ]; do ...; done` repeats while true; and `until [ condition ]; do ...; done` repeats until true. `select` builds a quick numbered menu (it uses the `$PS3` prompt) and pairs naturally with `case`. `break` exits a loop early and `continue` skips to the next iteration.',
     'if/elif/else for branches, case for many patterns, for/while/until for iteration, select for menus — the building blocks of every admin script.', 2,
     'You need to match one variable against many fixed values (start/stop/restart). Which construct is cleanest?', '["A long if/elif chain", "a case statement", "a while loop", "a select menu"]'::jsonb, 1),

    (v_course_id, v_ch2, 'Reading user input',
     E'Interactive scripts read input with `read`. `read NAME` assigns whatever the user types to `$NAME`; `read -p "Enter name: " NAME` prints the prompt on the same line; giving multiple variable names (`read -p "First and last: " FIRST LAST`) splits the words across them. Two flags matter for real tools: `read -s` hides typed input (for passwords), and `read -t 5` times out after 5 seconds, returning non-zero so you can handle "no answer" in an `if`. For proper command-line *options* (flags like `-s <name> -h`), use `getopts` in a `while` loop with a `case`: `while getopts ":s:h" opt; do case $opt in s) NAME=$OPTARG;; h) usage;; esac; done` — `$OPTARG` holds an option''s argument, and `shift $((OPTIND-1))` afterward drops the parsed options so remaining `$1 $2...` are the normal arguments.',
     'read (-p prompt, -s silent, -t timeout) for interactive input; getopts + case + $OPTARG + shift for -flag options on a script.', 3,
     'Which read flag hides the user''s typing, for entering a password?', '["-p", "-t", "-s", "-a"]'::jsonb, 2),

    (v_course_id, v_ch2, 'Managing processes',
     E'Finding and controlling processes is core admin work. `ps -ef` lists every process with full detail; `ps -ejH` or `pstree` shows the parent/child tree; `ps -eo pid,user,args --sort user` picks and sorts custom columns. To find a specific one, `pgrep -u root sshd` searches by name/user and `pidof crond` returns its PID. Signals control them: plain `kill <pid>` sends SIGTERM (graceful stop), `kill -HUP <pid>` tells many daemons to reload their config without restarting, and `kill -9 <pid>` sends SIGKILL (forced — last resort, because the process can''t clean up); `pkill <name>` signals by name. Priority is set with `nice -n <n> <cmd>` at launch and `renice <n> -p <pid>` for a running one (lower number = higher priority). To watch live use `top`; `lsof` lists open files (and which process holds them); and `nohup <cmd> &` runs something that survives you logging out.',
     'ps/pgrep/pidof to find, kill/-HUP/-9 and pkill to signal, nice/renice for priority, top/lsof to inspect, nohup & to detach from your session.', 4,
     'Which signal asks a daemon to re-read its config WITHOUT fully restarting it?', '["kill -9 (SIGKILL)", "kill -HUP (SIGHUP)", "kill -STOP", "nice"]'::jsonb, 1)
    on conflict do nothing;

    insert into cybersachet_quiz_questions (course_id, question, choices, question_type, correct_index, sort_order) values
    (v_course_id, 'Which command starts a service now AND on every future boot?', '["systemctl status httpd then reboot", "systemctl start httpd && systemctl enable httpd", "systemctl mask httpd", "chkconfig httpd"]'::jsonb, 'single', 1, 0),
    (v_course_id, 'What is the normal boot target for a text-mode RHEL server (no GUI)?', '["graphical.target", "rescue.target", "multi-user.target", "runlevel5"]'::jsonb, 'single', 2, 1),
    (v_course_id, 'A service is denied by SELinux despite correct file permissions. Best practice?', '["setenforce 0 permanently", "Read audit.log and fix the context with restorecon / set the right boolean", "Delete the SELinux package", "Run the service as root"]'::jsonb, 'single', 1, 2),
    (v_course_id, 'In a script, which is the safest way to expand all arguments preserving spaces?', '["$*", "\"$@\"", "$#", "$!"]'::jsonb, 'single', 1, 3),
    (v_course_id, 'Which construct parses -flags like -s <name> in a bash script?', '["read -p", "getopts in a while/case loop", "a for loop", "$1 $2 directly"]'::jsonb, 'single', 1, 4),
    (v_course_id, 'You need to forcibly kill a hung process that ignores a normal stop. Which?', '["kill -HUP <pid>", "kill <pid>", "kill -9 <pid>", "nice -9 <pid>"]'::jsonb, 'single', 2, 5)
    on conflict do nothing;

  end if;
end $rhel$;

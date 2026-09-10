// Educational Knowledge Checkpoints (3 questions per lesson) for CyberSachet Ops & Engineering Courses (9-17)
// Keys match by courseId or course slug, then by lessonId.
// Each checkpoint contains:
//   - question: string
//   - choices: string[4] (randomized positions A-D)
//   - correctIndex: number (0-3)
//   - explanation: string (in-depth operational/technical reasoning)

export const OPS_CHECKPOINTS = {
  "local-linux-fundamentals": {
    "l1": [
      {
        question: "Why do production Linux servers rarely install or run graphical desktop environments (GUI)?",
        choices: ["Terminals cannot connect to monitors", "Linux kernels do not support mouse drivers", "Linux GUIs are copyrighted by Apple", "Headless servers conserve memory and CPU while dramatically reducing the software attack surface"],
        correctIndex: 3,
        explanation: "Running headless eliminates X11/Wayland dependencies, frees hundreds of megabytes of RAM, and eliminates GUI vulnerabilities from production infrastructure."
      },
      {
        question: "What environment variable stores the list of directories the shell searches when executing a command?",
        choices: ["$PATH", "$USER", "$HOME", "$SHELL"],
        correctIndex: 0,
        explanation: "$PATH contains colon-separated directory paths. When you type a command, bash searches these directories sequentially for the executable."
      },
      {
        question: "What is the primary function of the Linux kernel in contrast to the user-space shell?",
        choices: ["Compiling python applications", "Directly managing hardware resources, memory, CPU scheduling, and hardware drivers via system calls", "Displaying the bash prompt", "Formatting web pages"],
        correctIndex: 1,
        explanation: "The kernel operates in ring 0, managing physical memory, device I/O, process context switching, and hardware abstraction."
      }
    ],
    "l2": [
      {
        question: "What is the difference between an absolute path and a relative path in Linux navigation?",
        choices: ["There is no functional difference", "Absolute paths begin at the filesystem root (/); relative paths calculate from the current working directory", "Relative paths only work for directories", "Absolute paths require sudo privileges"],
        correctIndex: 1,
        explanation: "An absolute path starts from root (/var/log) and resolves unambiguously from anywhere. A relative path (../logs) depends strictly on where your shell is located."
      },
      {
        question: "What does the command 'ls -la' display that a simple 'ls' omits?",
        choices: ["CPU temperature", "All network sockets", "Hidden files (beginning with a dot), file permissions, ownership, byte size, and last modification timestamps", "Kernel version information"],
        correctIndex: 2,
        explanation: "-a includes hidden dotfiles (like .bashrc), while -l renders long-format output with octal permissions, ownership, size, and date."
      },
      {
        question: "What command creates a multi-level nested directory structure in a single step without error?",
        choices: ["touch -d /opt/app/v2/config", "rmdir -r /opt/app/v2/config", "mkdir /opt/app/v2/config", "mkdir -p /opt/app/v2/config"],
        correctIndex: 3,
        explanation: "The -p (parents) flag automatically creates any missing parent directories along the path without failing if intermediate directories do not yet exist."
      }
    ],
    "l3": [
      {
        question: "Why is 'less' strongly preferred over 'cat' when viewing a 20GB production log file?",
        choices: ["less pages through files dynamically without loading the entire 20GB into RAM, preventing out-of-memory crashes", "cat is deprecated in Linux", "less automatically deletes corrupted lines", "cat can only display text in black and white"],
        correctIndex: 0,
        explanation: "cat reads the entire file into stdout, exhausting memory on large files. less streams buffers on demand without RAM exhaustion."
      },
      {
        question: "What command displays new log entries appending in real-time as an application writes to /var/log/app.log?",
        choices: ["grep -r /var/log/app.log", "tail -f /var/log/app.log", "wc -l /var/log/app.log", "head -n 20 /var/log/app.log"],
        correctIndex: 1,
        explanation: "The -f (follow) flag keeps the file open and continuously prints newly appended lines to standard output as they are written."
      },
      {
        question: "Which grep command recursively searches for the string 'FATAL' in all files under /etc/ ignoring case sensitivity?",
        choices: ["locate 'FATAL'", "grep 'FATAL' /etc/", "find /etc/ -name FATAL", "grep -ri 'FATAL' /etc/"],
        correctIndex: 3,
        explanation: "-r performs recursive descent through subdirectories, while -i enables case-insensitive pattern matching."
      }
    ],
    "l4": [
      {
        question: "What do the numeric permissions '755' represent on a Linux directory?",
        choices: ["Read only for all users", "No execute permission for anyone", "Read/write/execute for owner, read/execute for group and others", "Full access for everyone"],
        correctIndex: 2,
        explanation: "In octal notation: Owner = 7 (rwx), Group = 5 (r-x), Others = 5 (r-x)."
      },
      {
        question: "Why must directories have the execute (x) permission bit set for users to enter them?",
        choices: ["It enables disk encryption", "Directories are executable binaries", "It allows directories to be renamed", "The execute bit on directories grants search permission to traverse into the folder and access files inside"],
        correctIndex: 3,
        explanation: "On directories, the 'x' bit governs the ability to cd into the directory and resolve paths to items inside it."
      },
      {
        question: "What command changes the owner of /var/www/html to user 'nginx' and group 'web' recursively?",
        choices: ["chown -R nginx:web /var/www/html", "chmod -R 755 /var/www/html", "usermod -aG nginx /var/www/html", "chgrp root /var/www/html"],
        correctIndex: 0,
        explanation: "chown -R sets user and group ownership simultaneously across the target directory and all files/folders underneath it."
      }
    ],
    "l5": [
      {
        question: "What security risk does an improperly configured SUID (Set Owner User ID) binary pose?",
        choices: ["It unmounts the root filesystem", "It deletes user passwords", "It slows down CPU clock frequency", "It executes with the privileges of the file owner (often root) regardless of who runs it, potentially enabling privilege escalation"],
        correctIndex: 3,
        explanation: "SUID (chmod u+s) executes the binary with the owner's privileges (e.g. root). If the binary has command injection bugs, unprivileged users can obtain root."
      },
      {
        question: "What does the 'Sticky Bit' (chmod +t) enforce when set on shared directories like /tmp?",
        choices: ["Files cannot be read by anyone", "Files are stored in RAM permanently", "Only the file's owner or root can delete or rename files in that directory, preventing users from deleting coworkers' files", "It compresses all incoming files"],
        correctIndex: 2,
        explanation: "In shared writable directories, the sticky bit restricts deletion rights so that only the owner of a file (or root) can delete it."
      },
      {
        question: "What does the SGID (Set Group ID) bit do when applied to a shared collaborative directory?",
        choices: ["It denies group access", "All newly created files inside the directory automatically inherit the parent directory's group rather than the creator's primary group", "It prevents group members from logging in", "It deletes the group account"],
        correctIndex: 1,
        explanation: "SGID on a directory (chmod g+s) forces all newly created files to inherit the directory's owning group automatically."
      }
    ],
    "l6": [
      {
        question: "What is the difference between sending SIGTERM (kill -15) and SIGKILL (kill -9) to a process?",
        choices: ["SIGTERM is faster than SIGKILL", "SIGTERM politely requests the process shut down cleanly; SIGKILL is uncatchable by the process and causes immediate kernel termination", "SIGKILL only works on root processes", "SIGTERM reboots the server"],
        correctIndex: 1,
        explanation: "Processes can catch SIGTERM to flush buffers and close connections cleanly. SIGKILL terminates the process in the kernel immediately."
      },
      {
        question: "What does an unexpected surge in 'Load Average' accompanied by high 'iowait' (%wa in top) indicate?",
        choices: ["Processes are stalled waiting for disk storage or network I/O operations to complete rather than CPU starvation", "The system is completely idle", "Network bandwidth has doubled", "A CPU overclocking event"],
        correctIndex: 0,
        explanation: "High load average with high %wa means CPU cores are waiting on slow disk reads/writes rather than computational bottleneck."
      },
      {
        question: "What is a 'Zombie Process' (<defunct> in ps output) and why doesn't kill -9 eliminate it?",
        choices: ["A corrupted systemd service", "A virus that attacks memory", "A completed process that has terminated, but whose parent process has not yet read its exit status via wait()", "A process that runs backwards"],
        correctIndex: 2,
        explanation: "Zombie processes consume no CPU or RAM—they are dead processes whose entry remains in the process table until the parent reads its exit code."
      }
    ],
    "l7": [
      {
        question: "What is the difference between a low-level package manager (rpm/dpkg) and a high-level package manager (dnf/apt)?",
        choices: ["dpkg compiles source code", "apt does not install software", "High-level package managers automatically resolve, download, and install necessary dependencies from remote repositories", "rpm only works on 32-bit systems"],
        correctIndex: 2,
        explanation: "Low-level tools install local files directly. High-level package managers resolve full dependency trees from online repositories."
      },
      {
        question: "What command verifies the cryptographic integrity and package checksums of all installed files for an RPM package?",
        choices: ["rpm -V <package-name>", "rpm -e <package-name>", "rpm -qa", "dnf clean all"],
        correctIndex: 0,
        explanation: "rpm -V verifies file sizes, MD5/SHA256 hashes, permissions, and timestamps against the original signed RPM database."
      },
      {
        question: "Why should administrators periodically run 'dnf clean all' or 'apt clean' on production servers?",
        choices: ["It deletes user passwords", "It restarts the Linux kernel", "It resets network interfaces", "It clears out cached package headers, old repository metadata, and downloaded installer packages to reclaim disk space"],
        correctIndex: 3,
        explanation: "Package managers cache downloaded archives in /var/cache. Cleaning the cache reclaims disk space on root partitions."
      }
    ],
    "l8": [
      {
        question: "What is the operational difference between 'systemctl restart' and 'systemctl reload'?",
        choices: ["Reload deletes log files", "Reload instructs the service daemon to re-read configuration files without terminating active worker connections; restart completely kills and restarts the process", "They are identical commands", "Restart only works on Saturdays"],
        correctIndex: 1,
        explanation: "Reload provides zero downtime by rereading config files in place. Restart terminates existing connections abruptly."
      },
      {
        question: "What does 'systemctl enable nginx' accomplish that 'systemctl start nginx' does not?",
        choices: ["It installs nginx from the internet", "It immediately starts the service in RAM", "It enables debug logging", "It creates a symbolic link in the systemd multi-user.target.wants directory, ensuring the service boots automatically upon server startup"],
        correctIndex: 3,
        explanation: "enable configures persistent boot startup by symlinking unit files into the target directories parsed during init."
      },
      {
        question: "What command retrieves real-time streaming systemd logs specifically for the nginx service?",
        choices: ["journalctl -u nginx -f", "tail /dev/null", "dmesg -n", "cat /var/log/messages"],
        correctIndex: 0,
        explanation: "journalctl -u filters by systemd unit name, while -f follows log output dynamically, showing exact startup errors."
      }
    ],
    "l9": [
      {
        question: "In a crontab entry, what does the schedule expression '*/15 * * * *' specify?",
        choices: ["Every 15 minutes", "At 15 minutes past every hour", "At 3:00 PM every day", "On the 15th of every month"],
        correctIndex: 0,
        explanation: "The step value */15 in the first field instructs cron to trigger the command every 15 minutes of every hour."
      },
      {
        question: "Why do scripts that run fine interactively in bash frequently fail when executed under cron?",
        choices: ["Cron only executes python scripts", "Cron requires root access for all tasks", "Cron uses a minimal, stripped $PATH environment variable that doesn't include custom binary paths like /usr/local/bin", "Cron disables network access"],
        correctIndex: 2,
        explanation: "Cron runs with a minimal $PATH (often /usr/bin:/bin). Production cron scripts must define full $PATH or use absolute paths."
      },
      {
        question: "What does the cron redirection '>/dev/null 2>&1' accomplish?",
        choices: ["It forces the script to run twice", "It discards both standard output (stdout) and standard error (stderr), preventing cron from generating local system emails", "It deletes the script", "It sends logs to the printer"],
        correctIndex: 1,
        explanation: ">/dev/null redirects stdout to the bit-bucket, and 2>&1 redirects stderr to stdout, suppressing console output."
      }
    ],
    "l10": [
      {
        question: "What command displays filesystem disk space utilization in human-readable gigabytes and megabytes?",
        choices: ["fdisk -l", "lsblk -p", "free -m", "df -h"],
        correctIndex: 3,
        explanation: "df (disk free) with the -h flag shows mounted filesystem sizes, used space, and percentage utilization in MB/GB."
      },
      {
        question: "What is an 'inode' in a Linux filesystem and what happens when inodes are 100% exhausted?",
        choices: ["A swap partition", "A filesystem data structure storing file metadata; when exhausted, no new files can be created even if free gigabytes of disk space remain", "An internet connection node", "A CPU core register"],
        correctIndex: 1,
        explanation: "Every file requires an inode. Generating millions of tiny session or cache files exhausts inodes, producing 'No space left on device' errors."
      },
      {
        question: "What is the role of the /etc/fstab configuration file?",
        choices: ["It defines system user passwords", "It manages firewall tables", "It defines static filesystem mount configurations, file system types, and mount options applied automatically during boot", "It configures DNS nameservers"],
        correctIndex: 2,
        explanation: "/etc/fstab tells the kernel which block devices (by UUID) to mount to which directories with what options at startup."
      }
    ],
    "l11": [
      {
        question: "What are the three hierarchical architectural layers of the Logical Volume Manager (LVM)?",
        choices: ["RAID 0, RAID 1, RAID 5", "Folder, Subfolder, File", "Physical Volumes (PV) -> Volume Groups (VG) -> Logical Volumes (LV)", "Master Boot Record, Extended Partition, Logical Partition"],
        correctIndex: 2,
        explanation: "LVM pools raw disk partitions into Physical Volumes (PVs), combines them into Volume Groups (VGs), and carves out flexible Logical Volumes (LVs)."
      },
      {
        question: "What is the primary operational advantage of LVM over traditional static disk partitions?",
        choices: ["LVM makes disks spin faster", "Logical volumes and volume groups can be dynamically expanded online without unmounting filesystems or rebooting the server", "LVM eliminates the need for backups", "LVM encrypts all files automatically"],
        correctIndex: 1,
        explanation: "LVM allows online resizing. If /var fills up, administrators can run lvextend and xfs_growfs in seconds with zero downtime."
      },
      {
        question: "What command extends a logical volume named 'lv_data' in volume group 'vg_app' by 50GB and resizes the underlying filesystem in one step?",
        choices: ["lvextend -L +50G -r /dev/vg_app/lv_data", "mkfs.xfs -size +50G /dev/vg_app/lv_data", "lvcreate -L 50G vg_app", "fdisk /dev/vg_app/lv_data"],
        correctIndex: 0,
        explanation: "The -r (resizefs) flag tells lvextend to automatically invoke the underlying filesystem resizer immediately after volume expansion."
      }
    ],
    "l12": [
      {
        question: "Which modern Linux utility suite replaces deprecated legacy tools like ifconfig, netstat, and route?",
        choices: ["iproute2 (commands: ip addr, ip route, ss)", "curl and wget", "syslogd", "iptables"],
        correctIndex: 0,
        explanation: "iproute2 is the standard modern stack: 'ip addr' replaces 'ifconfig', 'ip route' replaces 'route', and 'ss' replaces 'netstat'."
      },
      {
        question: "What command displays all currently listening TCP sockets and associated process names on a server?",
        choices: ["traceroute 8.8.8.8", "cat /etc/hosts", "ping -c 4 localhost", "ss -tulpn"],
        correctIndex: 3,
        explanation: "ss -tulpn displays TCP (-t), UDP (-u), listening (-l), process names (-p), and numeric ports (-n)."
      },
      {
        question: "What file configures local static hostname-to-IP mappings on a Linux system, resolving before external DNS?",
        choices: ["/etc/networks", "/etc/resolv.conf", "/etc/hosts", "/etc/nsswitch.conf"],
        correctIndex: 2,
        explanation: "/etc/hosts maps hostnames directly to IP addresses locally. The OS checks /etc/hosts before querying external DNS nameservers."
      }
    ],
    "l13": [
      {
        question: "Why is SSH public key authentication vastly superior to password authentication for server access?",
        choices: ["Keys only work on LAN networks", "Passphrases disable user logs", "Keys require no configuration", "Asymmetric cryptographic keys (e.g. Ed25519) are immune to brute-force dictionary attacks and enable secure automation"],
        correctIndex: 3,
        explanation: "Public-key cryptography uses 256-bit elliptic curves or 4096-bit RSA keys that cannot be guessed or brute-forced over the wire."
      },
      {
        question: "On the client workstation, what permissions must the private key file (~/.ssh/id_ed25519) have to prevent SSH from refusing connection?",
        choices: ["chmod 600 (read/write only by owner)", "chmod 000", "chmod 777", "chmod 644"],
        correctIndex: 0,
        explanation: "If a private key is accessible by group or others (more open than 600), the SSH client aborts with an unsecure key warning."
      },
      {
        question: "What SSH server configuration directive in /etc/ssh/sshd_config prevents brute-force password login attempts entirely?",
        choices: ["Port 2222", "PasswordAuthentication no", "PermitRootLogin yes", "X11Forwarding no"],
        correctIndex: 1,
        explanation: "Setting PasswordAuthentication to 'no' mandates that incoming connections present a cryptographically verified public key."
      }
    ],
    "l14": [
      {
        question: "What is the relationship between 'firewalld' and the Linux kernel's 'nftables / netfilter' subsystem?",
        choices: ["nftables is a deprecated antivirus engine", "firewalld is a dynamic user-space management daemon that configures packet filtering rules inside the kernel's underlying netfilter/nftables framework", "firewalld replaces the kernel entirely", "firewalld only runs on Ubuntu"],
        correctIndex: 1,
        explanation: "firewalld provides high-level zone-based abstractions to dynamically manipulate the kernel's packet filtering engine without connection drops."
      },
      {
        question: "What command opens incoming TCP port 443 in the default firewalld zone and ensures the rule survives a reboot?",
        choices: ["firewall-cmd --add-port=443/tcp", "iptables -F", "firewall-cmd --permanent --add-port=443/tcp && firewall-cmd --reload", "systemctl stop firewalld"],
        correctIndex: 2,
        explanation: "--permanent writes the rule to XML storage on disk, and --reload applies disk rules into active memory."
      },
      {
        question: "What is a firewalld 'Zone' and how does it simplify network policy?",
        choices: ["A time zone configuration", "A DNS record type", "A physical room in a datacenter", "A predefined trust level assigned to a network interface (e.g. 'public', 'internal', 'dmz') specifying permitted services and ports"],
        correctIndex: 3,
        explanation: "Zones categorize network interfaces by trust: an external interface binds to 'public' (strict default-deny), while an internal interface binds to 'trusted'."
      }
    ],
    "l15": [
      {
        question: "Where are standardized central system logs stored on traditional Linux distributions?",
        choices: ["/var/log/ (/var/log/messages or /var/log/syslog)", "/home/logs/", "/etc/syslog/", "/tmp/logs/"],
        correctIndex: 0,
        explanation: "/var/log/ is the standard filesystem location for system, authentication, daemon, and kernel messages."
      },
      {
        question: "What daemon manages automated periodic log rotation, compression, and purging to prevent disk partitions from filling up?",
        choices: ["cron", "logrotate", "rsyslog", "systemd"],
        correctIndex: 1,
        explanation: "logrotate reads configuration files in /etc/logrotate.d/, automatically rotating, compressing (.gz), and pruning logs according to retention schedules."
      },
      {
        question: "What command filters journalctl output to show only log entries with an error severity or higher (priority 0 to 3)?",
        choices: ["journalctl --all", "journalctl -a", "journalctl -f", "journalctl -p err"],
        correctIndex: 3,
        explanation: "The -p (priority) flag filters messages by syslog severity levels: emerg (0), alert (1), crit (2), err (3), warning (4), notice (5), info (6), and debug (7)."
      }
    ],
    "l16": [
      {
        question: "What is the purpose of the 'shebang' line (#!/bin/bash) placed at the very top of a shell script?",
        choices: ["It encrypts the script file", "It grants the script root privileges", "It tells the operating system kernel which program interpreter to execute to parse the script commands", "It acts as a comment for documentation"],
        correctIndex: 2,
        explanation: "The shebang (#!) informs the execve() kernel syscall which binary interpreter must be spawned to execute the script's instructions."
      },
      {
        question: "What does the special shell variable '$?' represent in bash?",
        choices: ["A random number", "The process ID of the current shell", "The total number of command-line arguments", "The numeric exit status code (0 for success, non-zero for failure) of the most recently executed command"],
        correctIndex: 3,
        explanation: "$? captures the return code of the last command: 0 represents successful completion, while any non-zero integer denotes failure."
      },
      {
        question: "In bash scripting, why should variable expansions almost always be enclosed in double quotes (e.g. \"$FILENAME\")?",
        choices: ["To prevent word splitting and globbing errors if the variable value contains whitespace or special characters", "Quotes speed up script execution", "To convert numbers into strings", "Quotes are required by syntax rules"],
        correctIndex: 0,
        explanation: "Without double quotes, a variable containing spaces is split into separate arguments by the shell, causing syntax errors in file operations."
      }
    ],
    "l17": [
      {
        question: "What defensive command should be placed at the beginning of production bash scripts to ensure immediate exit on unexpected failures?",
        choices: ["trap 'echo done' EXIT", "set -x", "exit 0", "set -euo pipefail"],
        correctIndex: 3,
        explanation: "set -euo pipefail exits immediately on command failure (-e), treats unset variables as errors (-u), and catches pipeline errors (-o pipefail)."
      },
      {
        question: "What does the 'trap' command in bash allow a script author to accomplish?",
        choices: ["It traps cybercriminals", "It pauses the script indefinitely", "It intercepts signals (like SIGINT or EXIT) to execute cleanup functions, ensuring temporary lock files and scratch directories are purged", "It prevents users from pressing keys"],
        correctIndex: 2,
        explanation: "trap 'cleanup' EXIT guarantees that even if a script crashes or is interrupted via Ctrl+C, the designated cleanup routine runs to clean temporary locks."
      },
      {
        question: "How do you pass arguments into a bash function and reference the second argument inside the function body?",
        choices: ["Using %2", "Using $2", "Using function.args[1]", "Using $ARG2"],
        correctIndex: 1,
        explanation: "Within a bash function, positional parameters $1, $2, $3... represent the arguments passed to that specific function invocation."
      }
    ],
    "l18": [
      {
        question: "In the 'vmstat 1' output, what does persistent high activity in the 'si' (swap in) and 'so' (swap out) columns signify?",
        choices: ["Network packets are being dropped", "The server has exhausted physical RAM and is aggressively paging memory to slow swap disk, severely degrading throughput", "CPU utilization is optimal", "Storage controllers are idle"],
        correctIndex: 1,
        explanation: "Swap thrashing occurs when active memory sets exceed physical RAM. Paging memory blocks to disk causes millisecond latency spikes."
      },
      {
        question: "What tool provides interactive, per-process real-time disk I/O monitoring on Linux?",
        choices: ["iotop", "netstat", "ip addr", "htop"],
        correctIndex: 0,
        explanation: "iotop interfaces with Linux kernel task accounting to display real-time per-process disk read and write bandwidth."
      },
      {
        question: "What kernel parameter in /etc/sysctl.conf controls how aggressively the Linux kernel swaps memory pages to disk?",
        choices: ["kernel.pid_max", "fs.file-max", "vm.swappiness", "net.ipv4.ip_forward"],
        correctIndex: 2,
        explanation: "vm.swappiness (0-100) balances page cache eviction against anonymous memory swapping. Lowering it keeps database memory resident in physical RAM."
      }
    ],
    "l19": [
      {
        question: "When triaging a production server incident where all services appear completely frozen, what is the first command to check system resources?",
        choices: ["rm -rf /tmp/*", "iptables -F", "uptime (to check load averages) or top/htop", "reboot -f"],
        correctIndex: 2,
        explanation: "Checking uptime and top reveals whether the issue is CPU starvation, memory exhaustion, or I/O blockage, establishing initial triage scope."
      },
      {
        question: "A web server returns 500 errors and logs report 'No space left on device', but 'df -h' shows only 60% disk utilization. What is the root cause?",
        choices: ["Inodes are 100% exhausted (verified via 'df -i'), preventing the creation of new files or session locks", "Memory is running at 60%", "The hard drive is physically disconnected", "The Linux license has expired"],
        correctIndex: 0,
        explanation: "Running 'df -i' will reveal 100% inode exhaustion. When directories accumulate millions of tiny zero-byte files, inode tables fill completely."
      },
      {
        question: "A custom service will not start and systemctl gives no useful information. What is the standard diagnostic command sequence?",
        choices: ["Reinstall Linux from scratch", "Delete the service unit file", "Turn off the server power switch", "Run 'systemctl status <service>' and 'journalctl -u <service> -e' to inspect the exact termination exit code and stderr output"],
        correctIndex: 3,
        explanation: "systemctl status shows the immediate exit code and active state, while journalctl -u <service> -e navigates to the end of the log buffer to display the underlying error trace."
      }
    ]
  },
  "local-rhel-essential": {
    "l1": [
      {
        question: "What enterprise stability guarantee does Red Hat provide through its Application Streams (AppStream) in RHEL?",
        choices: ["AppStream converts RPMs to Debian packages", "Core OS stability is decoupled from developer runtimes, allowing multiple versions of databases and languages while preserving the 10-year base ABI", "All software updates are released daily", "AppStream replaces the Linux kernel"],
        correctIndex: 1,
        explanation: "AppStream allows administrators to run different major versions of Node.js, Python, or PostgreSQL as modular streams without altering the underlying hardened enterprise base OS."
      },
      {
        question: "How long is the standard enterprise production lifecycle support for a major RHEL release?",
        choices: ["1 year", "3 months", "2 years", "10 full years (plus extended lifecycle support options)"],
        correctIndex: 3,
        explanation: "Red Hat commits to a 10-year enterprise lifecycle with guaranteed binary compatibility and security errata backports."
      },
      {
        question: "What is an 'Errata' classification in Red Hat terminology representing a critical security vulnerability patch?",
        choices: ["RHSA (Security Advisory)", "RHEA (Enhancement Advisory)", "RHEL (Enterprise License)", "RHBA (Bug Advisory)"],
        correctIndex: 0,
        explanation: "RHSA (Red Hat Security Advisory) designates security updates addressing CVEs, ranked from Low to Critical."
      }
    ],
    "l2": [
      {
        question: "What is Red Hat Stratis in enterprise RHEL storage management?",
        choices: ["A local storage-management solution that unifies thin provisioning, snapshots, and filesystem creation on top of XFS and device-mapper", "A hardware RAID card", "A cloud backup vendor", "A fiber optic switch"],
        correctIndex: 0,
        explanation: "Stratis simplifies enterprise storage pools, automatically managing thin provisioning, automated filesystem growth, and snapshots over block devices."
      },
      {
        question: "What capability does VDO (Virtual Data Optimizer) provide on RHEL block storage devices?",
        choices: ["Formatting drives as FAT32", "Spinning down hard drives when idle", "Inline, block-level deduplication, zero-block elimination, and compression to multiply usable disk capacity", "Automated drive encryption only"],
        correctIndex: 2,
        explanation: "VDO eliminates duplicate 4KB data blocks and compresses unique blocks inline before writing to storage, saving 50-80% capacity on VMs and containers."
      },
      {
        question: "Which command manages Stratis storage pools and filesystems in RHEL?",
        choices: ["fdisk -s", "stratis pool create and stratis fs create", "zpool create", "btrfs subvolume"],
        correctIndex: 1,
        explanation: "The 'stratis' CLI commands allow administrators to create storage pools from physical disks and spawn dynamically sized XFS filesystems."
      }
    ],
    "l3": [
      {
        question: "What does 'Device Mapper Multipath' (multipathd) provide in enterprise SAN fiber channel environments?",
        choices: ["It increases network download speeds", "It allows mounting floppy drives", "It divides one hard drive into 4 partitions", "It combines multiple physical I/O paths between a server and storage array into a single redundant device to prevent single-cable failovers"],
        correctIndex: 3,
        explanation: "Multipath I/O aggregates dual host bus adapters (HBAs) and SAN switches into redundant /dev/mapper/mpathX devices with active-passive or round-robin failover."
      },
      {
        question: "What command creates an LVM thin pool named 'mythinpool' with 100GB capacity inside volume group 'app_vg'?",
        choices: ["mkfs.ext4 -thin app_vg/mythinpool", "lvcreate -L 100G -T app_vg/mythinpool", "pvcreate /dev/sdb", "vgextend app_vg /dev/sdc"],
        correctIndex: 1,
        explanation: "The -T flag designates thin provisioning, allocating physical disk blocks on-demand only when written by applications."
      },
      {
        question: "What daemon monitors SAN fabric health and re-routes I/O upon physical link failure?",
        choices: ["systemd-networkd", "chronyd", "multipathd", "sssd"],
        correctIndex: 2,
        explanation: "multipathd continuously polls SCSI path states, automatically failing over I/O requests to secondary fiber paths without application errors."
      }
    ],
    "l4": [
      {
        question: "Which systemd target in RHEL corresponds to traditional runlevel 3 (multi-user non-graphical text console)?",
        choices: ["emergency.target", "graphical.target", "multi-user.target", "rescue.target"],
        correctIndex: 2,
        explanation: "multi-user.target sets up a full multi-user network console environment without starting graphical X11/Wayland display managers."
      },
      {
        question: "If a production RHEL server has a lost root password, what kernel boot parameter provides root recovery shell access during GRUB boot?",
        choices: ["single_user=1", "rd.break (or init=/bin/bash)", "password=reset", "emergency.recovery"],
        correctIndex: 1,
        explanation: "Appending rd.break halts the boot sequence in the initramfs stage before root is mounted read-write, allowing sysadmins to remount /sysroot and run passwd."
      },
      {
        question: "What command isolates the system to single-user administrative rescue mode without rebooting?",
        choices: ["systemctl isolate rescue.target", "init 6", "shutdown -c", "systemctl poweroff"],
        correctIndex: 0,
        explanation: "systemctl isolate switches runtime targets dynamically, stopping all network services and dropping into a single-user root maintenance shell."
      }
    ],
    "l5": [
      {
        question: "What are the three operational modes of Security-Enhanced Linux (SELinux)?",
        choices: ["Enforcing, Permissive, Disabled", "Active, Inactive, Standby", "Strict, Moderate, Low", "Root, User, Guest"],
        correctIndex: 0,
        explanation: "Enforcing blocks unauthorized actions; Permissive logs denials for debugging without blocking; Disabled removes kernel hooks completely."
      },
      {
        question: "What command inspects the security context (user:role:type:level) of files in /var/www/html?",
        choices: ["chcon -t", "getsebool -a", "ls -l", "ls -Z"],
        correctIndex: 3,
        explanation: "The -Z flag across Linux utilities (ls -Z, ps -Z, id -Z) displays SELinux security context attributes."
      },
      {
        question: "After relocating a website's document root to /srv/www, NGINX returns 403 Forbidden due to SELinux. What command restores correct default file contexts?",
        choices: ["systemctl restart nginx", "setenforce 0", "restorecon -Rv /srv/www", "chmod 777 /srv/www"],
        correctIndex: 2,
        explanation: "restorecon reads the system SELinux file context policy and reapplies the correct default type (httpd_sys_content_t) recursively."
      }
    ],
    "l6": [
      {
        question: "What command-line tool is the primary Red Hat management interface for NetworkManager?",
        choices: ["ipconfig", "netsh", "ifconfig", "nmcli"],
        correctIndex: 3,
        explanation: "nmcli is the official command-line tool for controlling NetworkManager, managing connections, IP assignments, DNS, and bonds."
      },
      {
        question: "What Red Hat feature replaces traditional bonding with modular, JSON-configurable kernel drivers for link aggregation?",
        choices: ["Network Teaming (teamd)", "VLAN tagging", "Open vSwitch", "IP aliasing"],
        correctIndex: 0,
        explanation: "Network Teaming uses teamd to provide enterprise link aggregation with higher performance and custom runner plugins (roundrobin, activebackup, lacp)."
      },
      {
        question: "What command immediately applies configuration changes made to an existing NetworkManager connection profile named 'prod-eth0'?",
        choices: ["reboot", "nmcli connection up prod-eth0", "systemctl stop NetworkManager", "ip link set down eth0"],
        correctIndex: 1,
        explanation: "Running 'nmcli connection up <name>' instructs NetworkManager to reload parameters from disk and rebind the interface immediately."
      }
    ],
    "l7": [
      {
        question: "What is the primary role of the Linux Audit Daemon (auditd) on enterprise RHEL servers?",
        choices: ["Monitoring CPU fan speeds", "Recording tamper-evident security audit records for system calls, file modifications, and authentication events to meet compliance standards (PCI-DSS, STIG)", "Scanning files for viruses", "Generating monthly invoice reports"],
        correctIndex: 1,
        explanation: "auditd interfaces directly with kernel audit hooks to generate non-repudiable logs of file modifications, privilege escalations, and credential changes."
      },
      {
        question: "Which command searches the audit logs for all events related to the execution of the /etc/shadow file?",
        choices: ["grep /etc/shadow /var/log/messages", "aureport -u", "ausearch -f /etc/shadow", "journalctl /etc/shadow"],
        correctIndex: 2,
        explanation: "ausearch queries auditd records by file path (-f), process name, system call, or audit rule key."
      },
      {
        question: "What audit rule syntax monitors /etc/sudoers for unauthorized modifications with the audit key 'priv_esc'?",
        choices: ["touch /etc/sudoers", "setfacl -m u:audit /etc/sudoers", "watch /etc/sudoers", "auditctl -w /etc/sudoers -p wa -k priv_esc"],
        correctIndex: 3,
        explanation: "-w specifies the watch path, -p wa audits write and attribute change attempts, and -k tags the events with a searchable key."
      }
    ],
    "l8": [
      {
        question: "What tool registers a RHEL system with the Red Hat Customer Portal and attaches software subscriptions?",
        choices: ["subscription-manager", "yum-register", "rhn_register", "redhat-login"],
        correctIndex: 0,
        explanation: "subscription-manager registers systems to Red Hat Subscription Management (RHSM) or Satellite, pulling authorized entitlement certificates."
      },
      {
        question: "What command enables the PostgreSQL version 15 module stream in RHEL DNF?",
        choices: ["dnf switch pg:15", "dnf module enable postgresql:15", "rpm -i postgresql15.rpm", "dnf install postgresql-15"],
        correctIndex: 1,
        explanation: "'dnf module enable <module>:<stream>' selects the targeted major version stream, resolving all dependencies from that specific AppStream version."
      },
      {
        question: "How can an administrator list all available software repositories and verify their active status?",
        choices: ["cat /etc/os-release", "rpm -qa", "ls /etc/yum.repos.d/", "dnf repolist all"],
        correctIndex: 3,
        explanation: "dnf repolist displays enabled and disabled repository IDs, revision counts, and mirror status."
      }
    ],
    "l9": [
      {
        question: "What firewalld feature allows complex boolean filtering rules involving source IPs, destination ports, and log prefixes in a single command?",
        choices: ["NAT Rules", "Masquerade", "Rich Rules", "Direct Rules"],
        correctIndex: 2,
        explanation: "Rich Language rules allow granular policy expressions (e.g. allow port 22 only from subnet 10.0.0.0/24 and log with prefix 'SSH_IN')."
      },
      {
        question: "What is the firewalld command to enable masquerading (SNAT) on the 'public' zone?",
        choices: ["systemctl enable masquerade", "iptables -t nat -A POSTROUTING", "firewall-cmd --enable-nat", "firewall-cmd --permanent --zone=public --add-masquerade"],
        correctIndex: 3,
        explanation: "--add-masquerade configures IP forwarding and source NAT on the zone, allowing internal private subnets to access external networks."
      },
      {
        question: "How do you route all traffic originating from the 192.168.50.0/24 subnet into the 'internal' zone in firewalld?",
        choices: ["firewall-cmd --zone=internal --add-source=192.168.50.0/24 --permanent", "nmcli route add 192.168.50.0/24", "iptables -A INPUT -s 192.168.50.0/24", "route add default gw 192.168.50.1"],
        correctIndex: 0,
        explanation: "--add-source binds a source IP or CIDR block directly to a zone, ensuring incoming packets from that subnet are evaluated by that zone's rules."
      }
    ],
    "l10": [
      {
        question: "What RHEL daemon dynamically optimizes system parameters (kernel, disk scheduler, CPU governor) based on pre-defined workload profiles?",
        choices: ["crond", "systemd", "cron", "tuned"],
        correctIndex: 3,
        explanation: "tuned tunes kernel sysctl parameters, power profiles, and disk schedulers dynamically according to selected enterprise workload profiles."
      },
      {
        question: "What command switches the system's active performance profile to 'throughput-performance'?",
        choices: ["systemctl set throughput", "sysctl -w throughput=1", "tuned-adm profile throughput-performance", "cpupower set performance"],
        correctIndex: 2,
        explanation: "tuned-adm manages profiles, applying disk read-ahead, CPU governors, and memory management optimizations tuned for maximum throughput."
      },
      {
        question: "What command applies kernel parameters in /etc/sysctl.conf immediately without rebooting?",
        choices: ["reboot -f", "sysctl -p", "kernel-apply", "systemctl reload sysctl"],
        correctIndex: 1,
        explanation: "sysctl -p loads and parses the /etc/sysctl.conf file, injecting updated network buffer sizes and memory parameters directly into the running kernel."
      }
    ]
  },
  "local-networking-fundamentals": {
    "l1": [
      {
        question: "How many usable host IP addresses are provided by a standard /24 IPv4 subnet?",
        choices: ["256", "254 (excluding network ID and broadcast address)", "255", "128"],
        correctIndex: 1,
        explanation: "A /24 provides 2^(32-24) = 256 addresses, minus the first (network ID .0) and last (broadcast .255), leaving 254 usable host IPs."
      },
      {
        question: "What does the CIDR prefix '/16' represent in binary subnet masking?",
        choices: ["The first 16 bits of the 32-bit address are fixed network bits (255.255.0.0)", "16 subnets available", "An IPv6 address prefix", "16 host bits"],
        correctIndex: 0,
        explanation: "/16 means the first 16 bits are masked as the network portion, leaving 16 bits for up to 65,534 assignable host addresses."
      },
      {
        question: "Which of the following IPv4 ranges is officially reserved for private non-routable networks under RFC 1918?",
        choices: ["224.0.0.0/4", "8.8.8.0/24", "10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16", "1.1.1.0/24"],
        correctIndex: 2,
        explanation: "RFC 1918 designates 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 for internal private routing without public internet conflicts."
      }
    ],
    "l2": [
      {
        question: "What is the primary role of an Authoritative DNS Nameserver?",
        choices: ["Filtering spam emails", "Routing physical Ethernet packets", "Holding the definitive, official DNS resource records for a specific domain zone", "Caching records for ISP home users"],
        correctIndex: 2,
        explanation: "Authoritative nameservers maintain the official zone database and answer recursive resolvers with definitive answers for domains they manage."
      },
      {
        question: "What type of DNS resource record maps a hostname directly to an IPv6 address?",
        choices: ["AAAA record", "PTR record", "A record", "CNAME record"],
        correctIndex: 0,
        explanation: "An 'A' record maps to a 32-bit IPv4 address; an 'AAAA' (quad-A) record maps a hostname to a 128-bit IPv6 address."
      },
      {
        question: "What does the DNS 'Time to Live' (TTL) value specify in a query response?",
        choices: ["The total length of the server cable", "The timeout before a packet drops", "The expiration of the SSL certificate", "The duration in seconds that a recursive resolver is permitted to cache the record before querying authoritative servers again"],
        correctIndex: 3,
        explanation: "TTL dictates how long intermediary caching resolvers hold onto the IP mapping before refreshing from authoritative servers."
      }
    ],
    "l3": [
      {
        question: "What is the function of a 'Default Gateway' in local network routing?",
        choices: ["Resolving domain names", "The router IP address where hosts forward packets destined for any network outside the local subnet", "Assigning IP addresses via DHCP", "Encrypting web traffic"],
        correctIndex: 1,
        explanation: "When a destination IP does not match the local subnet mask, the host consults its routing table and forwards the packet to the default gateway router."
      },
      {
        question: "What is Source Network Address Translation (SNAT / Masquerade)?",
        choices: ["Replacing the destination IP with a private address", "Encrypting the IP header", "A firewall that blocks port 80", "Replacing the private internal source IP with a public IP on egress so internet servers can reply back"],
        correctIndex: 3,
        explanation: "SNAT translates hundreds of private RFC 1918 client IPs behind a single public router IP, tracking return connections in a state table."
      },
      {
        question: "What command displays the active IPv4 kernel routing table on modern Linux?",
        choices: ["ip route show", "ping -r", "cat /etc/resolv.conf", "netstat -i"],
        correctIndex: 0,
        explanation: "'ip route show' displays active kernel route entries, metric weights, interface bindings, and the default gateway address."
      }
    ],
    "l4": [
      {
        question: "What is the key difference between TCP (Transmission Control Protocol) and UDP (User Datagram Protocol)?",
        choices: ["TCP is connection-oriented, guarantees packet ordering and delivery via ACKs; UDP is connectionless, prioritizing low latency over guaranteed delivery", "UDP is encrypted; TCP is cleartext", "TCP only works over Wi-Fi", "UDP requires a 3-way handshake"],
        correctIndex: 0,
        explanation: "TCP enforces reliability through sequence numbers, acknowledgments, and retransmissions. UDP sends datagrams without handshakes, ideal for DNS and video."
      },
      {
        question: "What well-known TCP port numbers are standard for unencrypted HTTP and encrypted HTTPS?",
        choices: ["53 and 67", "3306 and 5432", "80 and 443", "21 and 22"],
        correctIndex: 2,
        explanation: "Port 80 is the standard port for unencrypted HTTP; port 443 is universally allocated for Transport Layer Security (HTTPS)."
      },
      {
        question: "How does a 'Stateful Firewall' differ from a simple 'Stateless Packet Filter'?",
        choices: ["Stateful firewalls block all UDP packets", "Stateful firewalls track active connection states (SYN, ESTABLISHED), automatically permitting return traffic for outbound requests without explicit inbound rules", "Stateful firewalls are hardware only", "Stateless filters inspect payload contents"],
        correctIndex: 1,
        explanation: "Stateful firewalls monitor connection tables (conntrack), allowing inbound response packets for established outbound connections automatically."
      }
    ],
    "l5": [
      {
        question: "What is the exact 3-way handshake sequence used to establish a reliable TCP session?",
        choices: ["SYN -> ACK -> DATA", "HELLO -> READY -> CONNECT", "ACK -> SYN -> FIN", "SYN -> SYN-ACK -> ACK"],
        correctIndex: 3,
        explanation: "The client sends a SYN packet with an initial sequence number; the server replies with SYN-ACK; the client acknowledges with ACK, moving the socket to ESTABLISHED."
      },
      {
        question: "What TCP socket state indicates that a local endpoint has closed its connection and is waiting to ensure the remote host received the final ACK?",
        choices: ["SYN_SENT", "TIME_WAIT", "LISTEN", "CLOSE_WAIT"],
        correctIndex: 1,
        explanation: "TIME_WAIT ensures delayed duplicate packets in flight do not corrupt subsequent new sessions using the same socket tuple (IP:port)."
      },
      {
        question: "What problem occurs on servers when thousands of sockets linger in the 'CLOSE_WAIT' state?",
        choices: ["The hard drive fills up", "The CPU enters sleep mode", "The application process has received a FIN from the remote peer but failed to call close() on the socket descriptor, causing descriptor leaks", "DNS queries fail"],
        correctIndex: 2,
        explanation: "CLOSE_WAIT is an application bug: the remote client disconnected, but the local software forgot to close its handle, eventually exhausting file descriptors."
      }
    ],
    "l6": [
      {
        question: "What is Destination NAT (DNAT / Port Forwarding)?",
        choices: ["Translating IPv6 to IPv4", "Hiding internal host IPs from the internet", "Translating a public destination IP/port on a firewall to an internal private server IP/port (e.g. 203.0.113.10:443 -> 10.0.1.50:443)", "Blocking port scans"],
        correctIndex: 2,
        explanation: "DNAT rewrites destination packet headers at the gateway, exposing private web or database servers safely behind a single public router IP."
      },
      {
        question: "What Linux kernel subsystem maintains state tracking tables for firewall NAT and connection filtering?",
        choices: ["systemd-networkd", "conntrack (netfilter connection tracking)", "udev", "cgroups"],
        correctIndex: 1,
        explanation: "conntrack maintains the state table recording 5-tuples (protocol, src IP, src port, dst IP, dst port) for all passing connections."
      },
      {
        question: "What happens if a high-traffic server exceeds the 'net.netfilter.nf_conntrack_max' kernel limit?",
        choices: ["The kernel drops all new incoming connection packets with 'nf_conntrack: table full, dropping packet' errors", "Firewall rules are automatically deleted", "Packets are forwarded without inspection", "The server reboots"],
        correctIndex: 0,
        explanation: "When connection tracking tables fill under heavy DDoS or high traffic, the kernel cannot allocate state entries and drops incoming packets."
      }
    ],
    "l7": [
      {
        question: "What command captures all TCP packets on interface eth0 arriving on port 443 and writes them to a pcap file?",
        choices: ["tcpdump -i eth0 -nn 'tcp port 443' -w capture.pcap", "netstat -p 443 > capture.pcap", "ping -c 10 eth0:443", "curl -o capture.pcap port:443"],
        correctIndex: 0,
        explanation: "-i selects interface, -nn prevents DNS/port translation to avoid capture drops, and -w writes raw packet buffers directly to a standard pcap file."
      },
      {
        question: "In Wireshark, what does seeing a flood of TCP 'RST' (Reset) packets sent by a destination server indicate?",
        choices: ["The network cable is unplugged", "The bandwidth is too high", "The server is operating normally", "The destination host actively rejected the connection because no process is listening on the targeted destination port or a firewall blocked it"],
        correctIndex: 3,
        explanation: "A TCP RST packet indicates an immediate refusal: the operating system kernel received a SYN packet for a port where no daemon is currently bound."
      },
      {
        question: "What does a TCP 'Window Size 0' packet in a packet capture signify?",
        choices: ["The internet cable is cut", "The connection was closed cleanly", "The receiving host's TCP socket buffer is completely full, instructing the sender to halt data transmission until buffer space clears", "The sender has no more data to send"],
        correctIndex: 2,
        explanation: "Zero Window is a flow control signal: the receiving application is processing data too slowly, so its kernel buffer is full and cannot accept more bytes."
      }
    ],
    "l8": [
      {
        question: "What is the recommended bottom-up order for systematic network triage?",
        choices: ["DNS -> Firewall -> Physical -> IP", "Reboot -> Replace router -> Test", "Application config -> DNS -> Hardware -> IP", "Physical Layer (cable/link) -> Network Layer (IP/gateway/ping) -> Transport Layer (port/netcat) -> Application Layer (curl/DNS)"],
        correctIndex: 3,
        explanation: "Troubleshooting bottom-up isolates the fault layer: verify link carrier first, then IP routing, then TCP socket listening, and finally application HTTP codes."
      },
      {
        question: "What command tests whether a remote server is listening on TCP port 3306 without attempting a database login?",
        choices: ["nc -zvw 3 server.internal 3306", "dig server.internal 3306", "ping -p 3306 server.internal", "traceroute -p 3306 server.internal"],
        correctIndex: 0,
        explanation: "Netcat (nc -zvw) initiates a TCP 3-way handshake with a 3-second timeout (-w) and reports whether the port is open without sending application data."
      },
      {
        question: "An application fails to connect to 'db.internal', but 'curl http://10.0.4.12:8080' succeeds. What component is failing?",
        choices: ["The network card", "DNS name resolution (the client cannot resolve 'db.internal' to an IP)", "The physical switch", "Operating system kernel"],
        correctIndex: 1,
        explanation: "If connecting by raw IP works but the hostname fails, the underlying IP routing is healthy and the issue is strictly isolated to DNS resolution."
      }
    ]
  },
  "local-cloud-computing-essentials": {
    "l1": [
      {
        question: "Under the Cloud Shared Responsibility Model, who is responsible for operating system patching on an IaaS virtual machine?",
        choices: ["The local ISP", "The customer organization deploying the VM", "The cloud provider (AWS/Azure/GCP)", "The hardware manufacturer"],
        correctIndex: 1,
        explanation: "In IaaS, the provider manages the physical hardware and hypervisor. The customer is strictly responsible for the guest OS, patches, and security configurations."
      },
      {
        question: "How does a Platform as a Service (PaaS) offering differ from Infrastructure as a Service (IaaS)?",
        choices: ["PaaS provides raw physical servers", "PaaS is always free", "In PaaS, the cloud provider manages the OS, runtime, and scaling, leaving the customer responsible only for code and application data", "IaaS does not use virtualization"],
        correctIndex: 2,
        explanation: "PaaS (e.g. AWS Elastic Beanstalk, Azure App Service) abstracts the OS layer: developers deploy code while the cloud provider manages patching and runtimes."
      },
      {
        question: "Which cloud computing model delivers fully functional end-user applications managed entirely by a third-party vendor over the web?",
        choices: ["PaaS", "FaaS (Function as a Service)", "IaaS", "SaaS (Software as a Service)"],
        correctIndex: 3,
        explanation: "SaaS (e.g. Microsoft 365, Salesforce, Google Workspace) provides ready-to-use software where the vendor manages infrastructure, code, and maintenance."
      }
    ],
    "l2": [
      {
        question: "What is an Availability Zone (AZ) in major cloud architectures?",
        choices: ["One or more discrete physical datacenters with independent power, cooling, and networking within a geographic Region", "A continent", "A software container", "A billing tier"],
        correctIndex: 0,
        explanation: "An AZ is physically isolated from other AZs in the same region, ensuring a flood or power grid failure at one AZ does not compromise adjacent zones."
      },
      {
        question: "Why do low-latency microservice architectures deploy across Availability Zones in the same Region rather than across different Regions?",
        choices: ["Cross-region connections use analog modems", "Intra-region AZs are connected via high-speed, private fiber optic links providing sub-2-millisecond round-trip latencies", "Regions cannot communicate with each other", "Inter-region traffic is illegal"],
        correctIndex: 1,
        explanation: "Datacenters in different AZs within the same metropolitan region are linked by redundant dedicated dark fiber, enabling synchronous database replication."
      },
      {
        question: "What does 'High Availability' (HA) mean in enterprise cloud design?",
        choices: ["Paying for enterprise support", "The system never requires electricity", "Running only on high-end hardware", "Designing architectures with redundant components across multiple AZs to eliminate single points of failure and ensure continuous uptime"],
        correctIndex: 3,
        explanation: "HA architectures distribute replicas across multiple independent failure domains behind load balancers, surviving individual datacenter outages seamlessly."
      }
    ],
    "l3": [
      {
        question: "What is the key difference between Ephemeral (Instance Store) disk storage and Persistent Block Storage (e.g. AWS EBS, Azure Managed Disk)?",
        choices: ["Persistent disks cannot be backed up", "Ephemeral disks only store text files", "Ephemeral storage is physically attached to the host server and erased when the VM stops; persistent block storage lives independently of VM lifecycle", "Ephemeral disks are slower"],
        correctIndex: 2,
        explanation: "Ephemeral instance stores lose all data when a VM is stopped or migrated. Persistent block storage detaches cleanly and persists through VM restarts."
      },
      {
        question: "What capability allows cloud virtual machines to automatically increase or decrease instance count based on real-time CPU or traffic load?",
        choices: ["RAID controllers", "Static IP mapping", "Manual rebooting", "Autoscaling Groups (ASG) / Virtual Machine Scale Sets"],
        correctIndex: 3,
        explanation: "Autoscaling dynamically provisions or terminates instances based on CloudWatch/Monitor metrics, maintaining performance while cutting off-peak costs."
      },
      {
        question: "What is a 'Snapshot' of a cloud block storage volume?",
        choices: ["A point-in-time incremental backup of the storage volume stored durably in cloud object storage", "A photo of the server rack", "A temporary screenshot of the desktop", "A CPU benchmark"],
        correctIndex: 0,
        explanation: "EBS/Azure snapshots capture point-in-time volume blocks incrementally, storing backup data durably in highly resilient object storage (S3/Blob)."
      }
    ],
    "l4": [
      {
        question: "Why should root/administrator cloud account credentials never be used for daily operational tasks?",
        choices: ["Root accounts expire every 24 hours", "Root accounts have higher billing rates", "Root accounts cannot create virtual machines", "Root credentials possess unrestricted superuser permissions that bypass all guardrails; compromised root keys result in total account loss"],
        correctIndex: 3,
        explanation: "Root credentials have unrestricted power. Best practice mandates locking root behind hardware MFA and using scoped IAM roles for daily engineering."
      },
      {
        question: "What security principle mandates granting only the minimum necessary permissions required for a user or service to execute its job?",
        choices: ["Defense-in-depth", "Separation of concerns", "Principle of Least Privilege", "Zero tolerance"],
        correctIndex: 2,
        explanation: "Least privilege ensures that if an application or credential is compromised, the attacker's blast radius is strictly constrained to that narrow permission set."
      },
      {
        question: "What is the most effective operational mechanism to prevent surprise multi-thousand dollar cloud billing invoices?",
        choices: ["Only running servers on weekends", "Configuring Cloud Billing Budgets with automated alert tripwires (e.g. alert at 50%, 80%, 100% of forecast)", "Using personal credit cards", "Turning off the internet"],
        correctIndex: 1,
        explanation: "Cloud budgets evaluate actual and forecasted spend daily, sending automated SNS/email alerts the moment anomalous spending or misconfigured scale sets trip thresholds."
      }
    ],
    "l5": [
      {
        question: "What is the difference between Recovery Point Objective (RPO) and Recovery Time Objective (RTO)?",
        choices: ["RPO is cost; RTO is speed", "RPO defines the maximum acceptable data loss measured in time (e.g. 15 mins of data); RTO defines the maximum acceptable downtime before restoration", "RTO measures backup storage size", "They are interchangeable terms"],
        correctIndex: 1,
        explanation: "RPO dictates how frequently data must be backed up (tolerable data loss). RTO dictates how quickly infrastructure must be restored after a disaster."
      },
      {
        question: "In an 'Active-Active' multi-region cloud deployment, how is user traffic distributed?",
        choices: ["Global load balancers (Route 53 latency/geo-routing) distribute live traffic across both regions simultaneously", "Users must manually select their region from a dropdown", "Traffic switches regions every hour", "All traffic goes to Region A; Region B is turned off"],
        correctIndex: 0,
        explanation: "Active-Active routes users to the closest healthy region in real time, delivering minimum latency and instant zero-downtime failover if one region fails."
      },
      {
        question: "What asynchronous database replication challenge must engineers solve when operating across multiple cloud regions?",
        choices: ["Replication requires physical fiber cables owned by the customer", "Database names cannot match", "Replication lag over long distances can result in temporary data inconsistencies (eventual consistency) during failover", "Cloud regions cannot replicate SQL"],
        correctIndex: 2,
        explanation: "Speed-of-light propagation across thousands of miles introduces latency; cross-region database replicas are asynchronous, requiring handling of eventual consistency."
      }
    ],
    "l6": [
      {
        question: "What are the primary characteristics of Object Storage (e.g. Amazon S3, Azure Blob Storage)?",
        choices: ["Low-latency local disk storage for OS boot drives", "In-memory database caching", "Massively scalable, flat-namespace storage accessed over HTTP/REST APIs with metadata tags and 99.999999999% durability", "Block devices formatted with NTFS/XFS"],
        correctIndex: 2,
        explanation: "Object storage manages unstructured data as discrete objects (data + metadata) over web APIs, distributing 11 9s of durability across multiple datacenters."
      },
      {
        question: "What cloud storage type provides a POSIX-compliant shared network filesystem that can be mounted simultaneously by hundreds of virtual machines?",
        choices: ["Managed File Storage (e.g. AWS EFS, Azure Files)", "Instance Store", "EBS Block Volume", "S3 Object Bucket"],
        correctIndex: 0,
        explanation: "NFS/SMB managed file services allow multiple compute instances to mount the same shared file system concurrently for content management or analytics."
      },
      {
        question: "How do Cloud Storage Lifecycle Rules optimize enterprise infrastructure costs?",
        choices: ["They delete all customer records after 1 year", "They compress video files", "They turn off storage servers at night", "They automatically transition aging objects from expensive hot tiers to cold/archive tiers (e.g. S3 Glacier) based on age"],
        correctIndex: 3,
        explanation: "Lifecycle rules automate storage class transitions (Standard -> Infrequent Access -> Glacier), slashing costs for data rarely accessed after 30 or 90 days."
      }
    ],
    "l7": [
      {
        question: "Why should cloud-hosted applications use IAM Roles / Managed Identities instead of hardcoded API access keys?",
        choices: ["API keys are limited to 10 requests per second", "The cloud platform automatically generates and rotates temporary short-lived credentials in memory, eliminating secret leaks in source code", "Managed Identities are free of charge", "IAM Roles work without internet access"],
        correctIndex: 1,
        explanation: "Attaching an IAM role to a compute instance eliminates static access keys. The platform issues temporary STS tokens that rotate automatically via metadata endpoints."
      },
      {
        question: "What is an IAM 'Permission Boundary' in enterprise cloud governance?",
        choices: ["A physical firewall in the office", "A limit on how many users can exist", "A geographic restriction on logins", "An advanced policy that sets the maximum allowable permissions an IAM entity can ever possess, preventing privilege escalation"],
        correctIndex: 3,
        explanation: "Permission boundaries define an outer guardrail. Even if an admin grants 'AdministratorAccess', the entity cannot exceed the boundary policy limits."
      },
      {
        question: "What does the following IAM policy snippet allow: {\"Effect\": \"Allow\", \"Action\": \"*\", \"Resource\": \"*\"}?",
        choices: ["Unrestricted superuser access to every service and resource in the entire cloud account", "Access to billing reports only", "Denies all access", "Read-only access to all files"],
        correctIndex: 0,
        explanation: "Wildcards on Action and Resource create an unrestricted superuser policy, violating least privilege and exposing the entire account to catastrophic compromise."
      }
    ],
    "l8": [
      {
        question: "What is 'FinOps' in modern cloud operations?",
        choices: ["A cultural and operational practice that combines engineering, finance, and operations to optimize cloud value and accountability", "Financial software programming", "A cloud accounting tax service", "A method for financing hardware purchases"],
        correctIndex: 0,
        explanation: "FinOps brings financial accountability to the variable-spend cloud model, empowering cross-functional teams to balance cost, speed, and quality."
      },
      {
        question: "Which of the following is a classic example of cloud 'zombie resource' waste?",
        choices: ["Storing archives in S3 Glacier", "Using autoscaling during peak hours", "Unattached EBS volumes and idle Elastic IPs left running after virtual machines were terminated", "Running a database at 95% CPU"],
        correctIndex: 2,
        explanation: "Terminating a VM often leaves its detached block storage volumes and allocated public IPs running, silently accruing monthly charges indefinitely."
      },
      {
        question: "How do 'Savings Plans' and 'Reserved Instances' (RIs) reduce cloud infrastructure costs?",
        choices: ["By turning off backups", "By offering up to 72% discounts in exchange for a committed hourly spend or 1-to-3-year usage commitment on baseline workloads", "By reducing server performance", "By using older server models"],
        correctIndex: 1,
        explanation: "Workloads with predictable baseline capacity achieve significant savings over on-demand rates by committing to 1- or 3-year term agreements."
      }
    ]
  },
  "local-intro-to-devops-and-cicd": {
    "l1": [
      {
        question: "What was the traditional 'Wall of Confusion' between software development and IT operations teams?",
        choices: ["A network firewall separating subnets", "A misunderstanding of programming languages", "A physical concrete wall in the office", "Developers were incentivized to deliver rapid changes, while Operations was measured on uptime and stability, leading to finger-pointing and slow releases"],
        correctIndex: 3,
        explanation: "Dev wanted velocity; Ops wanted stability. Siloed teams threw untested code 'over the wall' to operations, leading to painful manual deployments and blaming."
      },
      {
        question: "What does the 'C' in the CALMS DevOps framework represent?",
        choices: ["Cost", "Culture (shared responsibility, blameless retrospectives, and cross-functional empathy)", "Continuous", "Cloud"],
        correctIndex: 1,
        explanation: "CALMS stands for Culture, Automation, Lean, Measurement, and Sharing. Culture is the foundational pillar enabling trust and continuous improvement."
      },
      {
        question: "Why does DevOps emphasize deploying software in small, frequent batches rather than massive quarterly releases?",
        choices: ["Small releases use less internet bandwidth", "Quarterly releases are prohibited by agile", "Smaller code changes have dramatically lower risk, are simpler to test, and make root-cause isolation and rollbacks trivial if errors occur", "Small batches require no automated testing"],
        correctIndex: 2,
        explanation: "Releasing daily or hourly reduces deployment blast radius. If a bug slips through, isolating the defect in a 20-line commit takes minutes rather than days."
      }
    ],
    "l2": [
      {
        question: "What is the core definition of Continuous Integration (CI)?",
        choices: ["Hosting daily standup meetings", "Deploying code directly to production servers every hour", "The practice where developers merge code into a shared repository frequently, triggering automated builds and unit tests on every commit", "Writing documentation in markdown"],
        correctIndex: 2,
        explanation: "CI ensures code is merged and verified automatically. Automated test suites run immediately, catching regression errors early in the development lifecycle."
      },
      {
        question: "What is the critical distinction between 'Continuous Delivery' and 'Continuous Deployment'?",
        choices: ["Continuous Delivery requires Docker; Continuous Deployment does not", "In Continuous Delivery, every passing build is automatically deployable to production but requires a manual business approval trigger; Continuous Deployment deploys automatically with zero manual gates", "They are identical terms", "Continuous Deployment only applies to mobile apps"],
        correctIndex: 1,
        explanation: "Continuous Delivery stops at a production-ready artifact awaiting human release approval. Continuous Deployment deploys straight to production automatically."
      },
      {
        question: "What is a CI/CD 'Feedback Loop' and why should its duration be minimized?",
        choices: ["The elapsed time between a developer pushing code and receiving test results; shorter loops prevent developers from context-switching before fixing bugs", "A customer survey", "A monthly sprint review", "A recursive software loop that crashes the server"],
        correctIndex: 0,
        explanation: "Fast feedback (under 10 minutes) keeps developers in flow. If feedback takes 4 hours, engineers switch tasks, making context recovery and bug fixing inefficient."
      }
    ],
    "l3": [
      {
        question: "What is 'Trunk-Based Development' in modern source control workflows?",
        choices: ["Developers collaborate on a single shared branch ('main' or 'trunk') with short-lived feature branches merged at least daily via fast automated pull requests", "Storing code on USB tree trunks", "A workflow where every developer works in complete isolation for months", "A branching model with 10 permanent branches"],
        correctIndex: 0,
        explanation: "Trunk-Based Development avoids long-lived feature branches, preventing painful merge conflicts ('merge hell') and ensuring continuous code integration."
      },
      {
        question: "Why do long-lived feature branches (lasting weeks or months) degrade software delivery performance?",
        choices: ["Long branches delete commit history", "They prevent compilers from running", "Git limits repository size to 1GB", "They diverge extensively from the main branch, creating massive merge conflicts, stale dependencies, and integration headaches"],
        correctIndex: 3,
        explanation: "The longer a branch lives in isolation, the harder it becomes to reconcile against upstream changes made by other developers, stalling release velocity."
      },
      {
        question: "What is a 'Protected Branch' rule in GitHub or GitLab?",
        choices: ["A branch that cannot be cloned", "A branch that is encrypted with a password", "A policy requiring status checks (passing CI tests), peer code reviews, and signed commits before code can be merged into main", "A branch that only the CEO can see"],
        correctIndex: 2,
        explanation: "Protected branch policies safeguard the production trunk, preventing direct git pushes and enforcing automated testing and code review gates."
      }
    ],
    "l4": [
      {
        question: "In the standard Test Pyramid model, which layer forms the wide foundation with the highest volume of fast automated tests?",
        choices: ["End-to-end (E2E) browser tests", "Performance load tests", "Manual exploratory testing", "Unit tests"],
        correctIndex: 3,
        explanation: "Unit tests validate isolated functions in milliseconds. Having thousands of unit tests provides high-speed code coverage without slow UI dependencies."
      },
      {
        question: "Why should end-to-end (E2E) UI tests represent a smaller percentage of the overall automated test suite?",
        choices: ["They are slow to execute, resource-intensive, and prone to flakiness due to network and timing variations", "They only run on Internet Explorer", "E2E tests cannot test web applications", "E2E tests require paid licenses"],
        correctIndex: 0,
        explanation: "E2E tests verify full integrations but take minutes to run and can fail intermittently from external latency, making them inefficient as primary CI gates."
      },
      {
        question: "What is the primary requirement for an automated rollback strategy in CI/CD pipelines?",
        choices: ["Deleting the git repository", "Fast detection of production failure metrics (e.g. error rate spike) and rapid re-routing or redeployment of the last known healthy release artifact", "Powering down the servers", "Manually rewriting code under pressure"],
        correctIndex: 1,
        explanation: "Automated rollbacks rely on telemetry tripwires: if health checks fail or 5xx errors spike post-deploy, the pipeline automatically routes traffic back to the prior version."
      }
    ],
    "l5": [
      {
        question: "What is 'Linting' in a CI pipeline?",
        choices: ["Running load testing on databases", "Automated static analysis of source code to flag stylistic inconsistencies, formatting errors, and anti-patterns before compilation", "Cleaning physical server dust", "Compiling code into binaries"],
        correctIndex: 1,
        explanation: "Linters (ESLint, Flake8, RuboCop) analyze code syntax and conventions automatically, enforcing organizational standards without human reviewer overhead."
      },
      {
        question: "What is a CI/CD 'Quality Gate'?",
        choices: ["A physical turnstile at a datacenter", "A password prompt on the server", "A set of mandatory criteria (e.g. 80% code coverage, 0 critical security vulnerabilities, passing linting) that a build must satisfy to proceed to deployment", "An automated code formatter"],
        correctIndex: 2,
        explanation: "Quality gates enforce engineering baselines: if test coverage drops or a high-severity security flaw is detected by SAST scanners, the pipeline immediately halts."
      },
      {
        question: "What is Static Application Security Testing (SAST) and where does it run in the pipeline?",
        choices: ["Testing physical hard drives", "Reviewing customer feedback", "Simulating DDoS attacks against production", "Analyzing uncompiled source code in the early CI phase for known security flaws (SQL injection, hardcoded secrets, XSS)"],
        correctIndex: 3,
        explanation: "SAST (e.g. SonarQube, Semgrep) scans code repositories early ('shift-left') to catch vulnerabilities and exposed API tokens before binaries are built."
      }
    ],
    "l6": [
      {
        question: "Why should CI/CD pipelines publish built binaries to an Artifact Repository (e.g. Nexus, Artifactory, GitHub Packages) rather than rebuilding from source in production?",
        choices: ["To ensure immutable releases: the exact binary that passed staging tests is identical to what is deployed to production", "Rebuilding is illegal", "Artifact repositories compress files by 99%", "Rebuilding consumes too much disk space"],
        correctIndex: 0,
        explanation: "Build once, deploy many: rebuilding source on production servers risks version drift, differing dependency resolutions, and untracked code changes."
      },
      {
        question: "Under Semantic Versioning (SemVer: MAJOR.MINOR.PATCH), what does incrementing the MAJOR version (e.g. 1.4.2 to 2.0.0) signify?",
        choices: ["New backwards-compatible functionality", "Incompatible breaking API changes", "Internal refactoring without API impact", "Bug fixes only"],
        correctIndex: 1,
        explanation: "MAJOR increments denote breaking API changes; MINOR adds backward-compatible features; PATCH fixes backward-compatible bugs."
      },
      {
        question: "How does CI/CD dependency caching (e.g. caching node_modules or pip cache) accelerate pipeline runtimes?",
        choices: ["It compiles code without libraries", "It skips running unit tests", "It increases network bandwidth", "It saves downloaded dependency packages between runs so the pipeline avoids redownloading hundreds of MBs from external registries on every commit"],
        correctIndex: 3,
        explanation: "Dependency caching reuses previously downloaded packages, reducing pipeline execution times from 15 minutes down to 2 minutes."
      }
    ],
    "l7": [
      {
        question: "How does a 'Blue-Green' deployment achieve zero downtime during application upgrades?",
        choices: ["It restarts all servers simultaneously", "It requires shutting down the database", "Two identical environments exist: Blue (active production) and Green (new release); once Green passes health checks, traffic is instantly switched at the router/load balancer", "It paints half the servers blue"],
        correctIndex: 2,
        explanation: "Blue-Green maintains two production environments. Traffic cutover is an instantaneous load balancer routing switch, with immediate rollback if issues arise."
      },
      {
        question: "What is a 'Canary' deployment strategy?",
        choices: ["Testing software exclusively with automated bots", "Releasing code only in coal mines", "Deploying only on weekends", "Gradually rolling out the new release to a small percentage of real users (e.g. 5%) and monitoring error rates before progressively promoting to 100%"],
        correctIndex: 3,
        explanation: "Canary deployments minimize risk by exposing real traffic incrementally. If telemetry detects anomalies, only the small canary cohort is affected before rollback."
      },
      {
        question: "What is a 'Rolling Update' deployment pattern?",
        choices: ["Gradually replacing old instance replicas with new ones one at a time, maintaining available capacity throughout the update process", "Servers rolling on physical wheels", "Shutting down all servers and starting fresh ones", "Deploying software from a rotating USB drive"],
        correctIndex: 0,
        explanation: "Rolling updates sequentially update pods or instances. Service remains available throughout the rollout as remaining healthy nodes handle traffic."
      }
    ],
    "l8": [
      {
        question: "What is the core principle of 'Infrastructure as Code' (IaC)?",
        choices: ["Installing software via CD-ROM", "Writing operating systems in C++", "Documenting servers in word documents", "Managing and provisioning compute, storage, and networking infrastructure through machine-readable definition files rather than manual console configuration"],
        correctIndex: 3,
        explanation: "IaC treats infrastructure like software: definitions are versioned in Git, reviewed via pull requests, and deployed predictably through automated pipelines."
      },
      {
        question: "What does 'Idempotency' mean in the context of Infrastructure as Code?",
        choices: ["The script runs faster every time", "The script deletes all existing resources", "Applying the code multiple times produces the exact same infrastructure state without unexpected duplicates or side-effects", "The code requires root access"],
        correctIndex: 2,
        explanation: "An idempotent tool (Terraform, Ansible) checks current state against desired state. If a server already matches the declaration, no duplicate action is taken."
      },
      {
        question: "What is 'Configuration Drift' in cloud infrastructure management?",
        choices: ["A DNS routing error", "The gradual divergence between the declared IaC state in Git and the actual live runtime configuration caused by manual changes in web consoles", "Hard drive head calibration failure", "Clouds moving with the wind"],
        correctIndex: 1,
        explanation: "Drift occurs when engineers manually tweak live settings (firewall rules, VM sizes) in the cloud portal without updating the version-controlled IaC code."
      }
    ]
  },
  "local-docker-and-container-fundamentals": {
    "l1": [
      {
        question: "What is the most fundamental difference between a container and a virtual machine?",
        choices: ["Containers cost more to run", "A container shares the host OS kernel and uses kernel namespaces/cgroups, whereas a VM runs a full guest OS on top of a hypervisor", "VMs start in milliseconds", "Containers cannot run on Linux"],
        correctIndex: 1,
        explanation: "Containers share the host kernel and isolate processes using namespaces and cgroups, making them lightweight and fast compared to virtual machines."
      },
      {
        question: "Which Linux kernel feature provides process isolation (PID, Network, Mount, User) for containers?",
        choices: ["Linux Namespaces", "systemd", "iptables", "cgroups"],
        correctIndex: 0,
        explanation: "Namespaces partition kernel resources so that a container process sees only its own isolated PID table, network interfaces, and mount trees."
      },
      {
        question: "Which Linux kernel feature enforces hardware resource boundaries (CPU, RAM, block I/O) on containers?",
        choices: ["swap", "SELinux", "Control Groups (cgroups)", "cron"],
        correctIndex: 2,
        explanation: "cgroups track and limit resource utilization (e.g. max 512MB RAM, 1.5 CPUs) for process trees running inside containers."
      }
    ],
    "l2": [
      {
        question: "What are the three core architectural components of Docker Engine?",
        choices: ["HTML, CSS, JavaScript", "Compiler, Linker, Debugger", "Docker CLI (client), dockerd daemon (REST API server), and containerd / runc (OCI container runtime)", "Kernel, BIOS, CPU"],
        correctIndex: 2,
        explanation: "The Docker CLI communicates with the background dockerd daemon over a UNIX socket, which delegates container execution to containerd and runc."
      },
      {
        question: "What is an OCI (Open Container Initiative) compliant container image?",
        choices: ["An image that adheres to open industry standards for container formats and runtimes, runnable by Docker, Podman, or Kubernetes", "An encrypted image", "An image that only runs on Oracle Cloud", "An image written in C++"],
        correctIndex: 0,
        explanation: "OCI defines vendor-neutral specifications for container images and runtimes, ensuring portability across Docker, CRI-O, and Podman."
      },
      {
        question: "Where does the Docker daemon listen for local CLI commands by default on Linux?",
        choices: ["Port 8080", "Port 22", "In shared RAM memory", "The UNIX domain socket at /var/run/docker.sock"],
        correctIndex: 3,
        explanation: "dockerd listens on the local UNIX socket /var/run/docker.sock, requiring membership in the 'docker' user group or root permissions to access."
      }
    ],
    "l3": [
      {
        question: "What does the '-d' flag in 'docker run -d -p 80:80 nginx' do?",
        choices: ["Disables network access", "Runs the container in detached mode (in the background) and prints the container ID", "Deletes the container after exit", "Enables debugging logs"],
        correctIndex: 1,
        explanation: "-d (detach) runs the container process as a background daemon, freeing up your terminal."
      },
      {
        question: "In the port mapping parameter '-p 8080:80', which port refers to the host and which to the container?",
        choices: ["80 is the host; 8080 is the container", "Both are host ports", "Both are container ports", "8080 is the host port; 80 is the container port (host:container)"],
        correctIndex: 3,
        explanation: "Docker port mappings always follow host_port:container_port syntax, routing incoming traffic from host port 8080 into container port 80."
      },
      {
        question: "What happens when you run a container without specifying the '--name' flag?",
        choices: ["Docker automatically assigns a random unique name composed of an adjective and famous scientist (e.g. 'nervous_curie')", "The container has no identifier", "The image is deleted", "Docker refuses to run the container"],
        correctIndex: 0,
        explanation: "Docker automatically generates random human-friendly names if no explicit '--name' parameter is provided."
      }
    ],
    "l4": [
      {
        question: "What command inspects live streaming stdout and stderr logs for a running container named 'api'?",
        choices: ["docker logs -f api", "docker inspect api", "docker status api", "cat /var/log/docker.log"],
        correctIndex: 0,
        explanation: "'docker logs -f' streams application logs from the container's standard output and error streams in real time."
      },
      {
        question: "What information does 'docker inspect <container>' return?",
        choices: ["The source code of the application", "A summary of host CPU usage", "A comprehensive JSON payload detailing container configuration, network IP, mount volumes, environment variables, and state", "A list of user passwords"],
        correctIndex: 2,
        explanation: "docker inspect returns low-level JSON metadata including IP addresses, exit codes, restart policies, and health check history."
      },
      {
        question: "What is the difference between 'docker stop' and 'docker kill'?",
        choices: ["docker kill formats the disk", "docker stop sends SIGTERM then waits 10s before SIGKILL; docker kill sends SIGKILL immediately", "They are identical commands", "docker stop deletes the image"],
        correctIndex: 1,
        explanation: "docker stop allows graceful shutdown by issuing SIGTERM; docker kill issues an immediate SIGKILL to drop the process instantly."
      }
    ],
    "l5": [
      {
        question: "How does Docker's layered filesystem (UnionFS / Overlay2) optimize storage and build times?",
        choices: ["It deletes old files automatically", "It runs layers in separate virtual machines", "It compresses all files into zip archives", "Each Dockerfile instruction creates a cached, read-only layer; unchanged layers are reused across builds and shared across multiple containers"],
        correctIndex: 3,
        explanation: "Docker caches each instruction layer. If source code changes but dependencies do not, Docker reuses cached dependency layers, finishing builds in seconds."
      },
      {
        question: "Why should instructions that change frequently (e.g. COPY source code) be placed near the bottom of a Dockerfile?",
        choices: ["Top layers are read-only forever", "Because any change to a layer invalidates the cache for that layer and all subsequent layers beneath it", "To make the file look organized", "Compilers only read from the bottom"],
        correctIndex: 1,
        explanation: "Cache invalidation cascades: placing stable dependencies (like package installs) at the top preserves their cached build state when code edits occur."
      },
      {
        question: "What happens when multiple running containers are instantiated from the exact same Docker image?",
        choices: ["Each container duplicates the entire 500MB image on disk", "Only one container can run at a time", "All containers share the exact same read-only underlying image layers, with each container receiving its own thin, ephemeral writable layer", "Containers merge into a single process"],
        correctIndex: 2,
        explanation: "Copy-on-write (CoW) ensures all containers share the immutable base layers in memory and disk, creating only a lightweight writable layer for modifications."
      }
    ],
    "l6": [
      {
        question: "What is the difference between RUN, CMD, and ENTRYPOINT in a Dockerfile?",
        choices: ["ENTRYPOINT is only for databases", "They are interchangeable syntax", "RUN executes commands during image build time to create layers; CMD and ENTRYPOINT define the default executable and arguments when a container starts", "CMD builds packages; RUN starts containers"],
        correctIndex: 2,
        explanation: "RUN executes during docker build to install libraries; ENTRYPOINT sets the primary binary, and CMD sets default arguments when running."
      },
      {
        question: "Why should multiple package installation commands be chained into a single RUN instruction (e.g. apt-get update && apt-get install -y ... && rm -rf /var/lib/apt/lists/*)?",
        choices: ["To bypass Linux package licensing", "To minimize image layers and clean up cached package archives within the same layer so they don't persist in the final image", "Because Dockerfiles can only have one RUN command", "To speed up internet downloads"],
        correctIndex: 1,
        explanation: "Cleaning up in the same RUN command prevents downloaded installation files from being immortalized in intermediate image layers, reducing image size."
      },
      {
        question: "What is the purpose of a .dockerignore file?",
        choices: ["Excluding local files (node_modules, .git, secrets, temp files) from the Docker build context to speed up builds and prevent credential leaks", "Ignoring Docker security policies", "Deleting unused containers", "Ignoring compiler errors"],
        correctIndex: 0,
        explanation: ".dockerignore prevents heavy or sensitive local directories from being sent to the Docker daemon during build context transfer."
      }
    ],
    "l7": [
      {
        question: "What is the primary operational advantage of Docker Multi-Stage Builds?",
        choices: ["They separate the build environment (compilers, SDKs, dev tools) from the final runtime image, resulting in lightweight, secure production images", "They allow running containers on two computers", "They make images run twice as fast", "They eliminate the need for Linux"],
        correctIndex: 0,
        explanation: "Multi-stage builds copy only the compiled binary or dist artifacts into a minimal runtime image (like alpine or scratch), shrinking images from 1GB to 25MB."
      },
      {
        question: "In a multi-stage Dockerfile, what does the syntax 'COPY --from=builder /app/dist /usr/share/nginx/html' accomplish?",
        choices: ["It downloads files from GitHub", "It restores a backup", "It copies files from another computer", "It extracts compiled production assets directly from an earlier named build stage into the clean final runtime image"],
        correctIndex: 3,
        explanation: "'COPY --from=stage' transfers compiled artifacts across stages, leaving all bulky compilers, headers, and temporary build caches behind."
      },
      {
        question: "Why does deploying minimal runtime images (e.g. distroless or scratch) dramatically improve security posture?",
        choices: ["They disable root logins", "They have encrypted code", "They contain zero package managers (apt/yum), shells (bash/sh), or debugging utilities, depriving attackers of tools needed for post-exploitation", "They are immune to network attacks"],
        correctIndex: 2,
        explanation: "Distroless images contain only the application and its direct runtime dependencies, eliminating bash and curl so attackers cannot easily pivot or download malware."
      }
    ],
    "l8": [
      {
        question: "What is the difference between a Docker Bind Mount and a Named Volume?",
        choices: ["Bind mounts are encrypted automatically", "Named volumes cannot store data", "Volumes only work on Windows", "A bind mount maps an exact host directory path directly into the container; a named volume is managed entirely by Docker in /var/lib/docker/volumes"],
        correctIndex: 3,
        explanation: "Bind mounts link exact host paths (great for local source code reloading); named volumes are isolated, managed by Docker, and optimized for databases."
      },
      {
        question: "What happens to data written inside a container's writable layer if the container is removed and no volume was mounted?",
        choices: ["The data is permanently lost with the container lifecycle", "The data is sent to root email", "The data is automatically saved to the cloud", "The data moves to another container"],
        correctIndex: 0,
        explanation: "Container writable layers are ephemeral. When a container is removed, its writable layer is destroyed unless data was written to a persistent volume."
      },
      {
        question: "What command creates a persistent Docker named volume called 'postgres_data'?",
        choices: ["docker disk create postgres_data", "docker volume create postgres_data", "mkdir /var/lib/postgres", "docker mount create postgres_data"],
        correctIndex: 1,
        explanation: "'docker volume create' initializes a managed storage volume ready to be mounted into containers across restarts."
      }
    ],
    "l9": [
      {
        question: "What is the default network driver assigned to standalone containers in Docker?",
        choices: ["none", "bridge", "host", "overlay"],
        correctIndex: 1,
        explanation: "The default 'bridge' network assigns a private IP (e.g. 172.17.0.X) inside a virtual bridge (docker0), using NAT for outbound communication."
      },
      {
        question: "How do containers connected to a user-defined custom bridge network communicate with each other?",
        choices: ["Only by raw IP address", "Using USB cables", "By container name or service alias via Docker's built-in automatic DNS resolution", "Via public internet routing"],
        correctIndex: 2,
        explanation: "Custom bridge networks include an internal DNS server that resolves container names (e.g. 'db' or 'web') to their current internal IP addresses."
      },
      {
        question: "What does using the '--network host' driver do?",
        choices: ["It connects the container to AWS", "It triples network latency", "It disables networking entirely", "It removes network isolation, attaching the container directly to the host's network namespace and interface ports without NAT"],
        correctIndex: 3,
        explanation: "'host' networking bypasses Docker's virtual bridge and port forwarding: if the container listens on port 80, it binds directly to port 80 of the physical host."
      }
    ],
    "l10": [
      {
        question: "What problem does Docker Compose solve in modern development and staging environments?",
        choices: ["It defines, links, and manages multi-container application stacks (web, database, redis) using a single declarative YAML file", "It replaces the need for Dockerfiles", "It automatically writes application code", "It compiles Go binaries"],
        correctIndex: 0,
        explanation: "Docker Compose codifies multi-container applications in docker-compose.yml, launching networks, volumes, and services with a single 'docker compose up -d' command."
      },
      {
        question: "What command starts all services defined in a docker-compose.yml file in the background?",
        choices: ["docker compose run all", "docker compose up -d", "docker start compose", "docker compose start"],
        correctIndex: 1,
        explanation: "'docker compose up -d' parses the compose file, builds missing images, creates networks/volumes, and launches all containers in detached mode."
      },
      {
        question: "How do services defined in the same docker-compose.yml reach each other over the network?",
        choices: ["By hardcoding IP addresses", "They cannot communicate", "By searching Google DNS", "Using the service name defined in the YAML file (e.g. http://db:5432) as the network hostname"],
        correctIndex: 3,
        explanation: "Compose automatically establishes a shared network for the stack, configuring DNS records matching each service key in the YAML file."
      }
    ],
    "l11": [
      {
        question: "Why is running a container process as the 'root' user (UID 0) considered a severe security risk?",
        choices: ["Root processes cannot access the network", "Docker terminates root containers automatically", "If an attacker achieves a container escape vulnerability, they inherit root privileges on the underlying host operating system", "Root processes consume twice as much RAM"],
        correctIndex: 2,
        explanation: "UID 0 inside a container maps directly to UID 0 on the host kernel by default. An escape from a root container grants full root host compromise."
      },
      {
        question: "What Dockerfile instruction switches process execution to an unprivileged user?",
        choices: ["CHOWN user", "SWITCH user", "RUN sudo user", "USER <username_or_uid>"],
        correctIndex: 3,
        explanation: "The USER instruction tells the runtime to execute subsequent commands and the container ENTRYPOINT under the designated unprivileged UID/GID."
      },
      {
        question: "What Docker run flag strips all Linux kernel capabilities from a container to enforce least privilege?",
        choices: ["--cap-drop ALL", "--no-kernel", "--disable-security", "--rootless-all"],
        correctIndex: 0,
        explanation: "--cap-drop ALL strips all default kernel capabilities (like raw socket creation or chown), allowing you to re-add only strictly necessary capabilities."
      }
    ],
    "l12": [
      {
        question: "What happens when a container exceeds its configured '--memory' limit?",
        choices: ["Extra memory is downloaded from the cloud", "Docker throttles its CPU speed", "The host operating system reboots", "The Linux Out-Of-Memory (OOM) killer terminates the container with exit code 137"],
        correctIndex: 3,
        explanation: "Memory is a non-compressible resource. When a container exceeds its cgroup memory limit, the kernel OOM killer sends SIGKILL (exit code 137)."
      },
      {
        question: "What does the Docker flag '--cpus 1.5' enforce on a multi-core server?",
        choices: ["The container only runs on core #1", "The container requires 1.5GB of RAM", "The container's processes can consume at most 1.5 CPU cores of computational time per scheduling period", "The CPU frequency is boosted by 50%"],
        correctIndex: 2,
        explanation: "--cpus configures the CFS (Completely Fair Scheduler) quota, restricting the container to 150,000 microseconds of CPU time per 100,000 microsecond period."
      },
      {
        question: "What exit code does a container return when terminated by the Linux OOM killer (128 + 9)?",
        choices: ["1", "137", "255", "0"],
        correctIndex: 1,
        explanation: "Exit code 137 indicates termination by signal 9 (SIGKILL): 128 + 9 = 137, standard for container OOM kills."
      }
    ],
    "l13": [
      {
        question: "What does the 'HEALTHCHECK' instruction in a Dockerfile do?",
        choices: ["Scans the container for viruses", "Tells Docker how to test whether the container is truly functioning internally (e.g. running curl http://localhost:8080/health)", "Measures the temperature of the CPU", "Checks if the server has power"],
        correctIndex: 1,
        explanation: "HEALTHCHECK defines a periodic probe. If the probe exits non-zero consecutively, Docker marks the container status as 'unhealthy'."
      },
      {
        question: "What is the difference between restart policies 'always' and 'unless-stopped'?",
        choices: ["'unless-stopped' will not restart a container upon daemon reboot if it was manually stopped by an administrator prior to reboot", "'always' only restarts on errors", "'unless-stopped' restarts every 5 minutes", "There is no difference"],
        correctIndex: 0,
        explanation: "both restart on failure and boot, but 'unless-stopped' remembers when an admin explicitly ran 'docker stop' and leaves it stopped after reboot."
      },
      {
        question: "What tool or orchestrator uses Docker container health check statuses to automatically trigger container replacements?",
        choices: ["Package managers", "Docker CLI", "Container orchestrators like Docker Swarm and Kubernetes", "Bash shell"],
        correctIndex: 2,
        explanation: "Orchestrators monitor health status: when a container becomes 'unhealthy', the orchestrator drains traffic and deploys a fresh container replica."
      }
    ],
    "l14": [
      {
        question: "Why do high-throughput production Docker hosts configure max-size and max-file on the 'json-file' logging driver?",
        choices: ["To encrypt logs", "To email logs to developers", "To prevent container log files from growing infinitely and consuming 100% of the host disk space", "To make logs colorful"],
        correctIndex: 2,
        explanation: "By default, json-file logs never rotate. Without max-size (e.g. 20m) and max-file (e.g. 5), chatty applications will silently fill the host hard drive."
      },
      {
        question: "Where is the global default logging driver configured for all containers on a Docker host?",
        choices: ["In /etc/docker/daemon.json", "In /var/log/docker", "In /etc/fstab", "In ~/.bashrc"],
        correctIndex: 0,
        explanation: "The Docker daemon configuration file (/etc/docker/daemon.json) sets global engine defaults including log drivers, storage drivers, and registries."
      },
      {
        question: "What logging driver forwards container stdout/stderr directly to a centralized syslog or fluentd daemon without writing local JSON files?",
        choices: ["local", "none", "file", "syslog or fluentd logging driver"],
        correctIndex: 3,
        explanation: "Configuring the syslog or fluentd driver streams logs directly over sockets or network to central aggregation engines without local disk accumulation."
      }
    ],
    "l15": [
      {
        question: "What command authenticates the Docker CLI to a private container registry (e.g. AWS ECR, Quay.io)?",
        choices: ["ssh registry.internal", "docker login <registry_url>", "docker auth", "docker connect"],
        correctIndex: 1,
        explanation: "docker login authenticates credentials against the registry's v2 API, storing an auth token in ~/.docker/config.json."
      },
      {
        question: "Why should production container deployments avoid using the ':latest' image tag?",
        choices: ["latest tags are slower to download", "latest tags do not work on Kubernetes", "latest tags expire in 24 hours", "':latest' is a mutable pointer that changes whenever a new build is pushed, preventing reproducible deployments and rollbacks"],
        correctIndex: 3,
        explanation: "Using ':latest' destroys determinism: two nodes starting a container at different times may pull different code versions. Use immutable git SHAs or SemVer tags."
      },
      {
        question: "What is 'Container Image Signing' (e.g. using Cosign / Sigstore)?",
        choices: ["Cryptographically signing the container image manifest and verifying its signature before deployment to guarantee origin authenticity and tamper-resistance", "Writing your name in the metadata", "Encrypting the image with a password", "Adding a text signature to the Dockerfile"],
        correctIndex: 0,
        explanation: "Cosign signs image digests using digital signatures. Admission controllers reject any container whose cryptographic signature cannot be verified."
      }
    ],
    "l16": [
      {
        question: "A container is stuck in 'CrashLoop' restarting every 5 seconds. What command sequence should you run first to triage?",
        choices: ["Run 'docker ps -a' to check the exit code and 'docker logs --tail 50 <name>' to inspect the error trace", "Delete the Docker daemon", "Reboot the physical server", "Reinstall Docker Engine"],
        correctIndex: 0,
        explanation: "docker ps -a displays the exit code (e.g. 1 for general error, 137 for OOM), while logs reveal the uncaught exception or missing configuration file."
      },
      {
        question: "A container immediately exits with code 127 upon start. What does exit code 127 specifically mean in Linux/Docker?",
        choices: ["Permission denied", "Success", "Command not found (the specified ENTRYPOINT binary or script path does not exist inside the container)", "Memory exhausted"],
        correctIndex: 2,
        explanation: "Exit code 127 is the standard shell code for 'command not found', typically caused by an erroneous path in ENTRYPOINT or a missing interpreter."
      },
      {
        question: "How can an engineer open an interactive troubleshooting shell inside a running container that has no curl or netcat installed?",
        choices: ["By restarting the server in safe mode", "By using 'docker exec -it <container> sh' and utilizing bash/sh built-in /dev/tcp pseudo-devices", "By downloading an external virtual machine", "By copying the container to a USB drive"],
        correctIndex: 1,
        explanation: "'docker exec -it <container> sh' provides an in-container shell. If netcat is missing, bash can test ports directly via 'cat < /dev/tcp/host/port'."
      }
    ]
  },
  "local-kubernetes-fundamentals": {
    "l1": [
      {
        question: "Why do you almost always use a Deployment instead of creating a bare Pod directly?",
        choices: ["Deployments are required for networking to work at all", "There is no real difference", "Pods are deprecated", "A Deployment automatically recreates a Pod that dies to maintain the desired replica count"],
        correctIndex: 3,
        explanation: "A bare Pod that crashes or whose node fails stays dead forever. A Deployment reconciles reality toward desired state, launching new pods automatically."
      },
      {
        question: "What Kubernetes resource sits directly between a Deployment and its managed Pods to handle scaling and rolling updates?",
        choices: ["Ingress", "ReplicaSet", "Service", "StatefulSet"],
        correctIndex: 1,
        explanation: "A Deployment manages ReplicaSets, which in turn manage individual Pods. During rolling updates, a new ReplicaSet scales up while the old one scales down."
      },
      {
        question: "What defines a Pod in the Kubernetes architecture?",
        choices: ["A single physical server", "A virtual machine hypervisor", "The smallest deployable compute unit in Kubernetes, consisting of one or more containers that share network namespaces, IP, and storage volumes", "A database cluster"],
        correctIndex: 2,
        explanation: "A Pod encapsulates one or more containers scheduled together on the same node, sharing localhost networking and mounted storage."
      }
    ],
    "l2": [
      {
        question: "Why shouldn't another service connect directly to a Pod's IP address?",
        choices: ["It is required for security reasons only", "Pod IPs are static", "A Pod's IP is ephemeral and changes every time it is rescheduled or updated; a Service provides a stable IP and DNS name", "Pods don't have IP addresses"],
        correctIndex: 2,
        explanation: "Pod IPs are dynamic and disappear on reschedule. A Kubernetes Service provides a permanent virtual ClusterIP and CoreDNS record that routes across pods."
      },
      {
        question: "What is the default Service type in Kubernetes used strictly for internal cluster communication?",
        choices: ["LoadBalancer", "ClusterIP", "NodePort", "ExternalName"],
        correctIndex: 1,
        explanation: "ClusterIP is the default service type, exposing the service on an internal-only IP reachable exclusively from within the Kubernetes cluster."
      },
      {
        question: "How does CoreDNS enable Pods in namespace 'production' to discover a service named 'order-api' located in the same namespace?",
        choices: ["By querying the local DNS name 'order-api' or 'order-api.production.svc.cluster.local'", "By reading /etc/hosts", "CoreDNS cannot resolve services", "By searching the public internet"],
        correctIndex: 0,
        explanation: "Kubernetes CoreDNS automatically resolves service names within the same namespace via simple unqualified hostnames ('order-api') or FQDNs."
      }
    ],
    "l3": [
      {
        question: "A crashed pod has already restarted, so 'kubectl logs <pod>' shows nothing useful. What flag do you add to inspect the previous crash's logs?",
        choices: ["--previous", "--all", "--force", "--tail=0"],
        correctIndex: 0,
        explanation: "'kubectl logs --previous' retrieves the stdout/stderr logs from the terminated prior container instance, revealing the fatal error or panic trace."
      },
      {
        question: "What command displays detailed event history and failure causes (e.g. FailedScheduling, BackOff) for a Kubernetes Pod?",
        choices: ["kubectl top pod", "kubectl edit pod", "kubectl get pod", "kubectl describe pod <name>"],
        correctIndex: 3,
        explanation: "'kubectl describe pod' prints the Events section at the bottom, which records kubelet and scheduler actions, failed probes, and image pull errors."
      },
      {
        question: "What kubectl command executes an interactive shell inside a running container named 'api' in pod 'api-pod-123'?",
        choices: ["kubectl ssh api-pod-123", "kubectl run api-pod-123", "kubectl exec -it api-pod-123 -c api -- sh", "kubectl attach api-pod-123"],
        correctIndex: 2,
        explanation: "'kubectl exec -it <pod> -c <container> -- sh' opens an interactive TTY shell session inside the designated container."
      }
    ],
    "l4": [
      {
        question: "A pod shows status 'ImagePullBackOff'. What does that specifically indicate?",
        choices: ["The cluster is out of memory", "A readiness probe is failing", "The application crashed after starting", "Kubernetes could not pull the container image — often due to a typo in the tag, missing image, or invalid registry credentials"],
        correctIndex: 3,
        explanation: "ImagePullBackOff means the kubelet attempted to pull the container image from the registry and failed, backing off exponentially."
      },
      {
        question: "A pod shows status 'CrashLoopBackOff'. What does this indicate?",
        choices: ["The container starts successfully, but the application process terminates or crashes shortly after, causing Kubernetes to repeatedly restart it", "The network is disconnected", "The image cannot be found", "The worker node is powered off"],
        correctIndex: 0,
        explanation: "CrashLoopBackOff signifies that the application process is crashing (exit code > 0) upon launch, often due to missing config, uncaught exceptions, or database timeouts."
      },
      {
        question: "A pod remains stuck in 'Pending' status indefinitely. What is the most common root cause?",
        choices: ["The container image is corrupted", "The scheduler cannot find any worker node with sufficient available CPU/memory requests or matching taints/tolerations to place the pod", "DNS is down", "The pod has too many logs"],
        correctIndex: 1,
        explanation: "Pending status indicates scheduling failure: no node in the cluster possesses enough allocatable CPU or RAM to satisfy the pod's declared resource requests."
      }
    ],
    "l5": [
      {
        question: "What command is required to make running pods pick up updated ConfigMap values that were injected as environment variables?",
        choices: ["No command is needed because environment variables update instantly in running processes", "kubectl rollout restart deployment <name>", "kubectl refresh env <pod>", "kubectl scale deployment to 0 then manually re-create it"],
        correctIndex: 1,
        explanation: "Environment variables are only read when a process initializes. To pick up updated values, pods must be rolling-restarted."
      },
      {
        question: "What is the primary difference between a ConfigMap and a Secret in Kubernetes?",
        choices: ["Secrets cannot be mounted as files", "ConfigMaps only work on Linux", "ConfigMaps store cleartext configuration data; Secrets store sensitive credentials and are base64-encoded (or encrypted at rest in etcd)", "Secrets can only hold 10 bytes of data"],
        correctIndex: 2,
        explanation: "ConfigMaps hold non-sensitive settings (ports, URLs). Secrets store confidential tokens, passwords, and TLS certificates with tighter RBAC controls."
      },
      {
        question: "When a ConfigMap is mounted into a Pod as a Volume, what happens inside the container when the ConfigMap is updated in Kubernetes?",
        choices: ["The filesystem becomes corrupted", "The container crashes with code 1", "The pod is deleted immediately", "The mounted files inside the container are updated automatically by the kubelet without restarting the container"],
        correctIndex: 3,
        explanation: "Volume-mounted ConfigMaps and Secrets are dynamically refreshed in place by the kubelet, allowing applications with file watchers to reload live without restart."
      }
    ],
    "l6": [
      {
        question: "What is the primary advantage of an Ingress Controller compared to multiple LoadBalancer Services?",
        choices: ["It consolidates multiple HTTP services behind a single external IP and load balancer with path and host routing", "Ingress replaces all internal ClusterIP services", "It eliminates the need for DNS records", "It executes without any pods running in the cluster"],
        correctIndex: 0,
        explanation: "An Ingress Controller (e.g. NGINX, Traefik) multiplexes hundreds of microservices behind a single cloud load balancer using Layer 7 routing rules."
      },
      {
        question: "What Kubernetes resource pairs with cert-manager to automatically provision and rotate Let's Encrypt TLS certificates for Ingress?",
        choices: ["PersistentVolume", "A TLS-type Secret", "ServiceAccount", "ConfigMap"],
        correctIndex: 1,
        explanation: "cert-manager validates ACME challenges and stores the resulting x509 public cert and private key in a standard Kubernetes TLS Secret referenced by Ingress."
      },
      {
        question: "What happens if an Ingress resource is created in a cluster that does not have an Ingress Controller running?",
        choices: ["All services become public automatically", "The cluster crashes", "Kubernetes automatically installs NGINX", "The Ingress resource is accepted by the API server but remains completely inactive because no controller exists to satisfy the routing rules"],
        correctIndex: 3,
        explanation: "Ingress is purely a declaration of intent; without an active Ingress Controller daemon listening for Ingress events, nothing configures routing rules."
      }
    ],
    "l7": [
      {
        question: "What action does Kubernetes take when a container's Readiness Probe fails?",
        choices: ["It evicts the pod to another node", "It triggers a rollback to the previous deployment version", "It stops routing Service network traffic to that Pod until it reports ready again", "It restarts the container immediately"],
        correctIndex: 2,
        explanation: "Readiness probes protect users: when an application is warming up or overwhelmed, Kubernetes removes its IP from Service endpoints without killing it."
      },
      {
        question: "What action does the kubelet take when a container's Liveness Probe fails consecutively?",
        choices: ["It deletes the deployment", "It sends an alert email", "It drains the worker node", "It terminates and restarts the container according to its restartPolicy"],
        correctIndex: 3,
        explanation: "Liveness probes catch unrecoverable deadlocks. If a liveness probe fails past the threshold, the kubelet kills and restarts the container process."
      },
      {
        question: "Why should slow-starting applications (like Java/Spring Boot) use a Startup Probe alongside a Liveness Probe?",
        choices: ["The Startup probe disables the Liveness probe during initialization, preventing the kubelet from prematurely killing slow-booting apps", "Startup probes make code compile faster", "Startup probes allocate extra RAM", "Liveness probes are deprecated"],
        correctIndex: 0,
        explanation: "Startup probes prevent 'death spirals' where a slow-starting application is killed by a liveness probe before it can finish loading its application context."
      }
    ],
    "l8": [
      {
        question: "What happens when a container consumes more memory than its configured memory limit?",
        choices: ["Unused memory is dynamically borrowed from other pods", "Execution is throttled to lower memory consumption", "The host worker node is forced into a reboot", "The container is killed with an OOMKilled status and exit code 137"],
        correctIndex: 3,
        explanation: "Memory is non-compressible: exceeding the hard limit triggers immediate termination by the Linux kernel OOM killer with status OOMKilled."
      },
      {
        question: "What happens when a container consumes more CPU than its configured CPU limit?",
        choices: ["The container is killed immediately", "The node catches fire", "The container's CPU execution time is throttled by the CFS scheduler, slowing down performance without terminating the process", "Kubernetes launches a second pod"],
        correctIndex: 2,
        explanation: "CPU is compressible: when a container hits its CPU limit, the kernel throttles execution cycles, resulting in latency spikes rather than crashes."
      },
      {
        question: "How does the Kubernetes scheduler use resource 'requests' when placing pods onto worker nodes?",
        choices: ["Requests set the hard maximum ceiling", "The scheduler places the Pod only on a worker node that has sufficient allocatable capacity to guarantee the requested CPU and memory", "Requests determine the container image size", "Requests are ignored by the scheduler"],
        correctIndex: 1,
        explanation: "Requests represent guaranteed reservations. The scheduler sums all pod requests on a node to ensure the physical node is never overcommitted on placement."
      }
    ]
  },
  "local-microsoft-azure-fundamentals": {
    "l1": [
      {
        question: "What happens when you delete an Azure Resource Group?",
        choices: ["Only the resource group's tags are removed", "Every resource contained inside the resource group is deleted along with it", "Resources are moved to a default group", "Nothing, resource groups are permanent"],
        correctIndex: 1,
        explanation: "A resource group is a lifecycle boundary. Deleting the resource group deletes every VM, disk, database, and NIC contained inside it."
      },
      {
        question: "What single control-plane API handles all management, deployment, and access requests across Azure?",
        choices: ["Azure Resource Manager (ARM)", "Microsoft Entra Connect", "Azure DevOps", "Azure PowerShell"],
        correctIndex: 0,
        explanation: "ARM is the unified management layer that authenticates requests, checks RBAC permissions, and routes calls to underlying resource providers."
      },
      {
        question: "What is the correct order of Azure's organizational hierarchy from broadest to narrowest scope?",
        choices: ["Resources have no hierarchy", "Resource Group -> Subscription -> Management Group", "Management Groups -> Subscriptions -> Resource Groups -> Resources", "Subscription -> Management Group -> Resource Group"],
        correctIndex: 2,
        explanation: "Management Groups contain Subscriptions (billing/access boundaries), which contain Resource Groups (lifecycle containers), which hold Resources."
      }
    ],
    "l2": [
      {
        question: "How does Azure Role-Based Access Control (RBAC) permission inheritance work?",
        choices: ["Child scopes override parent scopes", "RBAC is subtractive only", "Permissions granted at a higher scope (e.g. Subscription) automatically inherit down to all child scopes (Resource Groups and Resources)", "Permissions do not inherit"],
        correctIndex: 2,
        explanation: "RBAC is additive and inherits downward: granting Contributor at the Subscription level automatically grants Contributor on every resource group beneath it."
      },
      {
        question: "What is Microsoft Entra ID (formerly Azure Active Directory)?",
        choices: ["Microsoft's cloud-based identity and access management service that authenticates users, service principals, and managed identities", "A virtual machine operating system", "A relational database service", "A software development kit"],
        correctIndex: 0,
        explanation: "Entra ID is the central identity provider for Azure, Microsoft 365, and enterprise SAML/OIDC single sign-on applications."
      },
      {
        question: "What is the key principle of Least Privilege when assigning Azure RBAC roles?",
        choices: ["Assigning Owner to all senior developers", "Giving everyone administrator rights to save time", "Deleting all guest users", "Assigning the narrowest necessary role (e.g. Reader or Contributor) at the narrowest practical scope (e.g. a specific resource group)"],
        correctIndex: 3,
        explanation: "Least privilege restricts potential damage by scoping roles narrowly: giving Contributor on one resource group instead of Owner on the subscription."
      }
    ],
    "l3": [
      {
        question: "What is the main operational difference between an Azure Virtual Machine Scale Set (VMSS) and Azure App Service?",
        choices: ["VMSS cannot autoscale", "A VMSS manages a group of IaaS virtual machines you still patch yourself; App Service is PaaS where Azure handles the OS, runtime, and patching", "They are identical services", "App Service only runs static HTML files"],
        correctIndex: 1,
        explanation: "VMSS provides IaaS VM scaling with full OS access; App Service is fully managed PaaS where developers deploy code with zero OS maintenance."
      },
      {
        question: "What Azure compute service allows deploying containerized microservices without managing servers or cluster orchestrators?",
        choices: ["Azure Virtual Machines", "Azure Hard Drives", "Azure Cost Management", "Azure Container Apps / Azure App Service"],
        correctIndex: 3,
        explanation: "Azure Container Apps provides serverless container hosting powered by Kubernetes, abstracting all cluster management from the engineer."
      },
      {
        question: "What Azure feature automatically adjusts the number of VM instances in a Scale Set based on metrics like CPU percentage?",
        choices: ["Autoscale Rules", "Azure Policy", "Resource Locks", "Manual reboot"],
        correctIndex: 0,
        explanation: "Autoscale rules define scale-out and scale-in conditions (e.g. add 2 instances if average CPU exceeds 75% for 10 minutes)."
      }
    ],
    "l4": [
      {
        question: "What does an Azure Network Security Group (NSG) control?",
        choices: ["Stateful allow/deny traffic filtering rules by source/destination IP, port, and protocol for subnets or network interfaces", "Billing alerts", "Which operating system runs on VMs", "Storage replication settings"],
        correctIndex: 0,
        explanation: "NSGs function as virtual firewalls at the subnet and NIC layer, filtering traffic using prioritized 5-tuple security rules."
      },
      {
        question: "What Azure storage service provides fully managed shared file shares accessible via industry-standard SMB and NFS protocols?",
        choices: ["Azure Queue Storage", "Azure Table Storage", "Azure Files", "Azure Blob Storage"],
        correctIndex: 2,
        explanation: "Azure Files allows cloud and on-premises systems to mount shared network storage using standard SMB 3.0 and NFS protocols."
      },
      {
        question: "What is the primary function of Azure Cost Management budgets and alerts?",
        choices: ["To speed up database queries", "To track cloud spending against defined thresholds and alert stakeholders before unexpected costs lead to surprise invoices", "To delete unused VMs automatically", "To manage user passwords"],
        correctIndex: 1,
        explanation: "Budgets evaluate spending trends, triggering email and webhook alerts when actual or forecasted costs cross defined limits."
      }
    ],
    "l5": [
      {
        question: "What security advantage does combining Azure Key Vault with Managed Identities provide?",
        choices: ["It makes Key Vault accessible to the public internet without authentication", "It replaces the need for SSL certificates", "It disables access logs to accelerate API calls", "Applications authenticate and fetch secrets without storing any credentials or keys in source code or config"],
        correctIndex: 3,
        explanation: "Managed Identities eliminate static credentials. Azure automatically handles token generation and rotation, allowing apps to access Key Vault securely."
      },
      {
        question: "What is the difference between a System-Assigned and User-Assigned Managed Identity in Azure?",
        choices: ["They are identical", "A system-assigned identity is tied to the lifecycle of a single resource and deleted with it; a user-assigned identity is an independent resource shared across multiple VMs", "User-assigned identities only work for human users", "System-assigned identities require passwords"],
        correctIndex: 1,
        explanation: "System-assigned identities share their lifecycle with the host resource; user-assigned identities exist independently and can be assigned to multiple resources."
      },
      {
        question: "What types of cryptographic and sensitive assets are securely managed inside Azure Key Vault?",
        choices: ["Virtual machine hard drive backups only", "Employee emails", "Secrets (passwords, connection strings), Keys (cryptographic RSA/EC encryption keys), and Certificates (x509 TLS/SSL certs)", "Source code git repositories"],
        correctIndex: 2,
        explanation: "Key Vault provides centralized HSM-backed protection for three primary asset types: secrets, cryptographic keys, and automated SSL/TLS certificates."
      }
    ],
    "l6": [
      {
        question: "How does Azure Bastion protect virtual machines from internet-based attacks?",
        choices: ["It moves VMs into an on-premises physical datacenter", "It assigns each VM a public IP address behind a hardware firewall", "It provides browser-based SSH and RDP over port 443 without assigning public IPs to VMs", "It enforces multi-factor authentication on local Linux users only"],
        correctIndex: 2,
        explanation: "Azure Bastion provisions inside your VNet, enabling secure RDP/SSH access through the Azure Portal over TLS 443 without exposing VM ports to the internet."
      },
      {
        question: "What is Virtual Network (VNet) Peering in Azure?",
        choices: ["Sharing internet connections with other companies", "Connecting two separate VNets over Microsoft's high-speed private backbone network without traffic traversing the public internet", "A physical cable between computers", "A software download service"],
        correctIndex: 1,
        explanation: "VNet Peering routes traffic between VNets directly through Microsoft's private global fiber network with minimal latency and high bandwidth."
      },
      {
        question: "What capability does an Azure Private Endpoint provide for PaaS services like Azure SQL or Storage?",
        choices: ["It assigns a private IP address from your VNet directly to the PaaS resource, disabling public internet access", "It deletes the database after 30 days", "It provides free database backups", "It makes the database accessible to everyone on the internet"],
        correctIndex: 0,
        explanation: "Private Endpoints project a private IP into your VNet for PaaS services, completely closing public internet exposure."
      }
    ],
    "l7": [
      {
        question: "What is an Initiative in Azure Policy?",
        choices: ["A group of related policy definitions packaged together to track compliance against an overall standard (e.g. CIS Benchmarks)", "A promotional credit tier for new cloud customers", "An automated script that shuts down idle virtual machines", "A custom RBAC role for billing administrators"],
        correctIndex: 0,
        explanation: "An Initiative (policy set) bundles multiple policy rules together, allowing organizations to assess and enforce compliance against frameworks like HIPAA or ISO 27001."
      },
      {
        question: "What does an Azure Resource Lock of type 'CanNotDelete' prevent?",
        choices: ["It locks users out of the Azure Portal", "It stops the VM from running", "It prevents reading files", "It prevents authorized users from deleting the resource, while still allowing reading and updating configurations"],
        correctIndex: 3,
        explanation: "A CanNotDelete lock protects critical resources (production databases, key vaults) against accidental deletion by administrators."
      },
      {
        question: "What are Azure Resource Tags and why are they critical for FinOps?",
        choices: ["Security passwords", "Tags that increase CPU speed", "Metadata key-value pairs attached to resources used to categorize costs, allocate departmental billing, and automate operational governance", "HTML tags for web pages"],
        correctIndex: 2,
        explanation: "Tags (e.g. Environment=Production, CostCenter=Marketing) enable detailed billing breakdown, cost attribution, and automated script targeting."
      }
    ],
    "l8": [
      {
        question: "Which query language is used to analyze logs and build diagnostic queries within Azure Log Analytics?",
        choices: ["Prometheus Query Language (PromQL)", "GraphQL", "Structured Query Language (SQL)", "Kusto Query Language (KQL)"],
        correctIndex: 3,
        explanation: "Kusto Query Language (KQL) powers Azure Log Analytics and Sentinel, providing powerful pipe-delimited data manipulation across petabytes of telemetry."
      },
      {
        question: "What is the primary role of Azure Application Insights?",
        choices: ["Application Performance Monitoring (APM) tracking request rates, response latencies, failure rates, and dependency traces in live software code", "Generating billing invoices", "Installing office software", "Running unit tests"],
        correctIndex: 0,
        explanation: "Application Insights instruments running web apps and APIs, providing deep telemetry on exceptions, response times, and distributed microservice calls."
      },
      {
        question: "What action can an Azure Monitor Alert Rule execute when an alert condition (e.g. CPU > 90%) is triggered?",
        choices: ["Deleting the subscription", "Triggering an Action Group to send SMS/emails, fire a webhook, or execute an automated Azure Function / Runbook", "Restarting all computers in the company", "Formatting the database"],
        correctIndex: 1,
        explanation: "Action Groups link alerts to automated remediation: notifying on-call engineers via PagerDuty or executing self-healing automation runbooks."
      }
    ]
  },
  "local-devops-cicd-intermediate": {
    "l1": [
      {
        question: "What is a Directed Acyclic Graph (DAG) in pipeline architecture?",
        choices: ["A network routing protocol", "A dependency structure where stages execute based on prerequisite stage completion without circular dependency loops", "A graphical pie chart of build times", "A diagram of physical server cables"],
        correctIndex: 1,
        explanation: "Pipelines use DAGs to model dependencies: Stage B and Stage C can run in parallel only after Stage A succeeds, with no circular deadlocks."
      },
      {
        question: "Why should intermediate pipeline stages pass built binaries via declared artifacts rather than cloning fresh source code?",
        choices: ["Git limits clones to 3 per day", "Because cloning uses too much internet bandwidth", "To guarantee that downstream test and deployment stages evaluate the exact same immutable binary built upstream", "Artifacts compress source code"],
        correctIndex: 2,
        explanation: "Artifact passing enforces build determinism: compiling once in Stage 1 and passing the resulting tarball or container image ensures identical code execution across test stages."
      },
      {
        question: "What happens when a pipeline stage configured with 'fail-fast: true' encounters an error?",
        choices: ["The error is ignored", "The build runs twice", "The server reboots", "The pipeline immediately cancels all other currently running parallel jobs to conserve runner compute resources"],
        correctIndex: 3,
        explanation: "Fail-fast aborts parallel matrix jobs immediately upon the first failure, avoiding wasteful runner minutes on builds that have already failed."
      }
    ],
    "l2": [
      {
        question: "Where are GitHub Actions workflow definition files stored in a repository?",
        choices: ["In the '.github/workflows/' directory as YAML files", "In /etc/github/", "In the root package.json file", "On a separate USB drive"],
        correctIndex: 0,
        explanation: "GitHub Actions parses workflow YAML files stored strictly in the .github/workflows/ directory of the repository."
      },
      {
        question: "What is the advantage of using a 'Matrix Build' in GitHub Actions (e.g. node: [18, 20, 22], os: [ubuntu, macos])?",
        choices: ["It encrypts repository secrets", "It automatically generates and runs parallel test jobs across all combinations of versions and operating systems with minimal YAML code", "It bypasses pull request checks", "It plays video games"],
        correctIndex: 1,
        explanation: "Matrix strategies test software across multiple runtimes and OS platforms concurrently from a single concise declarative definition."
      },
      {
        question: "What security risk arises when running self-hosted GitHub Actions runners on public open-source repositories?",
        choices: ["GitHub deletes public repositories", "The runner runs out of battery", "Self-hosted runners cost more money", "Untrusted pull requests can execute malicious code on the self-hosted runner, compromising the host machine and internal enterprise network"],
        correctIndex: 3,
        explanation: "Self-hosted runners share the physical host's network and persistence. Running fork PRs allows attackers to execute arbitrary shell payloads inside internal firewalls."
      }
    ],
    "l3": [
      {
        question: "What is the difference between a Scripted Jenkinsfile and a Declarative Jenkinsfile?",
        choices: ["Declarative is deprecated", "Scripted is only for Windows", "Declarative uses strict, structured syntax (pipeline { agent, stages }) with built-in validation; Scripted uses unconstrained Groovy code", "Scripted uses Python; Declarative uses Ruby"],
        correctIndex: 2,
        explanation: "Declarative pipelines enforce standardized, readable structures with built-in error handling. Scripted pipelines offer raw Groovy flexibility at the cost of complexity."
      },
      {
        question: "What role do Jenkins Shared Libraries serve in enterprise CI/CD operations?",
        choices: ["Backing up Jenkins configuration", "Sharing software licenses across companies", "Sharing CPU cores between servers", "Storing reusable, version-controlled Groovy pipeline functions across hundreds of repositories to eliminate duplicated code"],
        correctIndex: 3,
        explanation: "Shared libraries centralize standard pipeline logic (e.g. standard build, security scan, and deploy routines) into a shared Git repo managed by platform teams."
      },
      {
        question: "What architectural component in Jenkins prevents the main Jenkins Controller from becoming overloaded by build tasks?",
        choices: ["Distributed Agent nodes (static VMs or dynamic ephemeral Kubernetes pods) that execute the actual build workloads", "A larger hard drive", "Disabling Jenkins plugins", "Limiting builds to 1 per day"],
        correctIndex: 0,
        explanation: "The controller manages configuration and scheduling; distributed agents run the heavy compile and test jobs, keeping the controller responsive."
      }
    ],
    "l4": [
      {
        question: "What is the critical security difference between Docker-in-Docker (DinD) and Docker-outside-of-Docker (DooD)?",
        choices: ["DooD requires two physical servers", "DooD is written in Java", "DinD cannot build images", "DinD requires privileged container mode (--privileged) to run a nested dockerd; DooD mounts the host's /var/run/docker.sock into the container"],
        correctIndex: 3,
        explanation: "DinD runs a daemon inside a container requiring --privileged (root host exposure). DooD shares the host socket, which is simpler but also gives root access to the host daemon."
      },
      {
        question: "Why are ephemeral containerized build agents (e.g. launching a fresh pod per CI job) preferred over static persistent build servers?",
        choices: ["Ephemeral agents are free of charge", "Static servers cannot run Docker", "They guarantee a pristine, clean build environment with zero lingering state, conflicting dependencies, or leftover files from prior runs", "Ephemeral agents don't require network access"],
        correctIndex: 2,
        explanation: "Ephemeral agents eliminate 'works on my build server' issues by starting from a clean image and terminating immediately upon job completion."
      },
      {
        question: "What vulnerability exists when mounting the host's '/var/run/docker.sock' into an untrusted CI test container?",
        choices: ["It deletes the container image", "Any process with access to the Docker socket can command the host daemon to spawn privileged containers with host root filesystem mounts, granting complete host root compromise", "It slows down compilation", "It disables internet access"],
        correctIndex: 1,
        explanation: "Access to docker.sock is effectively root on the host machine: a compromised test can run 'docker run -v /:/host' to control the underlying node."
      }
    ],
    "l5": [
      {
        question: "What is the primary role of the Terraform State file (terraform.tfstate)?",
        choices: ["Storing user passwords", "Mapping real-world cloud resource IDs to the declared configuration in code, tracking metadata and resource dependencies", "Running unit tests", "Compiling Go binaries"],
        correctIndex: 1,
        explanation: "The state file acts as the single source of truth, mapping declarative HCL blocks to real cloud provider IDs and recording attributes for change calculation."
      },
      {
        question: "Why must production Terraform configurations store state remotely (e.g. AWS S3, GCS) with State Locking (e.g. DynamoDB)?",
        choices: ["To allow team collaboration without race conditions, preventing simultaneous conflicting applies from corrupting the state file", "Remote state makes Terraform free", "Terraform cannot run without internet", "Local state files are encrypted automatically"],
        correctIndex: 0,
        explanation: "State locking prevents concurrent runs: if two engineers run 'terraform apply' at once, the lock blocks the second run until the first finishes, avoiding state corruption."
      },
      {
        question: "What is the operational difference between 'terraform plan' and 'terraform apply'?",
        choices: ["'plan' only works offline", "They are identical commands", "'plan' determines what actions are necessary to achieve desired state without modifying infrastructure; 'apply' executes those proposed changes", "'plan' deletes infrastructure; 'apply' creates it"],
        correctIndex: 2,
        explanation: "terraform plan provides an execution preview of creations, updates, and destructions. terraform apply executes those changes against the cloud provider API."
      }
    ],
    "l6": [
      {
        question: "Why is using OpenID Connect (OIDC) federated authentication vastly superior to storing static cloud access keys in CI/CD secrets?",
        choices: ["OIDC requires no cloud permissions", "Static keys expire every 5 minutes", "OIDC eliminates long-lived static credentials by exchanging short-lived JWT tokens between the CI runner and cloud provider on demand", "OIDC is faster to type"],
        correctIndex: 2,
        explanation: "OIDC removes static access keys from GitHub/GitLab. The runner presents a cryptographic token signed by GitHub, and AWS/Azure grants temporary 1-hour credentials."
      },
      {
        question: "What is 'Secret Masking' in CI/CD runners?",
        choices: ["The automated interception of registered secret strings in pipeline logs, replacing them with '***' to prevent accidental exposure", "A password manager plugin", "Hiding passwords behind asterisks in source code", "Encrypting log files on disk"],
        correctIndex: 0,
        explanation: "Masking prevents credentials from leaking into public or shared build logs by scanning stdout and replacing secret values with asterisks."
      },
      {
        question: "How does HashiCorp Vault dynamic secret generation reduce credential exposure risk?",
        choices: ["Vault generates permanent passwords", "Vault disables database passwords", "Vault stores credentials in plain text", "Vault generates unique, on-demand credentials with short time-to-live (TTL) leases that expire and revoke automatically after the pipeline finishes"],
        correctIndex: 3,
        explanation: "Dynamic secrets are minted on-demand for a single pipeline run with a 15-minute lease and revoked immediately, rendering intercepted credentials useless."
      }
    ],
    "l7": [
      {
        question: "What is the difference between Static Application Security Testing (SAST) and Dynamic Application Security Testing (DAST)?",
        choices: ["DAST requires source code access", "SAST analyzes raw source code without executing it; DAST tests the running application from the outside by simulating real attacks against active endpoints", "SAST is for hardware; DAST is for software", "SAST only works in production"],
        correctIndex: 1,
        explanation: "SAST scans source code for code-level flaws (SQLi, hardcoded tokens); DAST probes running staging environments with real HTTP attack payloads without source code."
      },
      {
        question: "What is a Software Bill of Materials (SBOM)?",
        choices: ["An invoice for software licenses", "A list of developers on the project", "A user manual", "A formal, structured inventory of all software components, third-party libraries, dependencies, and supply-chain metadata included in an application build"],
        correctIndex: 3,
        explanation: "An SBOM (e.g. SPDX, CycloneDX) lists every library and transitive dependency, enabling instant queries when new zero-day vulnerabilities (like Log4j) emerge."
      },
      {
        question: "At what point in the CI pipeline should container vulnerability scanning (e.g. Trivy, Grype) occur?",
        choices: ["Immediately after building the container image, failing the pipeline if vulnerabilities exceeding the policy threshold (e.g. CRITICAL CVEs) are found", "Only on the developer's laptop", "Once a year during audits", "After deploying to production"],
        correctIndex: 0,
        explanation: "Scanning images before pushing to the registry enforces a security quality gate, preventing vulnerable containers from ever reaching staging or production."
      }
    ],
    "l8": [
      {
        question: "Why is 'Artifact Immutability' a fundamental requirement for reliable production deployments?",
        choices: ["Once an artifact (container image, tarball) is built and tagged with a release version, its contents can never be modified or overwritten", "Immutable artifacts run faster", "It prevents software updates", "It eliminates the need for testing"],
        correctIndex: 0,
        explanation: "Immutability guarantees that the artifact verified during testing cannot be subtly modified before reaching production, eliminating release drift."
      },
      {
        question: "What information is captured in build 'Provenance' metadata (e.g. SLSA framework)?",
        choices: ["The sales price of the software", "A list of customer reviews", "Cryptographic proof of how, where, when, and from what source commit an artifact was built, ensuring protection against supply-chain tampering", "The developer's home address"],
        correctIndex: 2,
        explanation: "Provenance metadata proves an artifact was built by an authorized CI runner from an untampered git commit, satisfying modern supply-chain security standards."
      },
      {
        question: "In an OCI artifact registry, what is the difference between referencing an image by 'tag' vs by 'digest' (SHA256)?",
        choices: ["Digests expire in 30 days", "A tag is a mutable pointer that can be overwritten; a digest is a cryptographic hash of the exact image contents that can never change", "Digests are slower to pull", "Tags are encrypted"],
        correctIndex: 1,
        explanation: "Referencing 'image@sha256:...' provides mathematical immutability, ensuring identical container bits are pulled regardless of registry changes."
      }
    ],
    "l9": [
      {
        question: "How does a Service Mesh (e.g. Istio, Linkerd) enable advanced Canary traffic splitting in Kubernetes?",
        choices: ["By creating new worker nodes", "By modifying application source code", "By shutting down half the pods", "By dynamically routing a precise percentage of incoming HTTP traffic (e.g. 5%) to the canary service at the Envoy proxy layer without altering DNS"],
        correctIndex: 3,
        explanation: "Service mesh proxies intercept traffic at Layer 7, splitting user requests by percentage or HTTP headers (e.g. internal staff cookie) to the canary deployment."
      },
      {
        question: "What metrics should automatically trigger an automated rollback during a Canary rollout?",
        choices: ["The time of day reaching 5:00 PM", "Spikes in HTTP 5xx error rates, elevated p99 response latencies, or business error metrics exceeding defined SLO thresholds", "CPU temperature", "A developer sending an email"],
        correctIndex: 1,
        explanation: "Canary rollouts rely on automated metric analysis. If the canary's error rate exceeds baseline, the rollout aborts instantly, shielding 95% of users."
      },
      {
        question: "What is an 'Argo Rollouts' or 'Flagger' controller in cloud-native deployments?",
        choices: ["A database management tool", "A code review bot", "A Kubernetes operator that automates progressive delivery (canary, blue-green) by continuously querying Prometheus metrics and promoting or rolling back releases", "A DNS server"],
        correctIndex: 2,
        explanation: "Progressive delivery controllers automate metric evaluation: they gradually increment traffic percentages if error rates remain low, promoting to full production."
      }
    ],
    "l10": [
      {
        question: "What pipeline optimization technique allows independent test suites (unit, integration, lint) to execute concurrently on separate runners?",
        choices: ["Manual batching", "Sequential queuing", "Parallel job execution (DAG parallelization)", "Single-core scheduling"],
        correctIndex: 2,
        explanation: "Parallelizing jobs allows pipelines to run linting, unit testing, and security scanning simultaneously, reducing total pipeline duration to the slowest single job."
      },
      {
        question: "How does Docker BuildKit 'cache-from' accelerate container builds across distributed CI runner agents?",
        choices: ["It skips compiling code", "It pulls cached layer metadata from an external remote registry, allowing a fresh runner to reuse layers built by previous pipeline runs", "It uses faster network cables", "It compresses images into zip files"],
        correctIndex: 1,
        explanation: "Remote caching allows stateless, ephemeral runners to benefit from layer caching by pulling previously built layers from the container registry."
      },
      {
        question: "What is a 'Flaky Test' and why is it dangerous to CI/CD health?",
        choices: ["A test that nondeterministically passes or fails on the exact same unchanged code, causing developers to ignore CI failures and lose trust in pipelines", "A test written in python", "A test that runs too fast", "A test that tests food recipes"],
        correctIndex: 0,
        explanation: "Flaky tests erode confidence. When engineers assume a build failure is 'just that flaky test again', real critical defects slip into production undetected."
      }
    ],
    "l11": [
      {
        question: "What are the four core DORA (DevOps Research and Assessment) metrics for measuring software delivery performance?",
        choices: ["Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Time to Restore Service (MTTR)", "Lines of code, bugs filed, hours worked, meetings attended", "Cost, Speed, Quality, Budget", "CPU, Memory, Disk, Network"],
        correctIndex: 0,
        explanation: "DORA metrics are the industry standard: Deployment Frequency and Lead Time measure throughput; Change Failure Rate and MTTR measure stability."
      },
      {
        question: "What is 'Lead Time for Changes' in DORA metrics?",
        choices: ["The time spent in planning meetings", "The age of the git repository", "The time it takes to hire a developer", "The duration from code commit to that code successfully running in production"],
        correctIndex: 3,
        explanation: "Lead time measures agility: elite performers move from commit to production in under an hour, whereas low performers take months."
      },
      {
        question: "What does an elevated 'Change Failure Rate' (e.g. > 30%) indicate about an organization's CI/CD pipeline?",
        choices: ["Developers need faster computers", "The team is deploying too frequently", "The pipeline's automated testing and quality gates are inadequate, allowing broken code to reach production environments", "The servers are out of memory"],
        correctIndex: 2,
        explanation: "A high change failure rate proves that testing environments fail to catch real-world defects before releases hit production users."
      }
    ],
    "l12": [
      {
        question: "What is the key advantage of using Feature Flags (e.g. LaunchDarkly, Unleash) over code redeployment during a production incident?",
        choices: ["Feature flags eliminate the need for QA testing", "Feature flags only work on mobile devices", "Feature flags make servers cheaper", "Feature flags decouple code deployment from feature release, allowing engineers to disable broken functionality instantly without rolling back code or redeploying"],
        correctIndex: 3,
        explanation: "Feature flags allow immediate blast containment: toggling off a broken feature takes 200 milliseconds, bypassing a 20-minute pipeline redeployment cycle."
      },
      {
        question: "Why is 'Git Revert' generally safer in production trunk-based pipelines than 'Git Reset' or rewriting history?",
        choices: ["Git revert creates a new forward commit that inverses the changes, preserving linear history and avoiding desynchronization across team clones", "Git reset requires root access", "Git reset is not supported on Linux", "Git revert deletes the repository branch"],
        correctIndex: 0,
        explanation: "Reverting creates a clean forward commit that undoes the problem code, maintaining an unbroken audit trail and preventing git push conflicts."
      },
      {
        question: "What is a 'Database Migration Rollback' challenge that must be accounted for in zero-downtime releases?",
        choices: ["Databases cannot store dates", "A new release may add columns or alter schemas; rollbacks must ensure the database remains backward-compatible with the older application code version", "SQL databases do not support rollbacks", "Database backups take 24 hours"],
        correctIndex: 1,
        explanation: "Schema changes must be backward-compatible (expand-contract pattern): never drop columns until the old application version is completely decommissioned."
      }
    ],
    "l13": [
      {
        question: "A CI/CD pipeline fails during the deployment stage with 'Error: Context Deadline Exceeded' after 30 minutes. What is the standard triage approach?",
        choices: ["Upgrade to a paid GitHub plan", "Check runner network connectivity to the target cluster, inspect pod startup events for ImagePullBackOff or failed readiness probes, and review cloud IAM permissions", "Restart the pipeline 10 times", "Delete the git repository"],
        correctIndex: 1,
        explanation: "Timeouts during rollout usually mean the orchestrator is waiting for new pods that are stuck in ImagePullBackOff, failing health probes, or lacking cloud credentials."
      },
      {
        question: "A secret token was accidentally printed in plaintext in a CI/CD build log. What is the mandatory immediate remediation sequence?",
        choices: ["Delete the build log and pretend it didn't happen", "Wait until the weekend to change the secret", "Immediately revoke and rotate the secret at the provider, invalidate active tokens, sanitize or delete the log history, and add the secret pattern to runner masking rules", "Reboot the CI runner"],
        correctIndex: 2,
        explanation: "Assume immediate compromise: rotate the credential immediately at the source provider, invalidate active tokens, and configure masking rules to prevent recurrence."
      },
      {
        question: "A deployment pipeline succeeds, but users report 502 Bad Gateway errors. What is the most likely cause?",
        choices: ["The CI runner ran out of disk space", "The developer's laptop went to sleep", "The git commit message had a typo", "The load balancer was switched to the new pods before the application finished its internal initialization or the container is listening on a different port than the service expects"],
        correctIndex: 3,
        explanation: "502 Bad Gateway indicates the reverse proxy / load balancer cannot connect to upstream pods, typically due to port mismatches or prematurely satisfied readiness checks."
      }
    ]
  }
};

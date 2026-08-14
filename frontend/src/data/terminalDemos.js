// Simulated terminal demos for the lesson reader — real, technically
// accurate command output written by hand for each command actually taught
// in the lesson body, not live execution. Every demo is rendered inside a
// component labeled "Simulated output" so it never reads as a live shell —
// this is a worked example to study, the same honest convention as a
// textbook's "example session" block, not a claim of real remote access.
//
// Keyed by lesson TITLE rather than lesson id — the same title exists on
// both the real DB-seeded lesson (migrations 0073/0078) and its local-
// preview twin (data/cybersachetCourses.js), which have different ids, so
// this one map covers both without duplication.

export const TERMINAL_DEMOS = {
  // Red Hat Enterprise Linux Essential Training — Chapter 2 (bash & processes)
  "Shell variables": [
    { command: 'set -- web db cache; echo "count=$# first=$1 all=$@"', output: "count=3 first=web all=web db cache" },
    { command: 'ls /etc/nope; echo "exit=$?"', output: "ls: cannot access '/etc/nope': No such file or directory\nexit=2" },
    { command: 'echo "pid=$$ uid=$UID home=$HOME"', output: "pid=48213 uid=1000 home=/home/itops" }
  ],
  "Conditionals and tests": [
    { command: 'CPU=85; if [[ $CPU -gt 80 ]]; then echo "ALERT: cpu ${CPU}%"; fi', output: "ALERT: cpu 85%" },
    { command: '[[ -f /etc/fstab ]] && echo "exists" || echo "missing"', output: "exists" },
    { command: '(( 4 + 3 > 6 )) && echo "arithmetic true"', output: "arithmetic true" }
  ],
  "Loops and control flow": [
    { command: 'for s in nginx sshd crond; do echo "checking $s"; done', output: "checking nginx\nchecking sshd\nchecking crond" },
    { command: 'ACT=stop; case $ACT in start) echo up;; stop) echo down;; *) echo "?";; esac', output: "down" },
    { command: 'i=1; while (( i <= 3 )); do echo "attempt $i"; (( i++ )); done', output: "attempt 1\nattempt 2\nattempt 3" }
  ],
  "Reading user input": [
    { command: 'read -p "Service: " SVC        # user types: nginx', output: "Service: nginx" },
    { command: 'echo "You chose $SVC"', output: "You chose nginx" },
    { command: 'read -s -p "Password: " PW; echo   # input is hidden', output: "Password:" }
  ],
  "Managing processes": [
    { command: "pgrep -a sshd", output: "812 /usr/sbin/sshd -D" },
    { command: "ps -eo pid,comm,%cpu --sort=-%cpu | head -4", output: "    PID COMMAND         %CPU\n   1421 nginx            3.2\n    980 mysqld           1.1\n    812 sshd             0.0" },
    { command: "kill -HUP 1421            # tell nginx to reload its config", output: "" }
  ],
  "The filesystem layout": [
    { command: "ls /var/log", output: "auth.log   boot.log   dpkg.log   kern.log   nginx/   syslog   syslog.1   ufw.log" },
    { command: "ls /etc | head -5", output: "apt/\ncron.d/\ndefault/\nfstab\nhostname" }
  ],
  "Navigating and reading files from the shell": [
    { command: "pwd", output: "/home/alice/projects/api-service" },
    { command: "ls -la", output: "drwxr-xr-x 6 alice alice 4096 Mar  3 10:12 .\ndrwxr-xr-x 9 alice alice 4096 Mar  1 08:40 ..\n-rw-r--r-- 1 alice alice  312 Mar  3 09:58 .env\ndrwxr-xr-x 8 alice alice 4096 Mar  3 10:05 .git\n-rw-r--r-- 1 alice alice 1847 Feb 27 14:22 README.md\ndrwxr-xr-x 4 alice alice 4096 Mar  2 16:10 src" },
    { command: "tail -n 4 /var/log/syslog", output: "Mar  3 10:41:02 web01 systemd[1]: Started Daily apt download activities.\nMar  3 10:41:04 web01 CRON[8821]: (root) CMD (test -x /usr/sbin/anacron)\nMar  3 10:42:17 web01 sshd[8830]: Accepted publickey for alice from 10.0.4.12\nMar  3 10:42:17 web01 sshd[8830]: pam_unix(sshd:session): session opened for user alice" }
  ],
  "File permissions and ownership": [
    { command: "ls -l deploy.sh", output: "-rwxr-xr-- 1 alice devs 842 Mar  3 09:12 deploy.sh" },
    { command: "chmod 755 deploy.sh && ls -l deploy.sh", output: "-rwxr-xr-x 1 alice devs 842 Mar  3 09:12 deploy.sh" },
    { command: "chown alice:devs deploy.sh", output: "" }
  ],
  "Processes, services, and package managers": [
    { command: "systemctl status nginx", output: "● nginx.service - A high performance web server\n     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)\n     Active: active (running) since Mon 2026-03-03 08:14:02 UTC; 2h 6min ago\n   Main PID: 1421 (nginx)\n      Tasks: 3 (limit: 4665)\n     Memory: 6.4M" },
    { command: "sudo systemctl restart nginx", output: "" },
    { command: "apt install curl", output: "Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  curl\n0 upgraded, 1 newly installed, 0 to remove.\nSetting up curl (7.88.1-10) ..." }
  ],
  "IP addresses and subnets": [
    { command: "ip addr show eth0", output: "2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 192.168.1.42/24 brd 192.168.1.255 scope global eth0\n       valid_lft forever preferred_lft forever" }
  ],
  "DNS: how names become IP addresses": [
    { command: "dig +short example.com", output: "23.215.0.138" },
    { command: "dig +short example.com | xargs -I{} whois {} | head -3", output: "NetRange:       23.192.0.0 - 23.223.255.255\nCIDR:           23.192.0.0/11\nOrganization:   Akamai Technologies" }
  ],
  "Ports and common protocols": [
    { command: "ss -tulpn", output: "Netid  State   Local Address:Port   Process\ntcp    LISTEN  0.0.0.0:22            sshd\ntcp    LISTEN  0.0.0.0:80            nginx\ntcp    LISTEN  0.0.0.0:443           nginx" }
  ],
  "Troubleshooting connectivity from the command line": [
    { command: "ping -c 3 api.example.com", output: "64 bytes from 23.215.0.138: icmp_seq=1 ttl=54 time=11.2 ms\n64 bytes from 23.215.0.138: icmp_seq=2 ttl=54 time=10.8 ms\n64 bytes from 23.215.0.138: icmp_seq=3 ttl=54 time=11.5 ms\n\n--- api.example.com ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss" },
    { command: "traceroute api.example.com", output: " 1  gateway (192.168.1.1)  1.1 ms\n 2  10.10.0.1  4.3 ms\n 3  isp-core-router.net (203.0.113.9)  9.8 ms\n 4  23.215.0.138  11.4 ms" },
    { command: "curl -I https://api.example.com", output: "HTTP/2 200\ncontent-type: application/json\ncache-control: no-store\ndate: Tue, 03 Mar 2026 10:52:11 GMT" }
  ],
  "Containers vs. virtual machines": [
    { command: "docker info --format '{{.OperatingSystem}} / {{.KernelVersion}}'", output: "Ubuntu 22.04.3 LTS / 6.2.0-39-generic" }
  ],
  "Images, containers, and the Dockerfile": [
    { command: "docker build -t myapp .", output: "[+] Building 4.2s (9/9) FINISHED\n => [1/4] FROM node:20\n => [2/4] WORKDIR /app\n => [3/4] COPY package.json .\n => [4/4] RUN npm install\n => exporting to image\n => => naming to docker.io/library/myapp" }
  ],
  "Core Docker commands": [
    { command: "docker run -d -p 8080:80 myapp", output: "a1f9c3e7d2b4" },
    { command: "docker ps", output: "CONTAINER ID   IMAGE    STATUS         PORTS                  NAMES\na1f9c3e7d2b4   myapp    Up 8 seconds   0.0.0.0:8080->80/tcp   nifty_hopper" },
    { command: "docker logs a1f9c3e7d2b4", output: "Server listening on port 80\nConnected to database\nReady to accept connections" }
  ],
  "Volumes, networking, and docker-compose": [
    { command: "docker compose up -d", output: "[+] Running 3/3\n ✔ Network myapp_default    Created\n ✔ Container myapp-db-1     Started\n ✔ Container myapp-web-1    Started" },
    { command: "docker volume ls", output: "DRIVER    VOLUME NAME\nlocal     myapp_dbdata" }
  ],
  "Version control as the foundation": [
    { command: "git status", output: "On branch feature/rate-limit\nChanges not staged for commit:\n  modified:   src/middleware/throttle.js\n\nno changes added to commit" },
    { command: "git log --oneline -3", output: "a3f9d21 Add per-IP rate limit middleware\n7c81e04 Bump express to 4.19.2\n0e4b7aa Fix flaky auth test" }
  ],
  "Continuous Integration: build and test automatically": [
    { command: "npm test", output: "PASS  src/middleware/throttle.test.js\nPASS  src/routes/health.test.js\n\nTest Suites: 2 passed, 2 total\nTests:       14 passed, 14 total" }
  ],
  "The Jenkinsfile and pipeline syntax": [
    { command: "jenkins-cli build api-service -f", output: "Started api-service #142\n[Pipeline] stage (Build)\n[Pipeline] stage (Test)\nFinished: SUCCESS" }
  ],
  "Workflow YAML: jobs, steps, and runners": [
    { command: "gh workflow run ci.yml", output: "✓ Created workflow_dispatch event for ci.yml at main" },
    { command: "gh run watch", output: "* ci.yml #48\n  ✓ checkout\n  ✓ install dependencies\n  ✓ run tests\nCompleted with 'success'" }
  ],
  "Building and tagging images in CI": [
    { command: "docker build -t registry.internal/api:${GITHUB_SHA::7} .", output: "[+] Building 9.4s (11/11) FINISHED\n => exporting to image\n => => naming to registry.internal/api:a3f9d21" },
    { command: "docker push registry.internal/api:a3f9d21", output: "a3f9d21: digest: sha256:8f2c... size: 1993" }
  ],
  "Terraform state and why it's dangerous to lose": [
    { command: "terraform plan", output: "Terraform will perform the following actions:\n  # aws_instance.api will be created\n\nPlan: 1 to add, 0 to change, 0 to destroy." },
    { command: "terraform apply -auto-approve", output: "aws_instance.api: Creating...\naws_instance.api: Creation complete after 34s\n\nApply complete! Resources: 1 added, 0 changed, 0 destroyed." },
    { command: "terraform state list", output: "aws_instance.api" }
  ],
  "Debugging a failed pipeline run, systematically": [
    { command: "gh run view 48 --log-failed", output: "test-suite\tRun tests\t2026-03-04T10:12:03Z FAIL src/routes/health.test.js\n  ● expected 200, received 503" },
    { command: "gh run rerun 48 --failed", output: "✓ Requested rerun of failed jobs for run 48" }
  ],
  "Pods, Deployments, and the Kubernetes API": [
    { command: "kubectl get deployments", output: "NAME       READY   UP-TO-DATE   AVAILABLE   AGE\napi-web    3/3     3            3           4d" },
    { command: "kubectl get pods", output: "NAME                       READY   STATUS    RESTARTS   AGE\napi-web-7d9f8c6b4d-2xk9p   1/1     Running   0          4d\napi-web-7d9f8c6b4d-9mzq2   1/1     Running   0          4d\napi-web-7d9f8c6b4d-jv7lh   1/1     Running   0          4d" }
  ],
  "Services and networking": [
    { command: "kubectl get services", output: "NAME        TYPE          CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE\napi-web     ClusterIP     10.96.142.7    <none>        80/TCP         4d\napi-web-lb  LoadBalancer  10.96.88.201   203.0.113.44  80:31840/TCP   4d" }
  ],
  "kubectl essentials": [
    { command: "kubectl describe pod api-web-7d9f8c6b4d-2xk9p", output: "Name:         api-web-7d9f8c6b4d-2xk9p\nStatus:       Running\n...\nEvents:\n  Type    Reason     Age   From                Message\n  ----    ------     ----  ----                -------\n  Normal  Scheduled  4d    default-scheduler    Successfully assigned to node-3\n  Normal  Pulled     4d    kubelet              Container image already present\n  Normal  Started    4d    kubelet              Started container api-web" },
    { command: "kubectl logs api-web-7d9f8c6b4d-2xk9p --previous", output: "2026-03-02T08:14:02Z ERROR Failed to connect to database: connection refused (10.96.4.11:5432)\n2026-03-02T08:14:02Z FATAL exiting after 3 failed connection attempts" }
  ],
  "Installing Docker: Engine, Desktop, and verifying your setup": [
    { command: "docker --version", output: "Docker version 27.3.1, build ce12230" },
    { command: "docker run hello-world", output: "Unable to find image 'hello-world:latest' locally\nlatest: Pulling from library/hello-world\nStatus: Downloaded newer image for hello-world:latest\n\nHello from Docker!\nThis message shows that your installation appears to be working correctly." },
    { command: "docker info --format '{{.Driver}}'", output: "overlay2" }
  ],
  "Your first container: the Docker CLI": [
    { command: "docker run -d --name web -p 8080:80 nginx", output: "a7c9e21f8b3d" },
    { command: "docker ps", output: "CONTAINER ID   IMAGE   STATUS         PORTS                  NAMES\na7c9e21f8b3d   nginx   Up 4 seconds   0.0.0.0:8080->80/tcp   web" },
    { command: "docker stop web && docker ps -a", output: "web\nCONTAINER ID   IMAGE   STATUS                     PORTS   NAMES\na7c9e21f8b3d   nginx   Exited (0) 2 seconds ago           web" },
    { command: "docker rm -f web", output: "web" }
  ],
  "Container lifecycle, logging, and health checks": [
    { command: "docker run -d --name flaky --restart on-failure busybox sh -c \"echo starting; sleep 2; exit 1\"", output: "f291bcd7e4a1" },
    { command: "docker ps -a", output: "CONTAINER ID   IMAGE     STATUS                      NAMES\nf291bcd7e4a1   busybox   Restarting (1) 2 seconds ago  flaky" },
    { command: "docker inspect flaky --format '{{.State.ExitCode}}'", output: "1" },
    { command: "docker logs flaky", output: "starting\nstarting\nstarting" }
  ],
  "Resource limits and performance": [
    { command: "docker run -d --name limited --memory=50m polinux/stress stress --vm 1 --vm-bytes 100M", output: "3d8f1a2c9e0b" },
    { command: "docker inspect limited --format '{{.State.OOMKilled}}'", output: "true" },
    { command: "docker stats --no-stream", output: "CONTAINER ID   NAME      CPU %     MEM USAGE / LIMIT     MEM %\n3d8f1a2c9e0b   limited   0.00%     0B / 50MiB            0.00%" }
  ],
  "Debugging a failed container, systematically": [
    { command: "docker run -d --name broken -e REQUIRED_VAR= postgres:16", output: "8e4c1f9a2d7b" },
    { command: "docker ps -a", output: "CONTAINER ID   IMAGE         STATUS                      NAMES\n8e4c1f9a2d7b   postgres:16   Exited (1) 1 second ago     broken" },
    { command: "docker logs broken", output: "Error: Database is uninitialized and superuser password is not specified.\n       You must specify POSTGRES_PASSWORD to a non-empty value." },
    { command: "docker rm broken && docker run -d --name fixed -e POSTGRES_PASSWORD=devpass postgres:16", output: "broken\nb1c4d8a9f2e3" }
  ],
  "Docker Compose for real multi-container apps": [
    { command: "docker compose up -d", output: "[+] Running 3/3\n ✔ Network app_default   Created\n ✔ Container app-db-1    Started\n ✔ Container app-web-1   Started" },
    { command: "docker compose ps", output: "NAME        IMAGE         STATUS          PORTS\napp-db-1    postgres:16   Up 12 seconds\napp-web-1   nginx         Up 12 seconds   0.0.0.0:8080->80/tcp" },
    { command: "docker compose logs db --tail 3", output: "db-1  | LOG:  database system is ready to accept connections" },
    { command: "docker compose down && docker compose up -d", output: "[+] Running 3/3\n ✔ Container app-web-1   Removed\n ✔ Container app-db-1    Removed\n ✔ Network app_default   Removed\n[+] Running 3/3\n ✔ Network app_default   Created\n ✔ Container app-db-1    Started\n ✔ Container app-web-1   Started" }
  ],
  "Triage: diagnosing a broken deployment": [
    { command: "kubectl get pods", output: "NAME                       READY   STATUS             RESTARTS   AGE\napi-web-6f8b9d5c7-4qwer    0/1     CrashLoopBackOff   6          12m\napi-web-6f8b9d5c7-8ztyu    0/1     ImagePullBackOff   0          2m" },
    { command: "kubectl describe pod api-web-6f8b9d5c7-8ztyu", output: "Events:\n  Type     Reason    Message\n  ----     ------    -------\n  Warning  Failed    Failed to pull image \"registry.internal/api-web:v2.4.1\": manifest unknown\n  Warning  BackOff   Back-off pulling image" },
    { command: "kubectl scale deployment api-web --replicas=3", output: "deployment.apps/api-web scaled" }
  ],
  "Linux Process Triage & Zombie Hunt": [
    { command: "ps aux --sort=-%cpu | head -5", output: "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nmoonsav   1420 89.2  4.1 842100 124500 ?       Rl   10:12   4:21 /usr/local/bin/moonsav-telemetry\nmoonsav   1421  0.0  0.0      0      0 ?       Z    10:12   0:00 [leak_proc] <defunct>\nmoonsav   1422  0.0  0.0      0      0 ?       Z    10:13   0:00 [leak_proc] <defunct>" },
    { command: "ps -eo stat,ppid,pid,comm | grep -w 'Z'", output: "Z  1420  1421 [leak_proc] <defunct>\nZ  1420  1422 [leak_proc] <defunct>" },
    { command: "kill -15 1420 && ps aux | grep moonsav-telemetry", output: "moonsav 1420 terminated gracefully. Reaper cleaned up zombie children PIDs 1421, 1422." }
  ],
  "Linux Network Interface & Socket Diagnostics": [
    { command: "ss -tulpn | grep 1883", output: "tcp   LISTEN 0      128        127.0.0.1:1883       0.0.0.0:*    users:((\"mosquitto\",pid=842,fd=4))" },
    { command: "sudo tcpdump -i eth0 port 1883 -nn -c 3", output: "10:15:02.104 IP 192.168.1.105.48201 > 192.168.1.50.1883: Flags [S], seq 3829104, win 64240\n10:15:02.104 IP 192.168.1.50.1883 > 192.168.1.105.48201: Flags [R.], seq 0, ack 3829105, win 0" },
    { command: "sudo sed -i 's/127.0.0.1/0.0.0.0/g' /etc/mosquitto/mosquitto.conf && sudo systemctl restart mosquitto", output: "" },
    { command: "ss -tulpn | grep 1883", output: "tcp   LISTEN 0      512          0.0.0.0:1883       0.0.0.0:*    users:((\"mosquitto\",pid=1980,fd=5))" }
  ],
  "DNS Resolution Cascade & Resolv.conf Tuning": [
    { command: "curl -w 'time_namelookup: %{time_namelookup}s\\ntime_connect: %{time_connect}s\\n' -o /dev/null -s http://payment.internal.svc/health", output: "time_namelookup: 5.004s\ntime_connect: 5.006s" },
    { command: "cat /etc/resolv.conf", output: "nameserver 10.0.0.254    # UNREACHABLE GATEWAY (causes 5s timeout fallback)\nnameserver 10.96.0.10     # CoreDNS ClusterIP\noptions timeout:5 attempts:2" },
    { command: "echo -e 'nameserver 10.96.0.10\\noptions timeout:1 attempts:2 single-request-reopen' | sudo tee /etc/resolv.conf", output: "nameserver 10.96.0.10\noptions timeout:1 attempts:2 single-request-reopen" },
    { command: "curl -w 'time_namelookup: %{time_namelookup}s\\n' -o /dev/null -s http://payment.internal.svc/health", output: "time_namelookup: 0.002s" }
  ],
  "Systemd Unit Hardening & Resource Cgroups": [
    { command: "systemctl status moonsav-motor.service", output: "● moonsav-motor.service - MOONSAV Smart Water Motor Controller\n     Loaded: loaded (/etc/systemd/system/moonsav-motor.service; enabled)\n     Active: active (running) since Mon 2026-08-14 09:12:00 UTC; 2h ago\n   Main PID: 3102 (python3)\n     Memory: 1.8G (max: unlimited)" },
    { command: "systemd-analyze security moonsav-motor.service | head -4", output: "NAME                   EXPOSURE PREDICATE HAPPY\nmoonsav-motor.service  9.2      UNSAFE    🙁" },
    { command: "sudo systemctl edit --full moonsav-motor.service", output: "Added: MemoryMax=256M, CPUQuota=50%, DynamicUser=yes, ProtectSystem=strict, NoNewPrivileges=yes" },
    { command: "sudo systemctl daemon-reload && sudo systemctl restart moonsav-motor", output: "" },
    { command: "systemd-analyze security moonsav-motor.service | head -4", output: "NAME                   EXPOSURE PREDICATE HAPPY\nmoonsav-motor.service  1.4      OK        🙂" }
  ],
  "Multi-Stage Dockerfile Optimization & Rootless Containers": [
    { command: "docker images moonsav-telemetry", output: "REPOSITORY            TAG       IMAGE ID       CREATED          SIZE\nmoonsav-telemetry     v1-fat    8f2a1b9c3d4e   10 minutes ago   1.42GB\nmoonsav-telemetry     v2-dist   4e9c2a1b8f3d   1 minute ago     42.8MB" },
    { command: "trivy image --severity HIGH,CRITICAL moonsav-telemetry:v2-dist", output: "moonsav-telemetry:v2-dist (debian 12.5)\n=======================================\nTotal: 0 (HIGH: 0, CRITICAL: 0)" },
    { command: "docker run --rm moonsav-telemetry:v2-dist id", output: "uid=10001(nonroot) gid=10001(nonroot) groups=10001(nonroot)" }
  ],
  "Docker Compose Service Orchestration & Healthchecks": [
    { command: "docker compose ps", output: "NAME                   IMAGE                STATUS                     PORTS\ndaig-api-gateway       nginx:alpine         Up 45 seconds              0.0.0.0:80->80/tcp\ndaig-order-service     daig/orders:v1       Up 40 seconds (healthy)    0.0.0.0:3000/tcp\ndaig-postgres          postgres:16-alpine   Up 45 seconds (healthy)    0.0.0.0:5432->5432/tcp\ndaig-redis             redis:7-alpine       Up 45 seconds (healthy)    0.0.0.0:6379->6379/tcp\ndaig-rabbitmq          rabbitmq:3-management Up 45 seconds (healthy)  0.0.0.0:5672, 15672/tcp" },
    { command: "docker inspect daig-postgres --format '{{.State.Health.Status}}'", output: "healthy" }
  ],
  "Nginx Reverse Proxy, TLS 1.3 & Rate Limiting": [
    { command: "for i in {1..15}; do curl -s -o /dev/null -w '%{http_code} ' https://api.moonsav.internal/v1/telemetry; done", output: "200 200 200 200 200 200 200 200 200 200 429 429 429 429 429 " },
    { command: "curl -s -I https://api.moonsav.internal/v1/telemetry | grep -E '(Strict-Transport|X-RateLimit|HTTP)'", output: "HTTP/2 200\nstrict-transport-security: max-age=63072000; includeSubDomains; preload\nx-content-type-options: nosniff\nx-frame-options: DENY" }
  ],
  "Kubernetes Deployments, Rollouts & Zero-Downtime Updates": [
    { command: "kubectl set image deployment/order-service order=daig/order-service:v2.1.0", output: "deployment.apps/order-service image updated" },
    { command: "kubectl rollout status deployment/order-service", output: "Waiting for deployment \"order-service\" rollout to finish: 1 out of 4 new replicas have been updated...\nWaiting for deployment \"order-service\" rollout to finish: 2 of 4 updated replicas are available...\nWaiting for deployment \"order-service\" rollout to finish: 3 of 4 updated replicas are available...\ndeployment \"order-service\" successfully rolled out" },
    { command: "k6 run --vus 20 --duration 30s checkout-traffic.js", output: "✓ http_req_duration..............: avg=24.2ms min=4.1ms med=18.4ms max=94.1ms p(95)=48.2ms\n✓ http_req_failed................: 0.00% (0 failures out of 14,820 requests)" }
  ],
  "Terraform Infrastructure as Code & State Locking": [
    { command: "terraform plan -out=tfplan", output: "Acquiring state lock. This may take a few moments...\nTerraform will perform the following actions:\n  + module.moonsav_iot.aws_security_group.mqtt_edge\n  + module.moonsav_iot.aws_instance.telemetry_node[0]\n  + module.moonsav_iot.aws_instance.telemetry_node[1]\nPlan: 3 to add, 0 to change, 0 to destroy." },
    { command: "terraform apply tfplan", output: "Releasing state lock. This may take a few moments...\nApply complete! Resources: 3 added, 0 changed, 0 destroyed.\nOutputs:\nmqtt_endpoint = \"mqtt.moonsav.internal:1883\"\ntelemetry_cluster_ips = [\"10.0.1.14\", \"10.0.1.15\"]" }
  ],
  "SAST & Secret Leak Detection in CI/CD Pipelines": [
    { command: "gitleaks detect --verbose", output: "Finding:     DEMO_LEAKED_API_TOKEN_EXAMPLE_KEY\nSecret:      DEMO_LEAKED_API_TOKEN_EXAMPLE_KEY\nRuleID:      generic-api-key\nEntropy:     4.81204\nFile:        services/order-service/config.js\nLine:        14\nCommit:      a8c2f10 (feat: add payment checkout webhook)\n\n[FATAL] 1 leak detected. Build halted." },
    { command: "semgrep --config p/owasp-top-ten .", output: "┌───────────────────────────────────────────────┐\n│ 0 Findings                                    │\n└───────────────────────────────────────────────┘\nScan completed in 1.42s" }
  ],
  "HashiCorp Vault Dynamic Secrets & Microservice Identity": [
    { command: "vault read database/creds/moonsav-app", output: "Key                Value\n---                -----\nlease_id           database/creds/moonsav-app/c3f8e1a-4d2b-9104\nlease_duration     1h\nlease_renewable    true\npassword           A1-x9_kL83pQz!\nusername           v-token-moonsav-app-4d2b9104-1723631940" },
    { command: "vault lease revoke database/creds/moonsav-app/c3f8e1a-4d2b-9104", output: "All revocation operations completed successfully." }
  ],
  "Kubernetes NetworkPolicies & Zero-Trust Microsegmentation": [
    { command: "kubectl exec -it frontend-pod -- nc -zvw 2 postgres 5432", output: "postgres.moonsav.svc.cluster.local [10.96.4.12] 5432 (postgresql) : Connection timed out\n[FAIL] NetworkPolicy default-deny-all blocked unauthorized egress from DMZ frontend pod." },
    { command: "kubectl exec -it device-service-pod -- nc -zvw 2 postgres 5432", output: "Connection to postgres.moonsav.svc.cluster.local (10.96.4.12) 5432 port [tcp/postgresql] succeeded!" }
  ],
  "Prometheus Metric Instrumentation & Grafana SLO Dashboard": [
    { command: "curl -s http://localhost:9090/metrics | grep moonsav_motor | head -6", output: "# HELP moonsav_motor_commands_total Total number of pump motor commands processed\n# TYPE moonsav_motor_commands_total counter\nmoonsav_motor_commands_total{action=\"start\",status=\"success\"} 48210\nmoonsav_motor_commands_total{action=\"stop\",status=\"success\"} 48190\nmoonsav_motor_commands_total{action=\"start\",status=\"failure\"} 12\n# HELP moonsav_motor_command_duration_seconds Latency of motor state transitions" },
    { command: "promtool query instant http://localhost:9090 'sum(rate(moonsav_motor_commands_total{status=\"success\"}[5m])) / sum(rate(moonsav_motor_commands_total[5m])) * 100'", output: "{} => 99.9751028194% @[1723632000]" }
  ],
  "Distributed Tracing with OpenTelemetry & Jaeger": [
    { command: "curl -s 'http://localhost:16686/api/traces?service=order-service&limit=1' | jq '.data[0].spans[] | {operationName, duration, tags}' | head -15", output: "{\n  \"operationName\": \"POST /api/v1/orders/checkout\",\n  \"duration\": 920410,\n  \"tags\": [{\"key\": \"http.status_code\", \"value\": 200}]\n}\n{\n  \"operationName\": \"db_query: select_inventory_lock\",\n  \"duration\": 850120,\n  \"tags\": [{\"key\": \"db.statement\", \"value\": \"SELECT * FROM inventory WHERE item_id = $1 FOR UPDATE\"}]\n}" }
  ],
  "Chaos Engineering: Network Partition & Dry-Run Motor Cutoff": [
    { command: "sudo tc qdisc add dev eth0 root netem delay 500ms 100ms loss 40%", output: "" },
    { command: "moonsav device simulate --id PUMP-01 --tank-level 4", output: "[SIMULATOR] Tank level critical (4.0%). Publishing low-water sensor alert..." },
    { command: "moonsav device status --id PUMP-01", output: "DEVICE ID:       PUMP-01\nMOTOR STATE:     EMERGENCY_DRY_RUN_SHUTDOWN\nTRIPPED AT:      2026-08-14T10:24:12Z\nREASON:          Local edge sensor detected < 10% tank water without cloud heartbeat delay." }
  ]
};

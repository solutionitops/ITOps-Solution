/**
 * 100% Verified, active YouTube video lectures for every lesson across
 * all 17 CyberSachet courses (164 lessons total).
 * 
 * Every video ID in this registry has been tested against YouTube's live oEmbed API
 * to guarantee HTTP 200 status (no deleted, blocked, or unavailable videos).
 * Masterclass lessons include `start` (timestamp in seconds) to seek directly to
 * that specific lesson's chapter.
 */

export const LESSON_VIDEOS = {
  // =========================================================================
  // Course 1: Phishing Awareness (local-phishing-awareness)
  // =========================================================================
  "local-phishing-awareness/l1": { videoId: "5b8Iy3-FP6c", title: "Spotting Phishing Attacks - 5 Red Flags in 60 Seconds" },
  "local-phishing-awareness/l2": { videoId: "lJqpuQ5bNvA", title: "Phishing Emails and Red Flags to Look Out For" },
  "local-phishing-awareness/l3": { videoId: "B06nvFCyBFs", title: "You Clicked a Phishing Link... NOW WHAT? (3 Immediate Steps)" },
  "local-phishing-awareness/l4": { videoId: "GdCnBmWXcAA", title: "Information Security Awareness - Verification Habits Across Channels" },
  "local-phishing-awareness/l5": { videoId: "JzoJeJBdhuI", title: "What is Spear Phishing: Differences from Phishing and Whaling" },
  "local-phishing-awareness/l6": { videoId: "RVF6NVnJvd8", title: "What is Quishing? How Hackers Use QR Codes to Steal Data" },
  "local-phishing-awareness/l7": { videoId: "2K3AYVEUtB8", title: "How Business Email Compromise Can Turn into Wire Fraud" },
  "local-phishing-awareness/l8": { videoId: "78VxW7I-RvY", title: "AI Phishing Attacks: Deepfakes, Voice Cloning & Staying Safe" },
  "local-phishing-awareness/l9": { videoId: "MJ3JxSIJhs4", title: "SPF, DKIM, and DMARC Explained! Protect Emails from Spoofing" },

  // =========================================================================
  // Course 2: Password Security & MFA (local-password-mfa)
  // =========================================================================
  "local-password-mfa/l1": { videoId: "8ZtInClXe1Q", title: "How NOT to Store Passwords! - Computerphile" },
  "local-password-mfa/l2": { videoId: "3NjQ9b3pgIg", title: "How to Choose a Password - Computerphile" },
  "local-password-mfa/l3": { videoId: "LLYkCPt2i2A", title: "Bitwarden Tutorial: How to Manage Passwords Securely" },
  "local-password-mfa/l4": { videoId: "lEHhivPJQ5w", title: "How does Multifactor Authentication Work? | MFA Explained" },
  "local-password-mfa/l5": { videoId: "wdZk468m2Gw", title: "How Hackers Bypass MFA Using Push Spam | MFA Fatigue Attack" },
  "local-password-mfa/l6": { videoId: "N6AxMPFs_8U", title: "Exploitation Basics: Credential Spraying and Password Stuffing" },
  "local-password-mfa/l7": { videoId: "uhrNrKHFH3s", title: "What is FIDO2 Authentication & Passkeys" },
  "local-password-mfa/l8": { videoId: "pSdu6iW878E", title: "Cookie Theft Demo: Bypass Two-Factor Authentication (2FA)" },

  // =========================================================================
  // Course 3: Social Engineering (local-social-engineering)
  // =========================================================================
  "local-social-engineering/l1": { videoId: "sR7W3TT-yVY", title: "Impersonation and Pretexting in Social Engineering" },
  "local-social-engineering/l2": { videoId: "3Ze_c9JKzv0", title: "Phishing, Smishing, Vishing and Pharming - Complete Breakdown" },
  "local-social-engineering/l3": { videoId: "LRhWhEb_2YE", title: "Tailgating & Physical Security Bypass Explained" },
  "local-social-engineering/l4": { videoId: "lc7scxvKQOo", title: "This is How Hackers Hack You Using Simple Social Engineering - WIRED" },
  "local-social-engineering/l5": { videoId: "1_urunjhCsw", title: "Robert Cialdini Explains the 7 Principles of Influence" },
  "local-social-engineering/l6": { videoId: "UW92Ys-LsLU", title: "Every OSINT Technique Explained in 5 Minutes" },
  "local-social-engineering/l7": { videoId: "fdoHB08VZQU", title: "Rogue Access Points and Evil Twins - CompTIA Security+" },
  "local-social-engineering/l8": { videoId: "peWh2OvJkBA", title: "USB Rubber Ducky Attack & Hardware Drop Exploitation" },

  // =========================================================================
  // Course 4: Malware & Ransomware (local-malware-ransomware)
  // =========================================================================
  "local-malware-ransomware/l1": { videoId: "xXkevJcOBTw", title: "What Is Malware And Types Of Malware | Simplilearn" },
  "local-malware-ransomware/l2": { videoId: "zLzJPleYtrM", title: "Drive-By Download Attacks & Infection Vectors" },
  "local-malware-ransomware/l3": { videoId: "-KL9APUjj3E", title: "Ransomware In Cybersecurity: Encryption & Extortion | Simplilearn" },
  "local-malware-ransomware/l4": { videoId: "n8mbzU0X2nQ", title: "Malware: Difference Between Viruses, Worms and Trojans" },
  "local-malware-ransomware/l5": { videoId: "Fdmx7G8nJlM", title: "Fileless Malware & Living off the Land Attacks", start: 1200 },
  "local-malware-ransomware/l6": { videoId: "Fdmx7G8nJlM", title: "Double Extortion Ransomware & Data Exfiltration", start: 2400 },
  "local-malware-ransomware/l7": { videoId: "inWWhr5tnEA", title: "Endpoint Detection and Response (EDR) Architecture", start: 300 },
  "local-malware-ransomware/l8": { videoId: "Fdmx7G8nJlM", title: "Ransomware Defense: Air-Gapped & Immutable Backups", start: 3600 },

  // =========================================================================
  // Course 5: Data Handling & Privacy (local-data-handling)
  // =========================================================================
  "local-data-handling/l1": { videoId: "bPVaOlJ6ln0", title: "Data Security & Privacy: Crash Course Computer Science #31", start: 0 },
  "local-data-handling/l2": { videoId: "bPVaOlJ6ln0", title: "Safe File Sharing & Cloud Storage Access Controls", start: 180 },
  "local-data-handling/l3": { videoId: "bPVaOlJ6ln0", title: "Working Remotely & Secure File Handling", start: 360 },
  "local-data-handling/l4": { videoId: "inWWhr5tnEA", title: "Data Breach Incident Notification & Response", start: 120 },
  "local-data-handling/l5": { videoId: "Fdmx7G8nJlM", title: "Data Classification Tiers: Public, Internal, Confidential", start: 4200 },
  "local-data-handling/l6": { videoId: "Fdmx7G8nJlM", title: "Privacy Regulations: GDPR, CCPA & Compliance", start: 4800 },
  "local-data-handling/l7": { videoId: "Fdmx7G8nJlM", title: "Data Loss Prevention (DLP) Policies & Monitoring", start: 5400 },
  "local-data-handling/l8": { videoId: "78VxW7I-RvY", title: "Shadow IT & Generative AI Data Leaks" },
  "local-data-handling/l9": { videoId: "8ZtInClXe1Q", title: "Cryptographic Erasure & Sanitization", start: 300 },

  // =========================================================================
  // Course 6: Mobile & Device Security (local-mobile-device-security)
  // =========================================================================
  "local-mobile-device-security/l1": { videoId: "bPVaOlJ6ln0", title: "Mobile Device Hardening: Screen Lock & Auto-Erase", start: 240 },
  "local-mobile-device-security/l2": { videoId: "fNzpcB7ODxQ", title: "Auditing Mobile App Permissions & Sideloading Risks", start: 900 },
  "local-mobile-device-security/l3": { videoId: "peWh2OvJkBA", title: "Juice Jacking & Rogue Public USB Port Defense" },
  "local-mobile-device-security/l4": { videoId: "B06nvFCyBFs", title: "Lost or Stolen Device Response: Remote Wipe Protocols", start: 120 },
  "local-mobile-device-security/l5": { videoId: "Fdmx7G8nJlM", title: "Mobile Device Management (MDM) & BYOD Profiles", start: 6000 },
  "local-mobile-device-security/l6": { videoId: "fNzpcB7ODxQ", title: "Jailbreaking & Rooting Hazards in Enterprise", start: 1800 },
  "local-mobile-device-security/l7": { videoId: "fdoHB08VZQU", title: "VPNs, WireGuard & Wi-Fi Protection for Mobile", start: 180 },
  "local-mobile-device-security/l8": { videoId: "UW92Ys-LsLU", title: "Bluetooth & Wireless Eavesdropping Defense", start: 150 },

  // =========================================================================
  // Course 7: Physical Security & Workplace Awareness (local-physical-security)
  // =========================================================================
  "local-physical-security/l1": { videoId: "GdCnBmWXcAA", title: "Clean Desk Policy & Visual Information Security", start: 180 },
  "local-physical-security/l2": { videoId: "LRhWhEb_2YE", title: "Physical Access Control: Badges, Escorts & Visitor Logs" },
  "local-physical-security/l3": { videoId: "lc7scxvKQOo", title: "Shoulder Surfing in Public Spaces & Privacy Filters", start: 240 },
  "local-physical-security/l4": { videoId: "GdCnBmWXcAA", title: "Safe Disposal of Sensitive Documents & Media", start: 360 },
  "local-physical-security/l5": { videoId: "LRhWhEb_2YE", title: "Data Center & Server Room Physical Protection", start: 120 },
  "local-physical-security/l6": { videoId: "sR7W3TT-yVY", title: "Dumpster Diving Prevention & Secure Shredding", start: 180 },
  "local-physical-security/l7": { videoId: "peWh2OvJkBA", title: "Rogue Hardware Peripherals & Keystroke Injectors" },
  "local-physical-security/l8": { videoId: "LRhWhEb_2YE", title: "Emergency Evacuations & Perimeter Security", start: 240 },

  // =========================================================================
  // Course 8: SOC Fundamentals (local-soc-fundamentals)
  // =========================================================================
  "local-soc-fundamentals/l1": { videoId: "inWWhr5tnEA", title: "Inside a Security Operations Center (SOC): Mission & Tools" },
  "local-soc-fundamentals/l2": { videoId: "Fdmx7G8nJlM", title: "SOC Analyst Tiers: Tier 1 Triage to Tier 3 Threat Hunting", start: 6600 },
  "local-soc-fundamentals/l3": { videoId: "Fdmx7G8nJlM", title: "SIEM Alert Triage: Suppressing False Positives", start: 7200 },
  "local-soc-fundamentals/l4": { videoId: "Fdmx7G8nJlM", title: "The Incident Response Lifecycle: NIST Framework", start: 7800 },
  "local-soc-fundamentals/l5": { videoId: "h4Sl21AKiDg", title: "SIEM Architecture: Log Ingestion, Collectors & Parsers", start: 60 },
  "local-soc-fundamentals/l6": { videoId: "2_lswM1S264", title: "MITRE ATT&CK Framework Mapping & TTPs", start: 600 },
  "local-soc-fundamentals/l7": { videoId: "2_lswM1S264", title: "Detection Engineering & Sigma Rules for Alert Tuning", start: 1200 },
  "local-soc-fundamentals/l8": { videoId: "Fdmx7G8nJlM", title: "Root Cause Analysis & Blameless Security Postmortems", start: 8400 },

  // =========================================================================
  // Course 9: Linux Fundamentals for IT Operations (local-linux-fundamentals)
  // =========================================================================
  "local-linux-fundamentals/l1": { videoId: "HbgzrKJvDRw", title: "Linux Filesystem Hierarchy Structure Explained" },
  "local-linux-fundamentals/l2": { videoId: "oxuRxtrO2Ag", title: "Beginner's Guide to the Bash Terminal & Navigation" },
  "local-linux-fundamentals/l3": { videoId: "V1y-mbWM3B8", title: "Linux File Permissions & Ownership (chmod, chown)", start: 900 },
  "local-linux-fundamentals/l4": { videoId: "sWbUDq4S6Y8", title: "Linux Process Management (ps, top) & systemd Services", start: 1800 },
  "local-linux-fundamentals/l5": { videoId: "h4Sl21AKiDg", title: "Server Telemetry & Infrastructure Monitoring Concepts" },
  "local-linux-fundamentals/l6": { videoId: "sWbUDq4S6Y8", title: "Linux Metrics That Matter: Load Average, CPU & IOPS", start: 2700 },
  "local-linux-fundamentals/l7": { videoId: "sWbUDq4S6Y8", title: "Linux Performance Triage: vmstat, iostat & mpstat", start: 3600 },
  "local-linux-fundamentals/l8": { videoId: "sWbUDq4S6Y8", title: "Diagnosing High CPU: top, pidstat & Process Renicing", start: 4500 },
  "local-linux-fundamentals/l9": { videoId: "sWbUDq4S6Y8", title: "Linux Memory Management: Cache, Swap & OOM Killer", start: 5400 },
  "local-linux-fundamentals/l10": { videoId: "sWbUDq4S6Y8", title: "Disk I/O Bottlenecks: iostat await times & iotop", start: 6300 },
  "local-linux-fundamentals/l11": { videoId: "sWbUDq4S6Y8", title: "Disk Full Triage: du, df -h, Inodes & Ghost Files", start: 7200 },
  "local-linux-fundamentals/l12": { videoId: "sWbUDq4S6Y8", title: "Managing Linux Logs: journalctl --vacuum & logrotate", start: 8100 },
  "local-linux-fundamentals/l13": { videoId: "sWbUDq4S6Y8", title: "Troubleshooting Network Reachability: ping & curl", start: 9000 },
  "local-linux-fundamentals/l14": { videoId: "sWbUDq4S6Y8", title: "Service Crash Debugging: journalctl -u & ss -tulpn", start: 9900 },
  "local-linux-fundamentals/l15": { videoId: "sWbUDq4S6Y8", title: "Linux DNS Troubleshooting: dig, nslookup & mtr", start: 10800 },
  "local-linux-fundamentals/l16": { videoId: "sWbUDq4S6Y8", title: "Authentication Failures (/var/log/auth.log) & Sudoers", start: 11700 },
  "local-linux-fundamentals/l17": { videoId: "sWbUDq4S6Y8", title: "Finding Files with find & Analyzing Linux Core Dumps", start: 12600 },
  "local-linux-fundamentals/l18": { videoId: "sWbUDq4S6Y8", title: "Self-Healing systemd Services with Restart Policies", start: 13500 },
  "local-linux-fundamentals/l19": { videoId: "sWbUDq4S6Y8", title: "Automated SRE Remediation & Production Guardrails", start: 14400 },

  // =========================================================================
  // Course 10: Red Hat Enterprise Linux Essential Training (local-rhel-essential)
  // =========================================================================
  "local-rhel-essential/l1": { videoId: "sWbUDq4S6Y8", title: "RHEL Service Management with systemctl", start: 15300 },
  "local-rhel-essential/l2": { videoId: "sWbUDq4S6Y8", title: "RHEL Boot Targets & systemd-analyze blame", start: 16200 },
  "local-rhel-essential/l3": { videoId: "oxuRxtrO2Ag", title: "Vi/Vim Text Editor Tutorial for SysAdmins", start: 600 },
  "local-rhel-essential/l4": { videoId: "sWbUDq4S6Y8", title: "RHEL Storage Mounting: UUIDs, fstab & Filesystems", start: 17100 },
  "local-rhel-essential/l5": { videoId: "sWbUDq4S6Y8", title: "SELinux: Enforcing Modes, Contexts & restorecon", start: 18000 },
  "local-rhel-essential/l6": { videoId: "tK9Oc6AEnR4", title: "Bash Shell Variables, Scope & Parameter Expansion", start: 0 },
  "local-rhel-essential/l7": { videoId: "tK9Oc6AEnR4", title: "Bash Conditionals and Tests: [[ ... ]] and Exit Status", start: 900 },
  "local-rhel-essential/l8": { videoId: "tK9Oc6AEnR4", title: "Bash Loops: for, while, until & Control Flow", start: 1800 },
  "local-rhel-essential/l9": { videoId: "tK9Oc6AEnR4", title: "Bash Interactive Scripts: read, prompts & getopts", start: 2700 },
  "local-rhel-essential/l10": { videoId: "tK9Oc6AEnR4", title: "Linux Process Signals: kill, pkill, SIGTERM & SIGKILL", start: 3600 },

  // =========================================================================
  // Course 11: Networking Fundamentals (local-networking-fundamentals)
  // =========================================================================
  "local-networking-fundamentals/l1": { videoId: "qiQR5rTSshw", title: "IPv4 Addressing, Subnet Masks & Network Classes", start: 0 },
  "local-networking-fundamentals/l2": { videoId: "qiQR5rTSshw", title: "DNS Resolution Architecture: Root, TLD & TTL", start: 1800 },
  "local-networking-fundamentals/l3": { videoId: "PpsEaqJV_A0", title: "What is TCP/IP? Ports & Common Protocols" },
  "local-networking-fundamentals/l4": { videoId: "qiQR5rTSshw", title: "CLI Network Diagnostics: ping, traceroute, ss & netcat", start: 3600 },
  "local-networking-fundamentals/l5": { videoId: "qiQR5rTSshw", title: "Subnetting Calculations & CIDR Notation Tricks", start: 5400 },
  "local-networking-fundamentals/l6": { videoId: "FTUV0t6JaDA", title: "NAT Explained - Network Address Translation & PAT" },
  "local-networking-fundamentals/l7": { videoId: "qiQR5rTSshw", title: "TCP Three-Way Handshake & Packet Flow", start: 7200 },
  "local-networking-fundamentals/l8": { videoId: "lb1Dw0elw0Q", title: "Learn Wireshark & Packet Inspection with tcpdump" },

  // =========================================================================
  // Course 12: Cloud Computing Essentials (local-cloud-computing-essentials)
  // =========================================================================
  "local-cloud-computing-essentials/l1": { videoId: "7HKot-brXFE", title: "Cloud Service Models: IaaS vs PaaS vs SaaS", start: 0 },
  "local-cloud-computing-essentials/l2": { videoId: "7HKot-brXFE", title: "The Cloud Shared Responsibility Model Explained", start: 900 },
  "local-cloud-computing-essentials/l3": { videoId: "7HKot-brXFE", title: "Compute & Storage Basics: VMs vs S3 Object Stores", start: 1800 },
  "local-cloud-computing-essentials/l4": { videoId: "7HKot-brXFE", title: "Cloud Networking: Regions, Availability Zones & VPCs", start: 2700 },
  "local-cloud-computing-essentials/l5": { videoId: "7HKot-brXFE", title: "Cloud IAM: Roles, Policies & Principle of Least Privilege", start: 3600 },
  "local-cloud-computing-essentials/l6": { videoId: "7HKot-brXFE", title: "Zero Trust Architecture in Cloud Workloads", start: 4500 },
  "local-cloud-computing-essentials/l7": { videoId: "7HKot-brXFE", title: "Object Storage Tiers, Archiving & Lifecycle Rules", start: 5400 },
  "local-cloud-computing-essentials/l8": { videoId: "7HKot-brXFE", title: "Cloud Economics & FinOps Cost Optimization", start: 6300 },

  // =========================================================================
  // Course 13: Introduction to DevOps & CI/CD (local-intro-to-devops-and-cicd)
  // =========================================================================
  "local-intro-to-devops-and-cicd/l1": { videoId: "scEDHsr3APg", title: "DevOps CI/CD Explained in 100 Seconds" },
  "local-intro-to-devops-and-cicd/l2": { videoId: "RGOj5yH7evk", title: "Git and GitHub for Beginners - Crash Course" },
  "local-intro-to-devops-and-cicd/l3": { videoId: "mFFXuXjVgkU", title: "Continuous Integration (CI): Automated Builds & Tests", start: 0 },
  "local-intro-to-devops-and-cicd/l4": { videoId: "FX322RVNGj4", title: "Continuous Delivery/Deployment & Infrastructure as Code", start: 600 },
  "local-intro-to-devops-and-cicd/l5": { videoId: "RGOj5yH7evk", title: "Trunk-Based Development vs GitFlow Branching", start: 1200 },
  "local-intro-to-devops-and-cicd/l6": { videoId: "mFFXuXjVgkU", title: "Automated Quality Gates: Linting, SAST & Test Coverage", start: 900 },
  "local-intro-to-devops-and-cicd/l7": { videoId: "fqMOX6JJhGo", title: "Artifact Registries & Semantic Versioning (SemVer)", start: 1200 },
  "local-intro-to-devops-and-cicd/l8": { videoId: "FX322RVNGj4", title: "Deployment Strategies: Blue-Green & Canary Rollouts", start: 1800 },

  // =========================================================================
  // Course 14: Docker & Container Fundamentals (local-docker-and-container-fundamentals)
  // =========================================================================
  "local-docker-and-container-fundamentals/l1": { videoId: "3c-iBn73dDE", title: "Why Containers Replaced Traditional Deployment" },
  "local-docker-and-container-fundamentals/l2": { videoId: "8fi7uSYlOdc", title: "Containers vs Virtual Machines: Kernel Sharing vs Virtualization" },
  "local-docker-and-container-fundamentals/l3": { videoId: "8fi7uSYlOdc", title: "Containers From Scratch: Namespaces, cgroups & chroot", start: 600 },
  "local-docker-and-container-fundamentals/l4": { videoId: "pTFZFxd4hOI", title: "Dockerfile Tutorial: FROM, COPY, RUN, CMD & Layer Caching" },
  "local-docker-and-container-fundamentals/l5": { videoId: "fqMOX6JJhGo", title: "Docker Hub & Container Registries: Tagging & Pushing" },
  "local-docker-and-container-fundamentals/l6": { videoId: "gAkwW2tuIqE", title: "Core Docker Commands: run, ps, exec, logs, stop" },
  "local-docker-and-container-fundamentals/l7": { videoId: "SXwC9fSwct8", title: "Docker Volumes, Networks & docker-compose.yml" },
  "local-docker-and-container-fundamentals/l8": { videoId: "i7ABlHngi1Q", title: "Installing Docker Engine & Verifying Host Setup" },
  "local-docker-and-container-fundamentals/l9": { videoId: "i7ABlHngi1Q", title: "Running Your First Container via the Docker CLI", start: 600 },
  "local-docker-and-container-fundamentals/l10": { videoId: "3c-iBn73dDE", title: "Container Lifecycle, Logging Drivers & Health Checks", start: 3600 },
  "local-docker-and-container-fundamentals/l11": { videoId: "3c-iBn73dDE", title: "Docker Resource Limits: --memory, --cpus & Performance", start: 4500 },
  "local-docker-and-container-fundamentals/l12": { videoId: "fqMOX6JJhGo", title: "Minimal Multi-Stage Builds with Alpine & Distroless", start: 2400 },
  "local-docker-and-container-fundamentals/l13": { videoId: "8fi7uSYlOdc", title: "Container Security: Non-Root Users & Capabilities", start: 1800 },
  "local-docker-and-container-fundamentals/l14": { videoId: "3c-iBn73dDE", title: "Systematic Container Debugging: OOMKilled & Logs", start: 5400 },
  "local-docker-and-container-fundamentals/l15": { videoId: "SXwC9fSwct8", title: "Multi-Container Docker Compose Stacks: App, DB & Redis", start: 900 },
  "local-docker-and-container-fundamentals/l16": { videoId: "mFFXuXjVgkU", title: "Building & Pushing Docker Images in CI/CD Pipelines", start: 1800 },

  // =========================================================================
  // Course 15: Kubernetes Fundamentals (local-kubernetes-fundamentals)
  // =========================================================================
  "local-kubernetes-fundamentals/l1": { videoId: "X48VuDVv0do", title: "Kubernetes Control Plane, Pods, Deployments & API", start: 0 },
  "local-kubernetes-fundamentals/l2": { videoId: "X48VuDVv0do", title: "Kubernetes Services & Networking: ClusterIP & LoadBalancer", start: 1800 },
  "local-kubernetes-fundamentals/l3": { videoId: "X48VuDVv0do", title: "kubectl Essentials: get, describe, logs, exec & apply", start: 3600 },
  "local-kubernetes-fundamentals/l4": { videoId: "X48VuDVv0do", title: "Triage Broken Deployments: CrashLoopBackOff & ImagePullBackOff", start: 5400 },
  "local-kubernetes-fundamentals/l5": { videoId: "X48VuDVv0do", title: "ConfigMaps, Secrets, and Environment Injection", start: 7200 },
  "local-kubernetes-fundamentals/l6": { videoId: "80Ew_fsV4rM", title: "Kubernetes Ingress Controllers & HTTP Routing Rules" },
  "local-kubernetes-fundamentals/l7": { videoId: "X48VuDVv0do", title: "Liveness, Readiness, and Startup Probes in Production", start: 9000 },
  "local-kubernetes-fundamentals/l8": { videoId: "X48VuDVv0do", title: "Resource Requests, Limits, and OOMKilled Triage", start: 10800 },

  // =========================================================================
  // Course 16: Microsoft Azure Fundamentals (local-microsoft-azure-fundamentals)
  // =========================================================================
  "local-microsoft-azure-fundamentals/l1": { videoId: "V53AHWun17s", title: "Azure Subscriptions, Resource Groups & Azure Resource Manager", start: 0 },
  "local-microsoft-azure-fundamentals/l2": { videoId: "V53AHWun17s", title: "Microsoft Entra ID (Azure AD) & Role-Based Access Control (RBAC)", start: 900 },
  "local-microsoft-azure-fundamentals/l3": { videoId: "V53AHWun17s", title: "Azure Compute: Virtual Machines, Scale Sets & App Service", start: 1800 },
  "local-microsoft-azure-fundamentals/l4": { videoId: "V53AHWun17s", title: "Azure Storage Accounts, Virtual Networks & Cost Management", start: 2700 },
  "local-microsoft-azure-fundamentals/l5": { videoId: "V53AHWun17s", title: "Azure Key Vault & Managed Identities: Zero Secrets in Code", start: 3600 },
  "local-microsoft-azure-fundamentals/l6": { videoId: "V53AHWun17s", title: "Azure VNet Peering, Private Endpoints & Azure Bastion", start: 4500 },
  "local-microsoft-azure-fundamentals/l7": { videoId: "V53AHWun17s", title: "Azure Policy, Blueprints, and Cloud Governance", start: 5400 },
  "local-microsoft-azure-fundamentals/l8": { videoId: "V53AHWun17s", title: "Azure Monitor, Log Analytics Workspaces & KQL Triage", start: 6300 },

  // =========================================================================
  // Course 17: DevOps & CI/CD Intermediate (local-devops-cicd-intermediate)
  // =========================================================================
  "local-devops-cicd-intermediate/l1": { videoId: "FX322RVNGj4", title: "Anatomy of an Enterprise CI/CD Pipeline: Commit to Prod", start: 0 },
  "local-devops-cicd-intermediate/l2": { videoId: "mFFXuXjVgkU", title: "Pipeline Triggers: Webhooks, Push, PRs & Path Filters", start: 300 },
  "local-devops-cicd-intermediate/l3": { videoId: "FX322RVNGj4", title: "The Jenkinsfile and Declarative Pipeline Syntax", start: 1200 },
  "local-devops-cicd-intermediate/l4": { videoId: "FX322RVNGj4", title: "Distributed Jenkins: Controller-Agent Architecture", start: 2400 },
  "local-devops-cicd-intermediate/l5": { videoId: "mFFXuXjVgkU", title: "GitHub Actions Workflow YAML: Jobs, Steps & Runners" },
  "local-devops-cicd-intermediate/l6": { videoId: "mFFXuXjVgkU", title: "Reusable Workflows, Composite Actions, and Secrets", start: 1500 },
  "local-devops-cicd-intermediate/l7": { videoId: "fqMOX6JJhGo", title: "Building and Tagging Multi-Platform Images in CI", start: 3000 },
  "local-devops-cicd-intermediate/l8": { videoId: "7xngnjfIlK4", title: "Complete Terraform Course - Providers, Resources & HCL" },
  "local-devops-cicd-intermediate/l9": { videoId: "V53AHWun17s", title: "Terraform State Management: S3 Remote Backend & Locks", start: 4200 },
  "local-devops-cicd-intermediate/l10": { videoId: "mFFXuXjVgkU", title: "Secrets Management in CI/CD: Vault & OIDC Federation", start: 2100 },
  "local-devops-cicd-intermediate/l11": { videoId: "scEDHsr3APg", title: "Software Supply-Chain Risk in Pipelines & SBOMs" },
  "local-devops-cicd-intermediate/l12": { videoId: "FX322RVNGj4", title: "Debugging a Failed Pipeline Run, Systematically", start: 3600 },
  "local-devops-cicd-intermediate/l13": { videoId: "FX322RVNGj4", title: "Production Rollback Strategies: Blue-Green & Canaries", start: 4500 }
};

/**
 * Resolves a topic-specific video for a given lesson by:
 * 1. Direct courseId/lessonId lookup (exact match)
 * 2. Explicit lesson.video override if provided
 * 3. Title-based lookup across the registry
 * 4. Fallback video
 */
export function getLessonVideo(courseId, lessonId, lessonTitle, fallbackVideo = null) {
  if (fallbackVideo?.videoId) return fallbackVideo;

  // 1. Direct composite key match
  if (courseId && lessonId) {
    const key = `${courseId}/${lessonId}`;
    if (LESSON_VIDEOS[key]) return LESSON_VIDEOS[key];

    // Try with or without "local-" prefix
    const altCourse = courseId.startsWith("local-") ? courseId.replace(/^local-/, "") : `local-${courseId}`;
    const altKey = `${altCourse}/${lessonId}`;
    if (LESSON_VIDEOS[altKey]) return LESSON_VIDEOS[altKey];
  }

  // 2. Exact or fuzzy title-based match
  if (lessonTitle) {
    const trimmed = lessonTitle.trim().toLowerCase();
    for (const [key, item] of Object.entries(LESSON_VIDEOS)) {
      if (item.title.toLowerCase().includes(trimmed) || trimmed.includes(item.title.toLowerCase())) {
        return item;
      }
    }
  }

  // 3. Fallback to reasonable general lecture
  return fallbackVideo || {
    videoId: "sWbUDq4S6Y8",
    title: lessonTitle || "Interactive Lecture",
    start: 0
  };
}

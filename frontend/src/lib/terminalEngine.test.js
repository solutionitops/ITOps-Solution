import { describe, it, expect, beforeEach } from "vitest";
import { ShellSession } from "./terminalEngine";
import { VirtualFileSystem } from "./virtualFileSystem";

describe("VirtualFileSystem", () => {
  let vfs;

  beforeEach(() => {
    vfs = new VirtualFileSystem();
  });

  it("resolves canonical relative and absolute paths", () => {
    expect(vfs.resolvePath("config")).toBe("/home/engineer/workspace/config");
    expect(vfs.resolvePath("../..")).toBe("/home");
    expect(vfs.resolvePath("/etc/resolv.conf")).toBe("/etc/resolv.conf");
    expect(vfs.resolvePath("~")).toBe("/home/engineer");
  });

  it("reads and writes files accurately in memory", () => {
    vfs.writeFile("test.txt", "hello enterprise sre");
    expect(vfs.exists("test.txt")).toBe(true);
    expect(vfs.readFile("test.txt")).toBe("hello enterprise sre");
  });

  it("appends to files accurately", () => {
    vfs.writeFile("log.txt", "line1\n");
    vfs.appendFile("log.txt", "line2\n");
    expect(vfs.readFile("log.txt")).toBe("line1\nline2\n");
  });

  it("lists directories and distinguishes files from directories", () => {
    const entries = vfs.listDir(".");
    expect(entries.length).toBeGreaterThan(0);
    const dockerfile = entries.find(e => e.name === "Dockerfile");
    expect(dockerfile).toBeDefined();
    expect(dockerfile.node.type).toBe("file");
    const configDir = entries.find(e => e.name === "config");
    expect(configDir).toBeDefined();
    expect(configDir.node.type).toBe("dir");
  });

  it("supports directory creation and deletion", () => {
    vfs.mkdir("testdir");
    expect(vfs.exists("testdir")).toBe(true);
    vfs.remove("testdir", true);
    expect(vfs.exists("testdir")).toBe(false);
  });
});

describe("ShellSession Execution Engine", () => {
  let shell;

  beforeEach(() => {
    shell = new ShellSession({ user: "engineer", hostname: "moonsav-prod" });
  });

  it("formats prompt accurately", () => {
    expect(shell.getPrompt()).toBe("engineer@moonsav-prod:~/workspace$");
    shell.execute("cd /etc");
    expect(shell.getPrompt()).toBe("engineer@moonsav-prod:/etc$");
  });

  it("executes basic Unix file and navigation commands", () => {
    const resPwd = shell.execute("pwd");
    expect(resPwd.output).toBe("/home/engineer/workspace");

    const resCat = shell.execute("cat config/safety.json");
    expect(resCat.output).toContain("lowWaterCutoffPct");

    const resCd = shell.execute("cd config");
    expect(resCd.exitCode).toBe(0);
    const resLs = shell.execute("ls");
    expect(resLs.output).toContain("safety.json");
  });

  it("executes pipelines with grep and wc", () => {
    const resPipe = shell.execute("cat main.go | grep TelemetryData");
    expect(resPipe.output).toContain("type TelemetryData struct");

    const resWc = shell.execute("cat config/safety.json | wc -l");
    expect(Number(resWc.output.trim())).toBeGreaterThan(0);
  });

  it("executes file redirection (> and >>)", () => {
    shell.execute("echo 'custom_param=100' > custom.conf");
    const resCat = shell.execute("cat custom.conf");
    expect(resCat.output.trim()).toBe("custom_param=100");
  });

  it("handles process triage and killing processes", () => {
    const resPs = shell.execute("ps aux");
    expect(resPs.output).toContain("moonsav-ingest");
    expect(resPs.output).toContain("leak_proc <defunct>");

    const resKill = shell.execute("kill -15 1420");
    expect(resKill.exitCode).toBe(0);

    const resPsAfter = shell.execute("ps aux");
    expect(resPsAfter.output).not.toContain("leak_proc <defunct>");
  });

  it("executes networking diagnostics", () => {
    const resSs = shell.execute("ss -tulpn");
    expect(resSs.output).toContain("1883");
    expect(resSs.output).toContain("8080");

    const resCurl = shell.execute("curl -s http://localhost:8080/health");
    expect(resCurl.output).toContain('"status": "UP"');
  });

  it("executes Docker and Kubernetes commands", () => {
    const resDocker = shell.execute("docker ps");
    expect(resDocker.output).toContain("moonsav-mqtt-broker");
    expect(resDocker.output).toContain("moonsav-telemetry");

    const resK8s = shell.execute("kubectl get pods");
    expect(resK8s.output).toContain("moonsav-telemetry-");
  });

  it("executes systemctl and journalctl", () => {
    const resStatus = shell.execute("systemctl status moonsav-telemetry");
    expect(resStatus.output).toContain("active (running)");

    const resRestart = shell.execute("systemctl restart mosquitto");
    expect(resRestart.exitCode).toBe(0);
  });

  it("provides dynamic auto-completions for commands and files", () => {
    const compCmd = shell.getCompletions("dock");
    expect(compCmd).toContain("docker ps");

    const compFile = shell.getCompletions("cat Do");
    expect(compFile).toContain("cat Dockerfile");
  });
});

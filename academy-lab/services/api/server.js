const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { createClient } = require("redis");
const mqtt = require("mqtt");
const client = require("prom-client");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// PROMETHEUS METRICS REGISTRY & SRE GAUGES
// ─────────────────────────────────────────────────────────────────────────────

const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Request & Latency metrics
const httpRequestCounter = new client.Counter({
  name: "moonsav_http_requests_total",
  help: "Total HTTP requests handled by API",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});

const motorCommandCounter = new client.Counter({
  name: "moonsav_motor_commands_total",
  help: "Total motor commands processed",
  labelNames: ["action", "status"],
  registers: [register]
});

const motorCommandFailureCounter = new client.Counter({
  name: "moonsav_motor_command_failures_total",
  help: "Total motor command execution failures",
  labelNames: ["reason"],
  registers: [register]
});

const motorLatencyHistogram = new client.Histogram({
  name: "moonsav_motor_command_duration_seconds",
  help: "Latency of motor state transitions (seconds)",
  buckets: [0.01, 0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5],
  registers: [register]
});

// Hardware & Telemetry Gauges
const deviceOnlineGauge = new client.Gauge({
  name: "moonsav_device_online",
  help: "Device online status (1=Online, 0=Offline)",
  labelNames: ["device_id"],
  registers: [register]
});

const tankLevelGauge = new client.Gauge({
  name: "moonsav_tank_level_percent",
  help: "Current water tank level percentage (0-100%)",
  labelNames: ["device_id"],
  registers: [register]
});

const motorRpmGauge = new client.Gauge({
  name: "moonsav_motor_rpm",
  help: "Motor shaft rotation speed (RPM)",
  labelNames: ["device_id"],
  registers: [register]
});

const motorTempGauge = new client.Gauge({
  name: "moonsav_motor_temperature_celsius",
  help: "Motor thermal core temperature (Celsius)",
  labelNames: ["device_id"],
  registers: [register]
});

const flowRateGauge = new client.Gauge({
  name: "moonsav_flow_rate_lpm",
  help: "Water flow rate in liters per minute (LPM)",
  labelNames: ["device_id"],
  registers: [register]
});

// MQTT & Ingestion counters
const mqttMessagesCounter = new client.Counter({
  name: "moonsav_mqtt_messages_total",
  help: "Total MQTT telemetry packets received",
  labelNames: ["topic"],
  registers: [register]
});

const mqttErrorsCounter = new client.Counter({
  name: "moonsav_mqtt_connection_errors_total",
  help: "Total MQTT broker connection dropouts",
  registers: [register]
});

// SRE & SLO Gauges
const sloErrorBudgetGauge = new client.Gauge({
  name: "moonsav_slo_error_budget_percent",
  help: "Remaining SLO Error Budget percentage (0-100%)",
  registers: [register]
});
sloErrorBudgetGauge.set(94.6);

const sloBurnRateGauge = new client.Gauge({
  name: "moonsav_slo_burn_rate",
  help: "Current 1-hour SLO error budget burn rate multiplier",
  registers: [register]
});
sloBurnRateGauge.set(1.02);

// Initial device baseline
deviceOnlineGauge.set({ device_id: "PUMP-01" }, 1);
tankLevelGauge.set({ device_id: "PUMP-01" }, 72.4);
motorRpmGauge.set({ device_id: "PUMP-01" }, 2840);
motorTempGauge.set({ device_id: "PUMP-01" }, 48.2);
flowRateGauge.set({ device_id: "PUMP-01" }, 12.4);

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE, CACHE & MQTT CONNECTIONS
// ─────────────────────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://moonsav:moonsav_secret_pass@moonsav-postgres:5432/moonsav_iot"
});

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://moonsav-redis:6379"
});
redisClient.connect().catch((err) => console.error("Redis Connection Error:", err));

const mqttBroker = mqtt.connect(`mqtt://${process.env.MQTT_HOST || "moonsav-mqtt-broker"}:${process.env.MQTT_PORT || 1883}`);
mqttBroker.on("connect", () => {
  console.log("[MOONSAV API] Connected to MQTT Broker");
  mqttBroker.subscribe("moonsav/+/telemetry");
});

mqttBroker.on("error", (err) => {
  console.error("[MQTT ERROR]:", err.message);
  mqttErrorsCounter.inc();
  deviceOnlineGauge.set({ device_id: "PUMP-01" }, 0);
});

mqttBroker.on("message", async (topic, message) => {
  try {
    mqttMessagesCounter.inc({ topic });
    const data = jsonParseSafe(message.toString());
    if (!data) return;

    const devId = data.deviceId || "PUMP-01";
    deviceOnlineGauge.set({ device_id: devId }, 1);
    tankLevelGauge.set({ device_id: devId }, Number(data.tankLevelPct) || 0);
    motorRpmGauge.set({ device_id: devId }, Number(data.rpm) || 0);
    motorTempGauge.set({ device_id: devId }, Number(data.motorTempC) || 0);
    flowRateGauge.set({ device_id: devId }, Number(data.flowLPM) || 0);

    // Cache latest device heartbeat in Redis
    await redisClient.set(`device:${devId}:state`, JSON.stringify(data), { EX: 60 });

    // Persist to Postgres
    await pool.query(
      "INSERT INTO sensor_telemetry (device_id, rpm, flow_rate_lpm, tank_level_pct, motor_temperature_c, current_draw_amps, dry_run_flag) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [devId, data.rpm || 0, data.flowLPM || 0, data.tankLevelPct || 0, data.motorTempC || 0, data.currentAmps || 0, !!data.dryRunTripped]
    );
  } catch (err) {
    console.error("Error processing MQTT telemetry message:", err);
  }
});

function jsonParseSafe(str) {
  try { return JSON.parse(str); } catch { return null; }
}

// Request metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// REST ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

app.get("/health", async (req, res) => {
  try {
    const dbRes = await pool.query("SELECT 1");
    const redisPong = await redisClient.ping();
    const mqttConnected = mqttBroker.connected;

    res.json({
      status: "UP",
      healthy: true,
      database: dbRes ? "CONNECTED" : "DEGRADED",
      redis: redisPong === "PONG" ? "CONNECTED" : "DEGRADED",
      mqtt: mqttConnected ? "CONNECTED" : "DISCONNECTED",
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(500).json({ status: "DOWN", error: err.message });
  }
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/api/v1/devices", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM devices ORDER BY id");
    const devices = await Promise.all(
      result.rows.map(async (d) => {
        const live = await redisClient.get(`device:${d.id}:state`);
        return {
          ...d,
          liveTelemetry: live ? JSON.parse(live) : null
        };
      })
    );
    res.json({ success: true, count: devices.length, data: devices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/v1/devices/:id/commands", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const end = motorLatencyHistogram.startTimer();

  try {
    if (!["START", "STOP", "EMERGENCY_SHUTDOWN", "INJECT_DRY_RUN"].includes(action)) {
      motorCommandFailureCounter.inc({ reason: "invalid_action" });
      return res.status(400).json({ error: "Invalid action. Allowed: START, STOP, EMERGENCY_SHUTDOWN, INJECT_DRY_RUN" });
    }

    // Publish to MQTT
    mqttBroker.publish(`moonsav/${id}/commands`, JSON.stringify({ action, timestamp: Date.now() }));

    // Record in DB
    await pool.query(
      "INSERT INTO motor_commands (device_id, action, status) VALUES ($1, $2, $3)",
      [id, action, "SUCCESS"]
    );

    motorCommandCounter.inc({ action, status: "success" });
    end();

    res.json({ success: true, message: `Command ${action} dispatched to device ${id}` });
  } catch (err) {
    motorCommandCounter.inc({ action, status: "failure" });
    motorCommandFailureCounter.inc({ reason: err.message });
    end();
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[MOONSAV API] Running on http://0.0.0.0:${PORT} with Prometheus metrics at /metrics`);
});

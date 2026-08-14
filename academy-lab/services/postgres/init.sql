-- MOONSAV IoT PostgreSQL Database Initialization Schema

CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    device_type VARCHAR(64) NOT NULL DEFAULT 'water_motor',
    location VARCHAR(255) NOT NULL DEFAULT 'Building A - Underground Sump',
    status VARCHAR(32) NOT NULL DEFAULT 'ONLINE',
    firmware_version VARCHAR(32) NOT NULL DEFAULT 'v2.4.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_telemetry (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(64) REFERENCES devices(id),
    rpm INT NOT NULL,
    flow_rate_lpm NUMERIC(6, 2) NOT NULL,
    tank_level_pct NUMERIC(5, 2) NOT NULL,
    motor_temperature_c NUMERIC(5, 2) NOT NULL,
    current_draw_amps NUMERIC(5, 2) NOT NULL,
    dry_run_flag BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telemetry_device_time ON sensor_telemetry (device_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS motor_commands (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(64) REFERENCES devices(id),
    action VARCHAR(32) NOT NULL, -- 'START', 'STOP', 'EMERGENCY_SHUTDOWN'
    initiated_by VARCHAR(64) NOT NULL DEFAULT 'automation_schedule',
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
    latency_ms INT NOT NULL DEFAULT 18,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default MOONSAV Pump Devices
INSERT INTO devices (id, name, device_type, location, status, firmware_version)
VALUES 
    ('PUMP-01', 'Primary Overhead Fill Pump', 'water_motor', 'Building A - Basement', 'ONLINE', 'v2.4.1'),
    ('PUMP-02', 'Secondary Booster Pump', 'booster_motor', 'Building A - Rooftop Tank', 'ONLINE', 'v2.4.1')
ON CONFLICT (id) DO NOTHING;

#!/usr/bin/env python3
"""
MOONSAV IoT Smart Water Motor & Hardware Fault Simulator
Simulates a physical water pump, underground/overhead tanks, ultrasonic level sensors,
flow meters, and thermal protection circuits communicating over MQTT.
"""

import os
import time
import json
import random
import logging
import paho.mqtt.client as mqtt

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("moonsav-simulator")

BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "localhost")
BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))
DEVICE_ID = os.getenv("DEVICE_ID", "PUMP-01")
SAMPLE_RATE_HZ = float(os.getenv("SAMPLE_RATE_HZ", 2.0))

# Physical Simulation State
state = {
    "motor_running": True,
    "rpm": 2840,
    "flow_lpm": 12.4,
    "tank_level_pct": 72.0,
    "motor_temp_c": 48.2,
    "current_amps": 8.4,
    "dry_run_interlock_armed": True,
    "dry_run_tripped": False
}

def on_connect(client, userdata, flags, rc):
    logger.info(f"Connected to MQTT Broker ({BROKER_HOST}:{BROKER_PORT}) with result code {rc}")
    client.subscribe(f"moonsav/{DEVICE_ID}/commands")
    logger.info(f"Subscribed to topic: moonsav/{DEVICE_ID}/commands")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        action = payload.get("action", "").upper()
        logger.info(f"Received motor command: {action}")
        
        if action == "START":
            if state["tank_level_pct"] > 10 or not state["dry_run_interlock_armed"]:
                state["motor_running"] = True
                state["rpm"] = 2850
                state["flow_lpm"] = 14.2
                state["dry_run_tripped"] = False
                logger.info("Motor STARTED successfully")
            else:
                logger.warning("START rejected: Low water tank level (<10%) - Dry-run protection active")
        elif action in ["STOP", "EMERGENCY_SHUTDOWN"]:
            state["motor_running"] = False
            state["rpm"] = 0
            state["flow_lpm"] = 0.0
            state["current_amps"] = 0.2
            logger.info("Motor STOPPED")
        elif action == "INJECT_DRY_RUN":
            state["tank_level_pct"] = 4.0
            state["flow_lpm"] = 0.0
            logger.warning("FAULT INJECTED: Tank level dropped to 4%, Flow rate zeroed")
    except Exception as e:
        logger.error(f"Error handling message: {e}")

def main():
    logger.info(f"Starting MOONSAV Hardware Simulator for Device: {DEVICE_ID}")
    client = mqtt.Client(client_id=f"sim-{DEVICE_ID}")
    client.on_connect = on_connect
    client.on_message = on_message

    connected = False
    while not connected:
        try:
            client.connect(BROKER_HOST, BROKER_PORT, 60)
            connected = True
        except Exception as e:
            logger.warning(f"Waiting for MQTT broker... ({e})")
            time.sleep(2)

    client.loop_start()

    sleep_interval = 1.0 / SAMPLE_RATE_HZ

    while True:
        try:
            # Simulate physical physics
            if state["motor_running"]:
                state["tank_level_pct"] = max(0.0, state["tank_level_pct"] - 0.05)
                state["motor_temp_c"] = min(98.0, state["motor_temp_c"] + random.uniform(0.02, 0.08))
                state["current_amps"] = 8.2 + random.uniform(-0.3, 0.4)

                # Dry run detection
                if state["tank_level_pct"] < 8.0 and state["dry_run_interlock_armed"]:
                    state["motor_temp_c"] += 1.5
                    state["current_amps"] += 2.5
                    if state["motor_temp_c"] > 85.0:
                        logger.critical("EMERGENCY SAFETY TRIP: High thermal dry-run threshold exceeded! Cutting motor power.")
                        state["motor_running"] = False
                        state["dry_run_tripped"] = True
                        state["rpm"] = 0
                        state["flow_lpm"] = 0.0
            else:
                state["motor_temp_c"] = max(32.0, state["motor_temp_c"] - 0.2)
                state["current_amps"] = 0.1

            telemetry_payload = {
                "deviceId": DEVICE_ID,
                "timestamp": int(time.time()),
                "motorRunning": state["motor_running"],
                "rpm": state["rpm"],
                "flowLPM": round(state["flow_lpm"], 2),
                "tankLevelPct": round(state["tank_level_pct"], 2),
                "motorTempC": round(state["motor_temp_c"], 2),
                "currentAmps": round(state["current_amps"], 2),
                "dryRunTripped": state["dry_run_tripped"]
            }

            topic = f"moonsav/{DEVICE_ID}/telemetry"
            client.publish(topic, json.dumps(telemetry_payload), qos=1)
            time.sleep(sleep_interval)

        except KeyboardInterrupt:
            break
        except Exception as e:
            logger.error(f"Simulation loop error: {e}")
            time.sleep(1)

    client.loop_stop()
    client.disconnect()

if __name__ == "__main__":
    main()

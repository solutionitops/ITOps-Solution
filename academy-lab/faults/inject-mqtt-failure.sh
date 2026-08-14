#!/usr/bin/env bash
# MOONSAV Lab Chaos Fault Injector: MQTT Broker Failure
set -euo pipefail

echo "[CHAOS ENGINE] Injecting MQTT Broker Failure..."
docker stop moonsav-mqtt-broker || true
echo "[CHAOS ENGINE] moonsav-mqtt-broker stopped. Edge device telemetry pipeline interrupted (SEV-1)."

#!/usr/bin/env bash
# MOONSAV Lab Chaos Fault Injector: Dry-Run Low Water Cavitation
set -euo pipefail

echo "[CHAOS ENGINE] Triggering Dry-Run Condition on PUMP-01..."
curl -s -X POST http://localhost:8080/api/v1/devices/PUMP-01/commands \
  -H "Content-Type: application/json" \
  -d '{"action":"INJECT_DRY_RUN"}' || true

echo "[CHAOS ENGINE] Low water sensor triggered. Flow rate set to 0 LPM (Thermal runaway risk critical)."

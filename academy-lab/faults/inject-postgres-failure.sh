#!/usr/bin/env bash
# MOONSAV Lab Chaos Fault Injector: PostgreSQL Connection Exhaustion
set -euo pipefail

echo "[CHAOS ENGINE] Injecting PostgreSQL Connection Pool Saturation..."
docker exec moonsav-postgres psql -U moonsav -d moonsav_iot -c "SELECT pg_sleep(30);" &
docker exec moonsav-postgres psql -U moonsav -d moonsav_iot -c "SELECT pg_sleep(30);" &
docker exec moonsav-postgres psql -U moonsav -d moonsav_iot -c "SELECT pg_sleep(30);" &
echo "[CHAOS ENGINE] Simulated backend connection spike. Database latency degraded."

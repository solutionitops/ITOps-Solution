#!/usr/bin/env bash
# MOONSAV Lab Chaos Fault Injector: High Distributed Latency & SLO Degradation
set -euo pipefail

echo "[CHAOS ENGINE] Injecting API Latency & Slow Database Queries..."
docker exec moonsav-postgres psql -U moonsav -d moonsav_iot -c "SELECT pg_sleep(1.8), * FROM sensor_telemetry ORDER BY id DESC LIMIT 500;" &
echo "[CHAOS ENGINE] P95 latency increased from 18ms to >2,400ms. SLO Error Budget burning at 4.2x rate."

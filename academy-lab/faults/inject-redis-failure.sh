#!/usr/bin/env bash
# MOONSAV Lab Chaos Fault Injector: Redis Eviction Storm & Memory Saturation
set -euo pipefail

echo "[CHAOS ENGINE] Filling Redis memory to trigger eviction storm..."
docker exec moonsav-redis redis-cli DEBUG POPULATE 50000 key_payload 1024 || true
echo "[CHAOS ENGINE] Redis keyspace populated. Memory threshold reached."

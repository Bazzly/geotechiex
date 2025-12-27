#!/usr/bin/env bash
# Simple integration test script for local API (requires `curl`).
# Usage: ./tests/test_api.sh http://localhost:8000/api/index.php

BASE_URL=${1:-http://localhost:8000/api/index.php}

echo "Running basic API smoke tests against $BASE_URL"

echo "-> test action"
curl -s -X POST -H "Content-Type: application/json" -d '{"action":"test"}' "$BASE_URL" | jq || true

echo "-> get_config"
curl -s -X POST -H "Content-Type: application/json" -d '{"action":"get_config"}' "$BASE_URL" | jq || true

echo "Done. Note: admin endpoints require a valid admin token. Use test harness or provide token via Authorization header."

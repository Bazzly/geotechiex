#!/usr/bin/env bash
set -euo pipefail

BASE="http://localhost:8000/api/index.php"
echo "Running admin workflow against $BASE"

echo "\n== Admin Login =="
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"action":"admin_login","username":"temp_admin","password":"TempPass123!"}' "$BASE")
echo "$LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | php -r '$j=json_decode(stream_get_contents(STDIN), true); echo $j["token"] ?? "";')
echo "TOKEN: $TOKEN"
if [ -z "$TOKEN" ]; then echo "Failed to get token"; exit 2; fi

echo "\n== Register Test User =="
EMAIL="testuser+local@example.com"
REG_RESP=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"action\":\"register_user\",\"email\":\"${EMAIL}\",\"device_id\":\"dev-local-1\"}" "$BASE")
echo "$REG_RESP"

echo "\n== List Users =="
USERS_RESP=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d '{"action":"admin_users","limit":10}' "$BASE")
echo "$USERS_RESP"
USER_ID=$(echo "$USERS_RESP" | php -r '$j=json_decode(stream_get_contents(STDIN), true); if(!empty($j["users"])) { echo $j["users"][0]["id"] ?? ""; }')
echo "USER_ID: $USER_ID"

if [ -n "$USER_ID" ]; then
  echo "\n== Block User =="
  BLOCK_RESP=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d "{\"action\":\"admin_block_user\",\"user_id\":${USER_ID}}" "$BASE")
  echo "$BLOCK_RESP"

  echo "\n== Users After Block =="
  USERS_AFTER_BLOCK=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d '{"action":"admin_users","limit":10}' "$BASE")
  echo "$USERS_AFTER_BLOCK"

  echo "\n== Unblock User =="
  UNBLOCK_RESP=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d "{\"action\":\"admin_unblock_user\",\"user_id\":${USER_ID}}" "$BASE")
  echo "$UNBLOCK_RESP"
fi

echo "\n== Generate Activation Code =="
GEN_RESP=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d '{"action":"generate_code","credits":10,"max_uses":1}' "$BASE")
echo "$GEN_RESP"

echo "\n== List Activations =="
ACT_RESP=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d '{"action":"admin_activations","limit":10}' "$BASE")
echo "$ACT_RESP"

echo "\n== Admin Stats =="
STATS_RESP=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${TOKEN}" -d '{"action":"admin_stats"}' "$BASE")
echo "$STATS_RESP"

echo "\nAdmin workflow completed."

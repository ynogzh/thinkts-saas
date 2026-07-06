#!/bin/bash
# ── thinkts-saas restart.sh ──
# Starts backend API (:3333) and admin frontend (:3334)

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Killing existing processes ==="
lsof -ti:3333 | xargs kill -9 2>/dev/null || true
lsof -ti:3334 | xargs kill -9 2>/dev/null || true
sleep 1

echo "=== Starting backend (port 3333) ==="
cd "$ROOT_DIR/apps/iotbiz"
bun entry.ts &
BACKEND_PID=$!
echo "  PID: $BACKEND_PID"

sleep 3

echo "=== Starting admin frontend (port 3334) ==="
cd "$ROOT_DIR/admin"
pnpm dev &
ADMIN_PID=$!
echo "  PID: $ADMIN_PID"

sleep 2

echo ""
echo "=== thinkts-saas running ==="
echo "  API:   http://localhost:3333"
echo "  Admin: http://localhost:3334"
echo ""
echo "Press Ctrl+C to stop both services."
wait

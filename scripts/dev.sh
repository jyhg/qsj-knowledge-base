#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"

if ! command -v node >/dev/null 2>&1; then
  echo "node not found in PATH"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found in PATH"
  exit 1
fi

cd "$ROOT_DIR"

if [ -f ".env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  . ".env.local"
  set +a
fi

if [ ! -x "node_modules/.bin/next" ] || [ ! -x "node_modules/.bin/nest" ]; then
  echo "Installing workspace dependencies..."
  npm install
fi

cleanup() {
  if [ -n "${API_PID:-}" ] && kill -0 "$API_PID" >/dev/null 2>&1; then
    kill "$API_PID" >/dev/null 2>&1 || true
  fi
  if [ -n "${WEB_PID:-}" ] && kill -0 "$WEB_PID" >/dev/null 2>&1; then
    kill "$WEB_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting API on http://localhost:3001 ..."
npm run dev:api &
API_PID=$!

echo "Starting Web on http://localhost:3000 ..."
npm run dev:web &
WEB_PID=$!

wait "$API_PID" "$WEB_PID"

#!/usr/bin/env bash
set -euo pipefail

default_port() {
  python3 - <<'PY'
import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
print(s.getsockname()[1])
s.close()
PY
}

PORT="${SMOKE_PORT:-$(default_port)}"
BASE="http://127.0.0.1:${PORT}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

fail() {
  echo "[smoke] FAILED: $*" >&2
  if [[ -f /tmp/batman-smoke-http.log ]]; then
    echo "[smoke] --- http server log ---" >&2
    cat /tmp/batman-smoke-http.log >&2 || true
    echo "[smoke] -----------------------" >&2
  fi
  exit 1
}

echo "[smoke] syntax checks"
node --check app.js
node --check sw.js

echo "[smoke] start local server on ${PORT}"
python3 -m http.server "${PORT}" --directory . >/tmp/batman-smoke-http.log 2>&1 &
SERVER_PID=$!

for _ in {1..40}; do
  if curl -fsS "${BASE}/index.html" >/tmp/batman-smoke-index.html 2>/dev/null; then
    break
  fi
  sleep 0.1
done

curl -fsS "${BASE}/index.html" >/tmp/batman-smoke-index.html || fail "index.html not reachable"
curl -fsS "${BASE}/app.js" >/tmp/batman-smoke-app.js || fail "app.js not reachable"
curl -fsS "${BASE}/list.js" >/tmp/batman-smoke-list.js || fail "list.js not reachable"
curl -fsS "${BASE}/sw.js" >/tmp/batman-smoke-sw.js || fail "sw.js not reachable"
curl -fsS "${BASE}/manifest.webmanifest" >/tmp/batman-smoke-manifest.json || fail "manifest.webmanifest not reachable"

echo "[smoke] validate key markers"
grep -q 'script src="list.js"' /tmp/batman-smoke-index.html || fail "index missing list.js script"
grep -q 'script src="app.js"' /tmp/batman-smoke-index.html || fail "index missing app.js script"
grep -q 'window.BATMAN_GUIDE_LIST' /tmp/batman-smoke-list.js || fail "list payload missing"
grep -q 'function bootstrap()' /tmp/batman-smoke-app.js || fail "bootstrap function missing"
grep -q 'NETWORK_FIRST_PATHS' /tmp/batman-smoke-sw.js || fail "service worker marker missing"

echo "[smoke] basic list size check"
ITEM_COUNT=$(python3 - <<'PY'
import re
from pathlib import Path
text = Path('/tmp/batman-smoke-list.js').read_text(encoding='utf-8')
print(len(re.findall(r'"id"\s*:\s*"', text)))
PY
)
if [[ "${ITEM_COUNT}" -lt 20 ]]; then
  fail "Expected at least 20 list items, got ${ITEM_COUNT}"
fi

echo "[smoke] ok (items=${ITEM_COUNT})"

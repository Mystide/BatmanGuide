#!/usr/bin/env bash
set -euo pipefail

PORT="${SMOKE_PORT:-4179}"
BASE="http://127.0.0.1:${PORT}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

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

curl -fsS "${BASE}/index.html" >/tmp/batman-smoke-index.html
curl -fsS "${BASE}/app.js" >/tmp/batman-smoke-app.js
curl -fsS "${BASE}/list.js" >/tmp/batman-smoke-list.js
curl -fsS "${BASE}/sw.js" >/tmp/batman-smoke-sw.js
curl -fsS "${BASE}/manifest.webmanifest" >/tmp/batman-smoke-manifest.json

echo "[smoke] validate key markers"
grep -q 'script src="list.js"' /tmp/batman-smoke-index.html
grep -q 'script src="app.js"' /tmp/batman-smoke-index.html
grep -q 'window.BATMAN_GUIDE_LIST' /tmp/batman-smoke-list.js
grep -q 'function bootstrap()' /tmp/batman-smoke-app.js
grep -q 'NETWORK_FIRST_PATHS' /tmp/batman-smoke-sw.js

echo "[smoke] basic list size check"
ITEM_COUNT=$(python3 - <<'PY'
import re
from pathlib import Path
text = Path('/tmp/batman-smoke-list.js').read_text(encoding='utf-8')
print(len(re.findall(r'"id"\s*:\s*"', text)))
PY
)
if [[ "${ITEM_COUNT}" -lt 20 ]]; then
  echo "Expected at least 20 list items, got ${ITEM_COUNT}" >&2
  exit 1
fi

echo "[smoke] ok (items=${ITEM_COUNT})"

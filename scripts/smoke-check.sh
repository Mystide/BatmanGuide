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

echo "[smoke] validate manifest JSON"
node -e 'JSON.parse(require("fs").readFileSync("manifest.webmanifest","utf8"))'

echo "[smoke] verify app/sw version coherence"
APP_VERSION=$(node - <<'NODE'
const fs = require("fs");
const app = fs.readFileSync("app.js", "utf8");
const m = app.match(/const\s+APP_VERSION\s*=\s*"([^"]+)"/);
if (!m) process.exit(1);
process.stdout.write(m[1]);
NODE
) || fail "APP_VERSION not found in app.js"

SW_APP_VERSION=$(node - <<'NODE'
const fs = require("fs");
const sw = fs.readFileSync("sw.js", "utf8");
const m = sw.match(/const\s+APP_VERSION\s*=\s*"([^"]+)"/);
if (!m) process.exit(1);
process.stdout.write(m[1]);
NODE
) || fail "APP_VERSION not found in sw.js"

CACHE_KEY=$(node - <<'NODE'
const fs = require("fs");
const sw = fs.readFileSync("sw.js", "utf8");
const m = sw.match(/const\s+CACHE\s*=\s*"([^"]+)"/);
if (m) {
  process.stdout.write(m[1]);
  process.exit(0);
}
const t = sw.match(/const\s+CACHE\s*=\s*`([^`]+)`/);
if (!t) process.exit(1);
process.stdout.write(t[1]);
NODE
) || fail "CACHE key not found in sw.js"

if [[ "${APP_VERSION}" != "${SW_APP_VERSION}" ]]; then
  fail "APP_VERSION mismatch (app.js=${APP_VERSION}, sw.js=${SW_APP_VERSION})"
fi
if [[ "${CACHE_KEY}" != *'${APP_VERSION}'* && "${CACHE_KEY}" != *"${APP_VERSION}"* ]]; then
  fail "CACHE key (${CACHE_KEY}) does not include APP_VERSION (${APP_VERSION})"
fi

echo "[smoke] verify APP_SHELL assets exist"
node - <<'NODE'
const fs = require("fs");
const path = require("path");
const sw = fs.readFileSync("sw.js", "utf8");
const m = sw.match(/const\s+APP_SHELL\s*=\s*\[([\s\S]*?)\];/);
if (!m) {
  console.error("APP_SHELL not found");
  process.exit(1);
}
const shell = [];
for (const match of m[1].matchAll(/"([^"]+)"/g)) {
  shell.push(match[1]);
}
if (!shell.length) {
  console.error("APP_SHELL found but no string assets parsed");
  process.exit(1);
}
for (const asset of shell) {
  if (typeof asset !== "string") continue;
  const normalized = asset.replace(/^\.\//, "");
  if (!normalized || normalized.endsWith("/")) continue;
  if (!fs.existsSync(path.resolve(normalized))) {
    console.error(`Missing APP_SHELL asset: ${asset}`);
    process.exit(1);
  }
}
NODE

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
grep -q '<meta name="description"' /tmp/batman-smoke-index.html || fail "index missing meta description"
grep -q '<meta property="og:title"' /tmp/batman-smoke-index.html || fail "index missing og:title"
grep -q 'window.BATMAN_GUIDE_LIST' /tmp/batman-smoke-list.js || fail "list payload missing"
grep -q 'function bootstrap()' /tmp/batman-smoke-app.js || fail "bootstrap function missing"
grep -q 'function bindEraIconFallback()' /tmp/batman-smoke-app.js || fail "era icon fallback binding missing"
if grep -q 'onerror=' /tmp/batman-smoke-app.js; then
  fail "inline onerror handler found in app.js"
fi
grep -q 'NETWORK_FIRST_PATHS' /tmp/batman-smoke-sw.js || fail "service worker marker missing"

echo "[smoke] validate list payload schema"
node scripts/validate-list.js

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

#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function fail(message) {
  console.error(`[cover-validate] FAILED: ${message}`);
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, "..");
const listPath = path.join(repoRoot, "list.js");
const appPath = path.join(repoRoot, "app.js");

let list;
try {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(listPath, "utf8"), ctx, { filename: "list.js" });
  list = ctx.window.BATMAN_GUIDE_LIST;
} catch (error) {
  fail(`could not load list.js: ${error && error.message ? error.message : error}`);
}

if (!Array.isArray(list)) fail("window.BATMAN_GUIDE_LIST missing or invalid");

const appText = fs.readFileSync(appPath, "utf8");

const forbiddenPatterns = [
  { label: "function generatedCoverDataUrl", re: /function\s+generatedCoverDataUrl/ },
  { label: "resolveFallbackCover call/definition", re: /resolveFallbackCover\s*\(/ },
  { label: "inline SVG data URL", re: /data:image\/svg\+xml/i }
];

for (const pattern of forbiddenPatterns) {
  const m = appText.match(pattern.re);
  if (m) {
    const start = Math.max(0, (m.index || 0) - 40);
    const end = Math.min(appText.length, (m.index || 0) + 120);
    const excerpt = appText.slice(start, end).replace(/\s+/g, " ").trim();
    fail(`SVG fallback cover logic found in app.js (not allowed): ${pattern.label} :: ${excerpt}`);
  }
}

const match = appText.match(/const REAL_COVERS = \{([\s\S]*?)\n  \};/);
if (!match) fail("could not parse REAL_COVERS object");

let realCovers;
try {
  // Trusted repo file, evaluate object literal only.
  realCovers = eval(`({${match[1]}})`); // eslint-disable-line no-eval
} catch (error) {
  fail(`failed to evaluate REAL_COVERS: ${error && error.message ? error.message : error}`);
}

const ids = list.map((entry) => entry.id);
const missing = ids.filter((id) => !realCovers[id]);
if (missing.length) fail(`missing REAL_COVERS entries: ${missing.join(", ")}`);

for (const id of ids) {
  const url = String(realCovers[id] || "").trim();
  if (!/^https?:\/\//.test(url)) {
    fail(`REAL_COVERS['${id}'] is not an http(s) URL`);
  }
}

console.log(`[cover-validate] ok (${ids.length} entries, all mapped to real cover URLs)`);

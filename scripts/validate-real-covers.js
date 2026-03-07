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

if (/generatedCoverDataUrl|resolveFallbackCover|data:image\/svg\+xml/.test(appText)) {
  fail("SVG fallback cover logic found in app.js (not allowed)");
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

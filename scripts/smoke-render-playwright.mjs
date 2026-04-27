#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtempSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (error) {
  console.error("[smoke:render] FAILED: Playwright is not installed. Run `npm i -D playwright`.");
  process.exit(1);
}

const serveRoot = mkdtempSync(path.join(tmpdir(), "batman-render-smoke-root."));
const targetDir = path.join(serveRoot, "BatmanGuide");
mkdirSync(targetDir, { recursive: true });
const port = Number(process.env.SMOKE_PORT || 4173);
const baseUrl = `http://127.0.0.1:${port}/BatmanGuide/`;

const filesToCopy = ["index.html", "app.js", "list.js", "sw.js", "manifest.webmanifest"];
for (const rel of filesToCopy) {
  cpSync(path.join(repoRoot, rel), path.join(targetDir, rel), { recursive: false, force: true });
}

const server = spawn("python3", ["-m", "http.server", String(port), "--directory", serveRoot], {
  stdio: "ignore"
});

async function waitForServer() {
  const timeoutAt = Date.now() + 10000;
  while (Date.now() < timeoutAt) {
    try {
      const res = await fetch(`${baseUrl}index.html`);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`Local HTTP server did not become ready on ${baseUrl}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  await waitForServer();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error?.message || error)));

  const seenRequests = new Set();
  page.on("requestfinished", (request) => {
    const url = request.url();
    if (url.includes("/BatmanGuide/app.js")) seenRequests.add("app.js");
    if (url.includes("/BatmanGuide/list.js")) seenRequests.add("list.js");
  });

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) throw new Error("serviceWorker API missing");
    await navigator.serviceWorker.ready;
  });

  assert(seenRequests.has("app.js"), "app.js request was not observed");
  assert(seenRequests.has("list.js"), "list.js request was not observed");

  await page.waitForSelector(".era", { timeout: 10000 });
  await page.waitForSelector(".item", { timeout: 10000 });

  const eraCount = await page.locator(".era").count();
  assert(eraCount >= 1, "expected at least one era section");

  const initialItemCount = await page.locator(".item").count();
  assert(initialItemCount >= 20, `expected at least 20 rendered items, got ${initialItemCount}`);

  await page.fill("#search", "Hush");
  await sleep(300);
  const hushVisible = await page.locator(".item .title", { hasText: /hush/i }).count();
  assert(hushVisible >= 1, "search for 'Hush' returned no rendered results");

  await page.fill("#search", "");
  await sleep(300);

  const preCoreCount = await page.locator(".item").count();
  await page.evaluate(() => {
    const select = document.getElementById("importanceFilter");
    if (!select) throw new Error("importanceFilter not found");
    select.value = "core";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await sleep(300);
  const coreCount = await page.locator(".item").count();
  assert(coreCount > 0, "core filter returned no items");
  assert(coreCount < preCoreCount, `core filter did not reduce result count (${coreCount} vs ${preCoreCount})`);

  const statusControl = page.locator(".status-cycle").first();
  await statusControl.click();
  await sleep(200);

  assert.equal(pageErrors.length, 0, `unexpected browser errors: ${pageErrors.join(" | ")}`);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".item", { timeout: 10000 });
  const reloadCount = await page.locator(".item").count();
  assert(reloadCount >= 20, `expected list render after reload, got ${reloadCount}`);

  await browser.close();
  console.log(`[smoke:render] ok (eras=${eraCount}, items=${initialItemCount}, reloadItems=${reloadCount})`);
} catch (error) {
  console.error(`[smoke:render] FAILED: ${error && error.message ? error.message : error}`);
  process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
  rmSync(serveRoot, { recursive: true, force: true });
}

#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const listPath = path.resolve(__dirname, "..", "list.js");

function parseArgs(argv) {
  const opts = {
    timeoutMs: 12000,
    concurrency: 6,
    max: Infinity,
    includeCovers: false,
    method: "head",
    report: ""
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--include-covers") {
      opts.includeCovers = true;
      continue;
    }
    if (arg === "--get") {
      opts.method = "get";
      continue;
    }
    if (arg === "--timeout-ms") {
      opts.timeoutMs = Number(argv[++i]);
      continue;
    }
    if (arg === "--concurrency") {
      opts.concurrency = Number(argv[++i]);
      continue;
    }
    if (arg === "--max") {
      opts.max = Number(argv[++i]);
      continue;
    }
    if (arg === "--report") {
      opts.report = String(argv[++i] || "").trim();
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelpAndExit(0);
    }
    printHelpAndExit(1, `Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(opts.timeoutMs) || opts.timeoutMs < 1000) {
    printHelpAndExit(1, "--timeout-ms must be a number >= 1000");
  }
  if (!Number.isFinite(opts.concurrency) || opts.concurrency < 1) {
    printHelpAndExit(1, "--concurrency must be a number >= 1");
  }
  if (!(opts.max === Infinity || (Number.isFinite(opts.max) && opts.max >= 1))) {
    printHelpAndExit(1, "--max must be a number >= 1");
  }

  if (opts.report && !opts.report.toLowerCase().endsWith(".json")) {
    printHelpAndExit(1, "--report must point to a .json file");
  }

  return opts;
}

function printHelpAndExit(code, message) {
  if (message) console.error(`[link-check] ${message}`);
  console.log(`Usage: node scripts/check-links.js [options]\n\nOptions:\n  --max <n>            Check at most n URLs\n  --concurrency <n>    Concurrent requests (default: 6)\n  --timeout-ms <ms>    Request timeout in milliseconds (default: 12000)\n  --include-covers     Also validate optional cover URLs\n  --get                Use GET instead of HEAD\n  --report <file>      Write JSON report to file\n  -h, --help           Show this help\n`);
  process.exit(code);
}

function loadList() {
  try {
    global.window = {};
    require(listPath);
  } catch (error) {
    const reason = error && error.message ? error.message : String(error);
    console.error(`[link-check] FAILED: could not load list.js (${reason})`);
    process.exit(1);
  }

  const list = global.window && global.window.BATMAN_GUIDE_LIST;
  if (!Array.isArray(list)) {
    console.error("[link-check] FAILED: window.BATMAN_GUIDE_LIST is missing or not an array");
    process.exit(1);
  }
  return list;
}

function collectUrls(list, includeCovers) {
  const byKey = new Map();

  for (const entry of list) {
    const candidates = [{ id: entry.id, field: "url", value: entry.url }];

    if (Array.isArray(entry.issues)) {
      entry.issues.forEach((issue, issueIndex) => {
        candidates.push({
          id: `${entry.id} issue #${issueIndex + 1}`,
          label: issue && issue.title ? String(issue.title) : "",
          field: "issue.url",
          value: issue && issue.url
        });
      });
    }

    if (includeCovers && typeof entry.cover === "string") {
      candidates.push({ id: entry.id, field: "cover", value: entry.cover });
    }

    for (const candidate of candidates) {
      if (typeof candidate.value !== "string" || !/^https?:\/\//.test(candidate.value)) continue;
      const key = `${candidate.field}:${candidate.value}`;
      const ref = candidate.label ? `${candidate.id} "${candidate.label}"` : candidate.id;
      if (!byKey.has(key)) {
        byKey.set(key, Object.assign({}, candidate, { refs: [ref] }));
        continue;
      }
      const existing = byKey.get(key);
      if (!existing.refs.includes(ref)) {
        existing.refs.push(ref);
      }
    }
  }

  return [...byKey.values()];
}

async function request(target, method, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();

  try {
    const response = await fetch(target.value, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "batman-guide-link-check/1.0" }
    });
    return {
      ok: response.ok,
      status: response.status,
      ms: Date.now() - started,
      method,
      target
    };
  } catch (error) {
    const rawMessage = error && error.message ? error.message : String(error);
    const causeCode = error && error.cause && error.cause.code ? error.cause.code : "";
    const reason = causeCode ? `${rawMessage} (${causeCode})` : rawMessage;
    return {
      ok: false,
      status: "ERR",
      ms: Date.now() - started,
      method,
      target,
      error: reason
    };
  } finally {
    clearTimeout(timer);
  }
}

async function checkOne(target, opts) {
  if (opts.method === "get") {
    return request(target, "GET", opts.timeoutMs);
  }

  const head = await request(target, "HEAD", opts.timeoutMs);
  if (head.ok) return head;

  const shouldFallback = head.status === 403 || head.status === 405 || head.status === "ERR";
  if (!shouldFallback) return head;

  const getResult = await request(target, "GET", opts.timeoutMs);
  return Object.assign({}, getResult, { fallbackFromHead: true, headStatus: head.status, headError: head.error || "" });
}

async function runPool(items, limit, worker) {
  const results = [];
  let index = 0;

  async function next() {
    const current = index;
    index += 1;
    if (current >= items.length) return;
    results[current] = await worker(items[current]);
    await next();
  }

  const workers = [];
  for (let i = 0; i < Math.min(limit, items.length); i += 1) {
    workers.push(next());
  }
  await Promise.all(workers);
  return results;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const list = loadList();
  const allUrls = collectUrls(list, opts.includeCovers);
  const targets = allUrls.slice(0, Number.isFinite(opts.max) ? opts.max : undefined);

  if (!targets.length) {
    console.log("[link-check] no URLs to check");
    return;
  }

  console.log(`[link-check] checking ${targets.length} URL(s) with ${opts.concurrency} worker(s), timeout ${opts.timeoutMs}ms, method ${opts.method.toUpperCase()}`);
  const results = await runPool(targets, opts.concurrency, (target) => checkOne(target, opts));

  let failCount = 0;
  for (const result of results) {
    const issueLabel = result.target.label ? ` "${result.target.label}"` : "";
    const label = `${result.target.id}${issueLabel} ${result.target.field}`;
    const refs = Array.isArray(result.target.refs) && result.target.refs.length > 1 ? ` refs=[${result.target.refs.join(", ")}]` : "";
    if (result.ok) {
      const suffix = result.fallbackFromHead ? ` (fallback HEAD:${result.headStatus} -> GET)` : "";
      console.log(`[link-check] OK  ${result.status} ${label} (${result.ms}ms) ${result.target.value}${suffix}${refs}`);
    } else {
      failCount += 1;
      const reason = result.error ? ` ${result.error}` : "";
      const suffix = result.fallbackFromHead ? ` (fallback HEAD:${result.headStatus} -> GET)` : "";
      console.error(`[link-check] BAD ${result.status} ${label} (${result.ms}ms) ${result.target.value}${reason}${suffix}${refs}`);
    }
  }


  if (opts.report) {
    const payload = {
      generatedAt: new Date().toISOString(),
      options: opts,
      total: results.length,
      failed: failCount,
      results
    };
    fs.writeFileSync(path.resolve(process.cwd(), opts.report), JSON.stringify(payload, null, 2) + "\n", "utf8");
    console.log(`[link-check] wrote report ${opts.report}`);
  }

  if (failCount > 0) {
    console.error(`[link-check] FAILED: ${failCount}/${results.length} URL(s) returned errors`);
    process.exit(1);
  }

  console.log(`[link-check] ok (${results.length} URL(s))`);
}

void main();

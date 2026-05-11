#!/usr/bin/env node
/**
 * Local/manual DCUI collection exporter.
 *
 * IMPORTANT:
 * - This script only extracts visible metadata from collection pages.
 * - Do not use it to bypass authentication, region-locks, or protected content.
 * - Selectors on DCUI can change; expect to adjust detection heuristics after real-page testing.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

function parseArgs(argv) {
  const args = { id: "", url: "", out: "" };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--id") args.id = String(argv[i + 1] || "").trim();
    if (token === "--url") args.url = String(argv[i + 1] || "").trim();
    if (token === "--out") args.out = String(argv[i + 1] || "").trim();
  }
  return args;
}

function usageAndExit(message = "") {
  if (message) console.error(`[dcui-export] ${message}`);
  console.error("Usage: node tools/export-dcui-collection.mjs --id <list-id> --url <dcui-collection-url> --out <output-json>");
  process.exit(1);
}

function normalizeDcuiUrl(raw, baseUrl) {
  if (!raw) return "";
  try {
    const resolved = new URL(raw, baseUrl);
    if (!/dcuniverseinfinite\.com$/i.test(resolved.hostname)) return "";
    resolved.hash = "";
    return resolved.toString();
  } catch {
    return "";
  }
}

function toYyyyMmDd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

async function waitForManualAccess(page, targetUrl) {
  await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  console.log("[dcui-export] Browser opened. Log in manually if prompted.");
  console.log("[dcui-export] After login, ensure the target collection page is visible.");

  const maxWaitMs = 10 * 60 * 1000;
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const currentUrl = page.url();
    const title = await page.title();
    const hasCollectionHints = /collections\//i.test(currentUrl)
      || /collection/i.test(title)
      || await page.locator("a[href*='/comics/'], a[href*='/book/'], a[href*='/series/']").count() > 0;

    if (hasCollectionHints) {
      console.log(`[dcui-export] Page appears accessible: ${title}`);
      return;
    }

    await page.waitForTimeout(1000);
  }

  throw new Error("Timed out waiting for manually accessible collection page");
}

async function autoScrollUntilStable(page) {
  const maxRounds = 60;
  const stableRoundsTarget = 4;
  let stableRounds = 0;
  let lastCount = -1;

  for (let round = 0; round < maxRounds; round += 1) {
    await page.evaluate(() => {
      window.scrollBy({ top: Math.max(500, Math.floor(window.innerHeight * 0.85)), behavior: "instant" });
    });
    await page.waitForTimeout(700);

    const count = await page.locator("a[href*='/comics/'], a[href*='/book/'], a[href*='/series/'], a[href*='/issue/']").count();
    if (count === lastCount) {
      stableRounds += 1;
    } else {
      stableRounds = 0;
      lastCount = count;
    }

    if (stableRounds >= stableRoundsTarget) break;
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(400);
}

async function extractVisibleMetadata(page, collectionUrl) {
  const scraped = await page.evaluate((baseUrl) => {
    const ABS = (href) => {
      try {
        if (!href) return "";
        const u = new URL(href, baseUrl);
        u.hash = "";
        return u.toString();
      } catch {
        return "";
      }
    };

    const normalize = (s) => String(s || "").replace(/\s+/g, " ").trim();
    const isLikelyIssueUrl = (url) => /\/comics\/(book|series)\//i.test(url) || /\/issue\//i.test(url);
    const pickTitleFromAnchor = (a) => {
      const candidates = [
        a.getAttribute("aria-label"),
        a.getAttribute("title"),
        a.querySelector("h1,h2,h3,h4,[data-title],.title")?.textContent,
        a.textContent
      ];
      for (const c of candidates) {
        const t = normalize(c);
        if (t) return t;
      }
      return "";
    };

    const anchors = [...document.querySelectorAll("a[href]")].filter((a) => {
      const href = ABS(a.getAttribute("href") || "");
      return isLikelyIssueUrl(href);
    });

    const linkedItems = [];
    const seen = new Set();
    for (const a of anchors) {
      const url = ABS(a.getAttribute("href") || "");
      if (!url || seen.has(url)) continue;
      const title = pickTitleFromAnchor(a);
      if (!title) continue;
      seen.add(url);
      linkedItems.push({ title, url });
    }

    // Group detection heuristics: closest heading text above anchor cards.
    // DCUI DOM may change; these selectors/heuristics likely need future adjustment.
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .map((h) => ({
        el: h,
        title: normalize(h.textContent),
        top: h.getBoundingClientRect().top + window.scrollY
      }))
      .filter((x) => x.title);

    const byGroup = new Map();
    const getGroupKey = (title) => title || "__ungrouped__";

    for (const a of anchors) {
      const url = ABS(a.getAttribute("href") || "");
      if (!url || !isLikelyIssueUrl(url)) continue;
      const title = pickTitleFromAnchor(a);
      if (!title) continue;

      const aTop = a.getBoundingClientRect().top + window.scrollY;
      let nearest = null;
      for (const h of headings) {
        if (h.top <= aTop && (!nearest || h.top > nearest.top)) nearest = h;
      }
      const groupTitle = nearest ? nearest.title : "";
      const key = getGroupKey(groupTitle);
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key).push({ title, url });
    }

    const groupsRaw = [];
    for (const [groupTitle, items] of byGroup.entries()) {
      if (groupTitle === "__ungrouped__") continue;
      if (!items.length) continue;
      groupsRaw.push({ title: groupTitle, items });
    }

    const collectionTitle = normalize(document.querySelector("h1")?.textContent || document.title);
    return { collectionTitle, linkedItems, groupsRaw };
  }, collectionUrl);

  return scraped;
}

function detectGroupKind(title) {
  const t = String(title || "").toLowerCase();
  if (t.includes("storyline") || t.includes("saga") || t.includes("story")) return "storyline";
  if (t.includes("series") || t.includes("issues")) return "series";
  if (t.includes("section") || t.includes("part")) return "section";
  return "other";
}

async function main() {
  const { id, url, out } = parseArgs(process.argv);
  if (!id) usageAndExit("Missing --id");
  if (!url) usageAndExit("Missing --url");
  if (!out) usageAndExit("Missing --out");

  const collectionUrl = normalizeDcuiUrl(url, url);
  if (!collectionUrl || !collectionUrl.includes("/collections/")) {
    usageAndExit("--url must be a DCUI collection URL");
  }

  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await waitForManualAccess(page, collectionUrl);
    await autoScrollUntilStable(page);

    const pageTitle = await page.title();
    const { collectionTitle, linkedItems, groupsRaw } = await extractVisibleMetadata(page, collectionUrl);

    const unresolvedItems = [];
    const warnings = [];

    const normalizeItem = (item, index) => {
      const normalizedUrl = normalizeDcuiUrl(item.url, collectionUrl);
      const title = String(item.title || "").trim();
      const position = index + 1;
      if (!title) return null;
      if (!normalizedUrl) {
        unresolvedItems.push({ position, title, reason: "missing_or_non_dcui_url" });
        return null;
      }
      return { position, title, url: normalizedUrl };
    };

    const groups = [];
    const groupedUrlSet = new Set();
    for (const raw of groupsRaw) {
      const items = [];
      raw.items.forEach((item, idx) => {
        const normalized = normalizeItem(item, idx);
        if (normalized) {
          items.push(normalized);
          groupedUrlSet.add(normalized.url);
        }
      });
      if (items.length > 0) {
        groups.push({
          kind: detectGroupKind(raw.title),
          title: raw.title,
          items
        });
      }
    }

    const ungroupedItems = [];
    linkedItems.forEach((item, idx) => {
      const normalized = normalizeItem(item, idx);
      if (!normalized) return;
      if (!groupedUrlSet.has(normalized.url)) {
        ungroupedItems.push(normalized);
      }
    });

    if (groups.length === 0) {
      warnings.push("No reliable grouping detected; exported items as ungroupedItems.");
      // ensure ungrouped has all linked items when no groups detected
      const seen = new Set(ungroupedItems.map((x) => x.url));
      linkedItems.forEach((item, idx) => {
        const normalized = normalizeItem(item, idx);
        if (normalized && !seen.has(normalized.url)) {
          ungroupedItems.push(normalized);
          seen.add(normalized.url);
        }
      });
    }

    const itemsWithUrls = groups.reduce((sum, g) => sum + g.items.length, 0) + ungroupedItems.length;

    const output = {
      version: 1,
      id,
      collectionUrl,
      source: {
        capturedAt: toYyyyMmDd(),
        method: "local-playwright-dcui-visible-metadata"
      },
      summary: {
        totalItems: itemsWithUrls + unresolvedItems.length,
        itemsWithUrls,
        unresolvedItems: unresolvedItems.length,
        groups: groups.length
      },
      groups,
      ungroupedItems,
      unresolvedItems,
      warnings
    };

    const outPath = path.resolve(process.cwd(), out);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

    console.log(`[dcui-export] Page title: ${pageTitle}`);
    console.log(`[dcui-export] Collection title: ${collectionTitle || "(not detected)"}`);
    console.log(`[dcui-export] Groups detected: ${groups.length}`);
    console.log(`[dcui-export] Linked items found: ${itemsWithUrls}`);
    console.log(`[dcui-export] Unresolved items: ${unresolvedItems.length}`);
    console.log(`[dcui-export] Output: ${outPath}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`[dcui-export] FAILED: ${error && error.message ? error.message : error}`);
  process.exit(1);
});

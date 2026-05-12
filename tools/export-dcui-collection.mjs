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
  const args = { id: "", url: "", out: "", clickExpand: false };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--id") args.id = String(argv[i + 1] || "").trim();
    if (token === "--url") args.url = String(argv[i + 1] || "").trim();
    if (token === "--out") args.out = String(argv[i + 1] || "").trim();
    if (token === "--click-expand") args.clickExpand = true;
  }
  return args;
}

function usageAndExit(message = "") {
  if (message) console.error(`[dcui-export] ${message}`);
  console.error("Usage: node tools/export-dcui-collection.mjs --id <list-id> --url <dcui-collection-url> --out <output-json> [--click-expand]");
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

}

// Keep exactly one expansion helper; avoid duplicate declarations from bad merges.
async function tryExpandControls(page) {
  const labels = [
    "view all",
    "see all",
    "show more",
    "load more",
    "next"
  ];
  const maxClicks = 20;
  let totalCandidates = 0;
  let clicks = 0;

  // Optional-only expansion pass. Keep conservative and non-blocking; avoid issue/book links.
  for (const label of labels) {
    if (clicks >= maxClicks) break;
    const locator = page.locator("button, [role='button'], a", { hasText: new RegExp(label, "i") });
    let count = 0;
    try {
      count = await locator.count({ timeout: 1200 });
    } catch {
      count = 0;
    }
    if (!count) continue;
    totalCandidates += count;
    const clickedForLabel = await page.evaluate(({ textNeedle, maxPerLabel }) => {
      const normalize = (s) => String(s || "").replace(/\s+/g, " ").trim().toLowerCase();
      const nodes = [...document.querySelectorAll("button, [role='button'], a")];
      let clicked = 0;
      for (const node of nodes) {
        if (clicked >= maxPerLabel) break;
        const text = normalize(node.textContent || node.getAttribute("aria-label"));
        if (!text.includes(textNeedle)) continue;
        const href = node.getAttribute("href") || "";
        if (/\/comics\/(book|series)\//i.test(href) || /\/issue\//i.test(href)) continue;
        const ariaDisabled = normalize(node.getAttribute("aria-disabled"));
        if (node.hasAttribute("disabled") || ariaDisabled === "true") continue;
        try {
          node.scrollIntoView({ block: "center", inline: "nearest" });
          node.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
          clicked += 1;
        } catch {
          // Ignore stale/unusable nodes.
        }
      }
      return clicked;
    }, { textNeedle: label.toLowerCase(), maxPerLabel: Math.min(5, maxClicks - clicks) });
    if (clickedForLabel > 0) {
      clicks += clickedForLabel;
      await page.waitForTimeout(250);
    }
  }
  return { totalCandidates, clicks };
}

// Keep exactly one horizontal-scroll helper; avoid duplicate declarations from bad merges.
async function scrollHorizontalContainers(page) {
  return page.evaluate(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const isVisible = (el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const candidates = [...document.querySelectorAll("div,section,ul,ol")].filter((el) => {
      if (!isVisible(el)) return false;
      const style = window.getComputedStyle(el);
      const overflowXScrollable = /(auto|scroll)/i.test(style.overflowX);
      const hasHorizontalOverflow = (el.scrollWidth - el.clientWidth) > 24;
      return overflowXScrollable || hasHorizontalOverflow;
    });

    let totalMoves = 0;
    for (const el of candidates) {
      let stable = 0;
      let prevLeft = -1;
      for (let round = 0; round < 24; round += 1) {
        const step = Math.max(240, Math.floor(el.clientWidth * 0.85));
        el.scrollBy({ left: step, behavior: "instant" });
        await sleep(120);
        const left = Math.round(el.scrollLeft);
        if (left === prevLeft) stable += 1;
        else stable = 0;
        prevLeft = left;
        totalMoves += 1;
        if (stable >= 2) break;
      }
    }
    return { candidates: candidates.length, totalMoves };
  });
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

function parseExpectedCount(title) {
  const t = String(title || "");
  const match = t.match(/\((\d+)\)\s*$/);
  if (!match) return null;
  const n = Number.parseInt(match[1], 10);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const { id, url, out, clickExpand } = parseArgs(process.argv);
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
    // DCUI collections can be split into lazy-loaded vertical sections plus horizontal carousels.
    // These heuristics intentionally attempt both styles of loading and may need selector updates over time.
    await autoScrollUntilStable(page);
    for (let round = 0; round < 3; round += 1) {
      const scrolled = await scrollHorizontalContainers(page);
      console.log(`[dcui-export] Horizontal pass ${round + 1}: containers=${scrolled.candidates}, moves=${scrolled.totalMoves}`);
      if (clickExpand) {
        const expanded = await tryExpandControls(page);
        console.log(`[dcui-export] Expand pass ${round + 1}: candidates=${expanded.totalCandidates}, clicks=${expanded.clicks}`);
      }
      await autoScrollUntilStable(page);
    }

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
    let expectedTotalItems = 0;
    let actualTotalItems = 0;
    const incompleteGroups = [];
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
        const expectedCount = parseExpectedCount(raw.title);
        const actualCount = items.length;
        const isComplete = expectedCount == null ? null : actualCount >= expectedCount;
        if (expectedCount != null) expectedTotalItems += expectedCount;
        actualTotalItems += actualCount;
        console.log(`[dcui-export] Group: ${raw.title}`);
        console.log(`[dcui-export]   expectedCount=${expectedCount == null ? "n/a" : expectedCount}`);
        console.log(`[dcui-export]   actualCount=${actualCount}`);
        console.log(`[dcui-export]   isComplete=${isComplete == null ? "unknown" : isComplete}`);
        if (expectedCount != null && actualCount < expectedCount) {
          const warning = `Group '${raw.title}' incomplete: extracted ${actualCount} of ${expectedCount} items.`;
          warnings.push(warning);
          incompleteGroups.push(raw.title);
          console.warn(`[dcui-export] WARNING: ${warning}`);
        }
        groups.push({
          kind: detectGroupKind(raw.title),
          title: raw.title,
          ...(expectedCount != null ? { expectedCount } : {}),
          actualCount,
          ...(isComplete != null ? { isComplete } : {}),
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
        groups: groups.length,
        expectedTotalItems: expectedTotalItems || null,
        actualTotalItems,
        incompleteGroups: incompleteGroups.length,
        extractionComplete: incompleteGroups.length === 0
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
    console.log(`[dcui-export] extractionComplete: ${output.summary.extractionComplete}`);
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

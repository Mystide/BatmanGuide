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
  const args = { id: "", url: "", out: "", clickExpand: false, debugDom: false };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--id") args.id = String(argv[i + 1] || "").trim();
    if (token === "--url") args.url = String(argv[i + 1] || "").trim();
    if (token === "--out") args.out = String(argv[i + 1] || "").trim();
    if (token === "--click-expand") args.clickExpand = true;
    if (token === "--debug-dom") args.debugDom = true;
  }
  return args;
}

function usageAndExit(message = "") {
  if (message) console.error(`[dcui-export] ${message}`);
  console.error("Usage: node tools/export-dcui-collection.mjs --id <list-id> --url <dcui-collection-url> --out <output-json> [--click-expand] [--debug-dom]");
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


function normalizeCoverUrl(raw, baseUrl) {
  if (!raw) return "";
  try {
    const u = new URL(raw, baseUrl);
    if (!/^https?:$/i.test(u.protocol)) return "";
    const lowerHost = u.hostname.toLowerCase();
    const lowerPath = u.pathname.toLowerCase();
    const rejectNeedles = ["logo", "icon", "sprite", "placeholder", "tracking", "pixel", "avatar"];
    if (rejectNeedles.some((needle) => lowerPath.includes(needle))) return "";
    if (lowerHost === "imgix-media.wbdndc.net" && lowerPath.includes("/ingest/book/preview/")) {
      u.search = "";
      u.hash = "";
      return u.toString();
    }
    return u.toString();
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
async function tryExpandControls(page, incompleteGroupTitles = []) {
  const labels = [
    "view all",
    "see all",
    "see more",
    "show more",
    "load more",
    "next"
  ];
  const maxClicks = 20;
  let totalCandidates = 0;
  let clicks = 0;
  const skipped = {
    skipped_non_empty_navigation_href: 0,
    skipped_disabled: 0,
    skipped_not_exact_see_more: 0,
    skipped_no_group_heading: 0,
    skipped_outside_issue_group: 0,
    click_failed: 0,
    no_reason_unknown: 0,
    skipped_group_complete: 0
  };

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
    const resultForLabel = await page.evaluate(({ textNeedle, maxPerLabel, incompleteTitles }) => {
      const normalize = (s) => String(s || "").replace(/\s+/g, " ").trim().toLowerCase();
      const parseExpectedCountLocal = (s) => {
        const m = String(s || "").match(/\((\d+)\)\s*$/);
        return m ? Number.parseInt(m[1], 10) : null;
      };
      const isRealIssueHeading = (s) => /\bissues\b/i.test(s) && parseExpectedCountLocal(s) != null && !/privacy|cookie|policy|terms|footer|navigation/i.test(s);
      const nearestHeadingFor = (node) => {
        const headings = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
          .map((h) => ({ text: normalize(h.textContent), raw: String(h.textContent || "").replace(/\s+/g, " ").trim(), top: h.getBoundingClientRect().top + window.scrollY }))
          .filter((h) => h.text && isRealIssueHeading(h.raw));
        const nodeTop = node.getBoundingClientRect().top + window.scrollY;
        let nearest = null;
        for (const h of headings) if (h.top <= nodeTop && (!nearest || h.top > nearest.top)) nearest = h;
        return nearest ? nearest.raw : "";
      };
      const nodes = [...document.querySelectorAll("button, [role='button'], a")];
      let clicked = 0;
      const skipped = {
        skipped_non_empty_navigation_href: 0,
        skipped_disabled: 0,
        skipped_not_exact_see_more: 0,
        skipped_no_group_heading: 0,
        skipped_outside_issue_group: 0,
        click_failed: 0,
        no_reason_unknown: 0,
        skipped_group_complete: 0
      };
      for (const node of nodes) {
        if (clicked >= maxPerLabel) break;
        const text = normalize(node.textContent || node.getAttribute("aria-label"));
        const exactSeeMore = textNeedle === "see more" && text === "see more";
        const broadMatch = textNeedle !== "see more" && text.includes(textNeedle);
        if (!exactSeeMore && !broadMatch) {
          if (textNeedle === "see more" && text.includes("more")) skipped.skipped_not_exact_see_more += 1;
          continue;
        }
        const href = node.getAttribute("href") || "";
        if (/\/comics\/(book|series)\//i.test(href) || /\/issue\//i.test(href) || /\/browse|\/login|\/register/i.test(href)) {
          skipped.skipped_non_empty_navigation_href += 1;
          continue;
        }
        if (href && href.trim() && href !== "#" && href.toLowerCase() !== "javascript:void(0)") {
          skipped.skipped_non_empty_navigation_href += 1;
          continue;
        }
        const ariaDisabled = normalize(node.getAttribute("aria-disabled"));
        if (node.hasAttribute("disabled") || ariaDisabled === "true") {
          skipped.skipped_disabled += 1;
          continue;
        }
        const className = normalize(node.className);
        const heading = nearestHeadingFor(node);
        if (textNeedle === "see more") {
          if (!className.includes("dcc-button")) {
            skipped.skipped_outside_issue_group += 1;
            continue;
          }
          if (!heading) {
            skipped.skipped_no_group_heading += 1;
          } else if (!isRealIssueHeading(heading)) {
            skipped.skipped_outside_issue_group += 1;
            continue;
          } else if (!incompleteTitles.includes(heading)) {
            skipped.skipped_group_complete += 1;
            continue;
          }
        }
        try {
          node.scrollIntoView({ block: "center", inline: "nearest" });
          node.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
          clicked += 1;
        } catch {
          skipped.click_failed += 1;
        }
      }
      return { clicked, skipped };
    }, { textNeedle: label.toLowerCase(), maxPerLabel: Math.min(5, maxClicks - clicks), incompleteTitles: incompleteGroupTitles });
    clicks += resultForLabel.clicked;
    for (const [k, v] of Object.entries(resultForLabel.skipped || {})) skipped[k] = (skipped[k] || 0) + v;
    if (resultForLabel.clicked > 0) {
      await page.waitForTimeout(250);
    }
  }
  return { totalCandidates, clicks, skipped };
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

    const parseSrcset = (srcset) => String(srcset || "").split(",").map((part) => part.trim().split(/\s+/)[0]).filter(Boolean);
    const collectCoverCandidates = (root) => {
      const out = [];
      const push = (value) => { if (value) out.push(value); };
      const inspect = (node) => {
        if (!node) return;
        if (node.tagName === "IMG") {
          push(node.currentSrc);
          push(node.src);
          push(node.getAttribute("src"));
          push(node.getAttribute("data-src"));
          push(node.getAttribute("data-lazy-src"));
          push(node.getAttribute("data-original"));
          parseSrcset(node.getAttribute("srcset")).forEach(push);
        }
        if (node.tagName === "SOURCE") {
          push(node.src);
          push(node.getAttribute("src"));
          parseSrcset(node.getAttribute("srcset")).forEach(push);
        }
        const bg = String(window.getComputedStyle(node).backgroundImage || "");
        const m = bg.match(/url\((['"]?)(.*?)\1\)/i);
        if (m && m[2]) push(m[2]);
      };
      inspect(root);
      root.querySelectorAll("img,source,picture source,[style*='background-image']").forEach(inspect);
      return out;
    };
    const chooseBestCoverCandidate = (rawCandidates) => {
      const scored = rawCandidates.map((raw) => {
        const normalized = String(raw || "").trim();
        if (!normalized) return null;
        const resolution = normalized.match(/(\d{2,4})w/i);
        return { raw: normalized, score: resolution ? Number.parseInt(resolution[1], 10) : 0 };
      }).filter(Boolean).sort((a, b) => b.score - a.score);
      return scored[0]?.raw || "";
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
      const container = a.closest("article,li,div,section,[role='listitem'],[class*='card'],[class*='tile']") || a;
      const coverRaw = chooseBestCoverCandidate([...collectCoverCandidates(a), ...collectCoverCandidates(container)]);
      const coverUrl = coverRaw ? ABS(coverRaw) : "";
      linkedItems.push({ title, url, coverUrl });
    }

    // Group detection heuristics: closest heading text above anchor cards.
    // DCUI DOM may change; these selectors/heuristics likely need future adjustment.
    const parseExpectedCountLocal = (title) => {
      const m = String(title || "").match(/\((\d+)\)\s*$/);
      return m ? Number.parseInt(m[1], 10) : null;
    };
    const isRealIssueHeading = (title) => /\bissues\b/i.test(title) && parseExpectedCountLocal(title) != null && !/privacy|cookie|policy|terms|footer|navigation/i.test(title);
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")]
      .map((h) => ({
        el: h,
        title: normalize(h.textContent),
        top: h.getBoundingClientRect().top + window.scrollY
      }))
      .filter((x) => x.title && isRealIssueHeading(x.title));

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
      const container = a.closest("article,li,div,section,[role='listitem'],[class*='card'],[class*='tile']") || a;
      const coverRaw = chooseBestCoverCandidate([...collectCoverCandidates(a), ...collectCoverCandidates(container)]);
      const coverUrl = coverRaw ? ABS(coverRaw) : "";
      byGroup.get(key).push({ title, url, coverUrl });
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

function isRealIssueGroupHeading(title) {
  const t = String(title || "").trim();
  if (!t) return false;
  if (/privacy|cookie|policy|terms|footer|navigation/i.test(t)) return false;
  if (!/\bissues\b/i.test(t)) return false;
  return parseExpectedCount(t) != null;
}

async function collectDomDiagnostics(page, collectionUrl, groups) {
  return page.evaluate(({ baseUrl, groupsMeta }) => {
    const normalize = (s) => String(s || "").replace(/\s+/g, " ").trim();
    const abs = (href) => {
      try { return new URL(href || "", baseUrl).toString(); } catch { return ""; }
    };
    const isComic = (href) => /\/comics\/(book|series)\//i.test(href) || /\/issue\//i.test(href);
    const getTop = (el) => el.getBoundingClientRect().top + window.scrollY;
    const parseExpectedCountLocal = (title) => {
      const m = String(title || "").match(/\((\d+)\)\s*$/);
      return m ? Number.parseInt(m[1], 10) : null;
    };
    const isPrivacyish = (title) => /privacy|cookie|policy|terms|footer|navigation/i.test(title);
    const isRealIssueHeading = (title) => /\bissues\b/i.test(title) && parseExpectedCountLocal(title) != null && !isPrivacyish(title);
    const headingNodes = [...document.querySelectorAll("h1,h2,h3,h4,[role='heading']")];
    const headings = headingNodes.map((h) => ({ text: normalize(h.textContent), top: Math.round(getTop(h)) })).filter((h) => h.text);
    const realIssueGroupHeadings = headings.filter((h) => isRealIssueHeading(h.text)).map((h) => ({ ...h, expectedCount: parseExpectedCountLocal(h.text) }));
    const ignoredHeadings = headings.filter((h) => !isRealIssueHeading(h.text)).map((h) => ({
      ...h,
      reason: isPrivacyish(h.text) ? "privacy_cookie_footer" : "no_expected_count"
    }));
    const nearestHeading = (elTop) => {
      let nearest = null;
      for (const h of realIssueGroupHeadings) if (h.top <= elTop && (!nearest || h.top > nearest.top)) nearest = h;
      return nearest ? nearest.text : "";
    };

    const links = [...document.querySelectorAll("a[href]")].map((a) => {
      const href = abs(a.getAttribute("href"));
      if (!isComic(href)) return null;
      const top = Math.round(getTop(a));
      return { title: normalize(a.textContent || a.getAttribute("aria-label") || a.getAttribute("title")), href, nearestHeading: nearestHeading(top) };
    }).filter(Boolean);

    const scrollables = [...document.querySelectorAll("div,section,ul,ol")].filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return false;
      const style = window.getComputedStyle(el);
      return /(auto|scroll)/i.test(style.overflowX) || (el.scrollWidth - el.clientWidth) > 24;
    }).map((el) => ({
      tagName: el.tagName,
      className: normalize(el.className),
      role: normalize(el.getAttribute("role")),
      ariaLabel: normalize(el.getAttribute("aria-label")),
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollLeft: Math.round(el.scrollLeft),
      visibleTextSample: normalize(el.textContent).slice(0, 180),
      descendantComicLinks: el.querySelectorAll("a[href*='/comics/'], a[href*='/issue/']").length
    }));

    const controls = [...document.querySelectorAll("button, [role='button'], a[href], [tabindex]")].map((el) => {
      const r = el.getBoundingClientRect();
      const top = Math.round(getTop(el));
      return {
        tagName: el.tagName,
        text: normalize(el.textContent),
        ariaLabel: normalize(el.getAttribute("aria-label")),
        title: normalize(el.getAttribute("title")),
        role: normalize(el.getAttribute("role")),
        className: normalize(el.className),
        disabled: el.hasAttribute("disabled") || normalize(el.getAttribute("aria-disabled")) === "true",
        href: normalize(el.getAttribute("href")),
        bbox: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
        nearestHeading: nearestHeading(top)
      };
    }).filter((x) => x.text || x.ariaLabel || x.href);

    const seeMoreControls = controls
      .filter((c) => normalize(c.text).toLowerCase() === "see more" || normalize(c.ariaLabel).toLowerCase() === "see more")
      .map((c) => {
        let decision = "eligible";
        const href = (c.href || "").trim();
        if (href && href !== "#") decision = "skipped_non_empty_navigation_href";
        else if (c.disabled) decision = "skipped_disabled";
        else if (!c.nearestHeading) decision = "skipped_no_group_heading";
        return { ...c, nearestRealIssueGroup: c.nearestHeading || "", decision };
      });

    const groups = groupsMeta.map((g) => ({
      groupTitle: g.title,
      expectedCount: g.expectedCount ?? null,
      actualDetectedLinks: g.actualCount,
      appearsIncomplete: g.expectedCount != null ? g.actualCount < g.expectedCount : null
    }));

    return {
      pageTitle: document.title,
      currentUrl: window.location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      headings,
      realIssueGroupHeadings,
      ignoredHeadings,
      scrollableContainers: scrollables,
      controls,
      seeMoreControls,
      comicLinks: links,
      groups
    };
  }, { baseUrl: collectionUrl, groupsMeta: groups.map((g) => ({ title: g.title, expectedCount: g.expectedCount ?? null, actualCount: g.actualCount })) });
}

async function main() {
  const { id, url, out, clickExpand, debugDom } = parseArgs(process.argv);
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
    const maxExpandIterations = clickExpand ? 12 : 3;
    let prevTotalLinks = -1;
    let prevGroupSignature = "";
    for (let round = 0; round < maxExpandIterations; round += 1) {
      const scrolled = await scrollHorizontalContainers(page);
      console.log(`[dcui-export] Horizontal pass ${round + 1}: containers=${scrolled.candidates}, moves=${scrolled.totalMoves}`);
      const snapshot = await extractVisibleMetadata(page, collectionUrl);
      const counts = snapshot.groupsRaw
        .filter((g) => isRealIssueGroupHeading(g.title))
        .map((g) => ({ title: g.title, expectedCount: parseExpectedCount(g.title), actualCount: g.items.length }));
      const incomplete = counts.filter((g) => g.expectedCount != null && g.actualCount < g.expectedCount);
      const currentTotalLinks = snapshot.linkedItems.length;
      const groupSignature = counts.map((g) => `${g.title}:${g.actualCount}/${g.expectedCount ?? "?"}`).join("|");
      console.log(`[dcui-export] Group snapshot: ${groupSignature || "none"}`);

      if (!clickExpand) {
        await autoScrollUntilStable(page);
        continue;
      }

      if (incomplete.length === 0) {
        console.log("[dcui-export] All expected groups complete; stopping expand loop.");
        break;
      }

      const incompleteTitles = incomplete.map((g) => g.title);
      const expanded = await tryExpandControls(page, incompleteTitles);
      console.log(`[dcui-export] Expand pass ${round + 1}: candidates=${expanded.totalCandidates}, clicks=${expanded.clicks}`);
      console.log(`[dcui-export] Expand skips: ${JSON.stringify(expanded.skipped)}`);
      await page.waitForTimeout(500);
      await autoScrollUntilStable(page);

      const after = await extractVisibleMetadata(page, collectionUrl);
      const afterTotal = after.linkedItems.length;
      const afterCounts = after.groupsRaw
        .filter((g) => isRealIssueGroupHeading(g.title))
        .map((g) => ({ title: g.title, expectedCount: parseExpectedCount(g.title), actualCount: g.items.length }));
      const afterSig = afterCounts.map((g) => `${g.title}:${g.actualCount}/${g.expectedCount ?? "?"}`).join("|");

      const madeProgress = afterTotal > currentTotalLinks || afterSig !== groupSignature;
      const stalled = expanded.clicks === 0 || (!madeProgress && prevTotalLinks === afterTotal && prevGroupSignature === afterSig);
      prevTotalLinks = afterTotal;
      prevGroupSignature = afterSig;
      if (stalled) {
        console.log("[dcui-export] Expand loop stalled; no further progress detected.");
        break;
      }
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
      const normalizedCoverUrl = normalizeCoverUrl(item.coverUrl, collectionUrl);
      return { position, title, url: normalizedUrl, ...(normalizedCoverUrl ? { coverUrl: normalizedCoverUrl } : {}) };
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

    const allResolvedItems = [...groups.flatMap((g) => g.items), ...ungroupedItems];
    const itemsWithUrls = allResolvedItems.length;
    const itemsWithCovers = allResolvedItems.filter((item) => !!item.coverUrl).length;

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
        itemsWithCovers,
        itemsMissingCovers: Math.max(0, itemsWithUrls - itemsWithCovers),
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
    if (debugDom) {
      const diagnostics = await collectDomDiagnostics(page, collectionUrl, groups);
      diagnostics.collectionTitle = collectionTitle || "";
      diagnostics.exportSummary = output.summary;
      const ext = path.extname(outPath);
      const base = ext ? outPath.slice(0, -ext.length) : outPath;
      const debugOut = `${base}.debug.json`;
      await fs.writeFile(debugOut, `${JSON.stringify(diagnostics, null, 2)}\n`, "utf8");
      console.log(`[dcui-export] Debug DOM output: ${debugOut}`);
    }

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

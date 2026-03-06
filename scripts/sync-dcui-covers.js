#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const listPath = path.join(repoRoot, "list.js");

function loadList() {
  global.window = {};
  delete require.cache[require.resolve(listPath)];
  require(listPath);
  const list = global.window && global.window.BATMAN_GUIDE_LIST;
  if (!Array.isArray(list)) throw new Error("window.BATMAN_GUIDE_LIST missing or invalid");
  return list;
}

function isDcuiUrl(url) {
  return /dcuniverseinfinite\.com/i.test(String(url || ""));
}

function normalizeCoverUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (!/^https?:\/\//i.test(value)) return "";
  return value;
}

function getUrlCandidates(entry) {
  const base = String(entry.url || "").trim();
  if (!base) return [];
  const out = [base];
  if (/\/comics\//.test(base) && !/\/c(?:[/?#]|$)/.test(base)) {
    out.push(`${base.replace(/\/$/, "")}/c`);
  }
  return [...new Set(out)];
}

function extractCoverFromHtml(html) {
  if (!html) return "";
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i
  ];

  for (const re of patterns) {
    const m = html.match(re);
    const url = normalizeCoverUrl(m && m[1]);
    if (url) return url;
  }

  const imgix = html.match(/https:\/\/imgix-media\.wbdndc\.net\/[^"'<>\s]+/i);
  return normalizeCoverUrl(imgix && imgix[0]);
}

function normalizeDcuiContentUrl(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";

  const unescaped = raw
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/")
    .replace(/^https?:\/\\/i, (m) => m.replace(/\\/g, ""));

  const absolute = unescaped.startsWith("/")
    ? `https://www.dcuniverseinfinite.com${unescaped}`
    : unescaped;

  if (!/^https?:\/\/www\.dcuniverseinfinite\.com\//i.test(absolute)) return "";

  try {
    const parsed = new URL(absolute);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function extractFirstIssueUrlFromCollectionHtml(html) {
  if (!html) return "";

  const content = String(html)
    .replace(/&amp;/gi, "&")
    .replace(/\\u002F/gi, "/")
    .replace(/\\\//g, "/");

  const patterns = [
    /https?:\/\/www\.dcuniverseinfinite\.com\/comics\/(?:book|issue)\/[^"'<>\s)\\]+/gi,
    /\/(?:comics\/(?:book|issue)\/[^"'<>\s)\\]+)/gi
  ];

  for (const re of patterns) {
    for (const match of content.matchAll(re)) {
      const candidate = normalizeDcuiContentUrl(match[0]);
      if (candidate) return candidate;
    }
  }

  return "";
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9"
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

function writeList(list) {
  const payload = `/* Batman Guide reading list (outsourced data) */\nwindow.BATMAN_GUIDE_LIST = ${JSON.stringify(list)};\n`;
  fs.writeFileSync(listPath, payload, "utf8");
}

async function resolveEntryCover(entry) {
  const isCollectionOrEvent = /^(collection|event)$/i.test(String(entry.type || ""));

  for (const url of getUrlCandidates(entry)) {
    try {
      const html = await fetchHtml(url);
      const cover = extractCoverFromHtml(html);
      if (cover) return cover;

      if (isCollectionOrEvent) {
        const firstIssueUrl = extractFirstIssueUrlFromCollectionHtml(html);
        if (firstIssueUrl) {
          const firstIssueHtml = await fetchHtml(firstIssueUrl);
          const firstIssueCover = extractCoverFromHtml(firstIssueHtml);
          if (firstIssueCover) return firstIssueCover;
        }
      }
    } catch (error) {
      const reason = error && error.message ? error.message : String(error);
      console.warn(`[cover-sync] WARN ${entry.id || "?"}: fetch failed for ${url} (${reason})`);
      // continue with next URL candidate
    }
  }
  return "";
}

async function main() {
  const refreshAll = process.argv.includes("--refresh");
  const list = loadList();

  let updated = 0;
  let checked = 0;

  for (const entry of list) {
    if (!isDcuiUrl(entry.url)) continue;
    if (!refreshAll && normalizeCoverUrl(entry.cover)) continue;

    checked += 1;
    const cover = await resolveEntryCover(entry);
    if (cover && cover !== entry.cover) {
      entry.cover = cover;
      updated += 1;
      console.log(`[cover-sync] ${entry.id}: ${cover}`);
    } else if (!cover) {
      console.warn(`[cover-sync] WARN ${entry.id}: no cover found`);
    }
  }

  if (updated > 0) {
    writeList(list);
  }

  console.log(`[cover-sync] done (checked=${checked}, updated=${updated})`);
}

main().catch((error) => {
  console.error(`[cover-sync] FAILED: ${error && error.message ? error.message : error}`);
  process.exit(1);
});

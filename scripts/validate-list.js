#!/usr/bin/env node
"use strict";

const path = require("path");

const listPath = path.resolve(__dirname, "..", "list.js");

function fail(message) {
  console.error(`[list-validate] FAILED: ${message}`);
  process.exit(1);
}

try {
  global.window = {};
  require(listPath);
} catch (error) {
  fail(`Could not load list.js: ${error && error.message ? error.message : error}`);
}

const list = global.window && global.window.BATMAN_GUIDE_LIST;
if (!Array.isArray(list)) {
  fail("window.BATMAN_GUIDE_LIST is missing or not an array");
}

if (list.length < 20) {
  fail(`Expected at least 20 entries, got ${list.length}`);
}

const allowedTypes = new Set(["book", "series", "collection"]);
const allowedImportance = new Set(["core", "recommended", "context", "optional"]);
const allowedReadingModes = new Set(["read_all", "selected_issues", "checkpoint", "context"]);
const allowedContinuity = new Set([
  "golden-age",
  "pre-crisis",
  "post-crisis",
  "new-52",
  "rebirth",
  "infinite-frontier",
  "elseworld",
  "black-label"
]);
const allowedDcuiStatus = new Set(["direct", "collection", "search_fallback", "missing"]);
const ids = new Set();
const seenOrders = new Set();
const seenUrls = new Map();
let previousOrder = null;
const warnings = [];
let missingOrderCount = 0;
let legacyOptionalCount = 0;
const INTENTIONAL_DUPLICATE_URL_GROUPS = new Map([
  [
    "https://www.dcuniverseinfinite.com/collections/edt-tomkings-batman",
    new Set(["E6-00", "E6-03", "E6-04", "E6-05", "E6-07", "E6-08", "E6-09", "E6-10", "E6-11", "E6-12"])
  ],
  [
    "https://www.dcuniverseinfinite.com/comics/series/detective-comics-2016-/2a8f64e9-9f8f-47f4-a6d1-e6f14a3cd59a",
    new Set(["E6-13", "E7-29"])
  ]
]);

function parseOrderFromId(id) {
  const match = /^E(\d+)-(\d+)([A-Z]*)$/.exec(id);
  if (!match) return null;
  return {
    era: Number(match[1]),
    number: Number(match[2]),
    suffix: match[3] || ""
  };
}

function compareOrder(a, b) {
  if (a.era !== b.era) return a.era - b.era;
  if (a.within !== b.within) return a.within - b.within;
  return String(a.id || "").localeCompare(String(b.id || ""));
}

function suffixRank(suffix) {
  let rank = 0;
  for (let i = 0; i < suffix.length; i += 1) {
    rank = (rank * 26) + (suffix.charCodeAt(i) - 64);
  }
  return rank;
}

function idBasedSortToken(item) {
  const parsed = parseOrderFromId(item.id);
  if (!parsed) return null;
  return {
    id: item.id,
    era: parsed.era,
    within: (parsed.number * 100) + suffixRank(parsed.suffix)
  };
}

function explicitOrderToken(item) {
  if (typeof item.order === "undefined") return null;
  if (typeof item.order !== "number" || !Number.isInteger(item.order) || item.order < 1000) {
    fail(`entry '${item.id}' has invalid 'order' (must be integer >= 1000)`);
  }
  return {
    id: item.id,
    era: Math.floor(item.order / 1000),
    within: item.order % 1000
  };
}


function validateTypeUrlConsistency(item, at) {
  const url = item.url;
  if (item.type === "collection" && !/\/collections\//.test(url)) {
    fail(`${at} is marked as 'collection' but url is not a DCUI collection link`);
  }
  if (item.type === "book" && !/\/comics\/book\//.test(url)) {
    fail(`${at} is marked as 'book' but url is not a DCUI book link`);
  }
  if (item.type === "series" && !/\/comics\/series\//.test(url)) {
    fail(`${at} is marked as 'series' but url is not a DCUI series link`);
  }
}

function isPlaceholderUrl(url) {
  const value = String(url || "").trim().toLowerCase();
  if (!value) return true;
  return value === "tbd" || value === "missing" || value === "n/a" || value === "about:blank";
}

list.forEach((item, index) => {
  const at = `entry #${index + 1}`;
  if (!item || typeof item !== "object") fail(`${at} is not an object`);

  const requiredStringFields = ["id", "era", "type", "title", "url"];
  for (const field of requiredStringFields) {
    if (typeof item[field] !== "string" || item[field].trim() === "") {
      fail(`${at} has invalid '${field}'`);
    }
  }

  if (!/^E\d+-[0-9A-Z]+$/.test(item.id)) {
    fail(`${at} has invalid id format '${item.id}'`);
  }

  const idOrder = parseOrderFromId(item.id);
  if (!idOrder) {
    fail(`${at} has unparseable order id '${item.id}'`);
  }

  if (!item.era.startsWith(`Era ${idOrder.era} `)) {
    fail(`${at} has mismatching era label '${item.era}' for id '${item.id}'`);
  }

  const explicitOrder = explicitOrderToken(item);
  if (!explicitOrder) missingOrderCount += 1;
  if (explicitOrder && explicitOrder.era !== idOrder.era) {
    fail(`${at} has mismatching explicit order '${item.order}' for id '${item.id}'`);
  }
  if (explicitOrder) {
    if (seenOrders.has(item.order)) fail(`${at} has duplicate explicit 'order' value '${item.order}'`);
    seenOrders.add(item.order);
  }

  const order = explicitOrder || idBasedSortToken(item);
  if (previousOrder && compareOrder(order, previousOrder) < 0) {
    fail(`${at} is out of reading order ('${item.id}' appears after a later id)`);
  }
  previousOrder = order;

  if (ids.has(item.id)) {
    fail(`${at} has duplicate id '${item.id}'`);
  }
  ids.add(item.id);

  if (!allowedTypes.has(item.type)) {
    fail(`${at} has unsupported type '${item.type}'`);
  }

  validateTypeUrlConsistency(item, at);

  if (typeof item.importance !== "string" || !allowedImportance.has(item.importance)) {
    fail(`${at} has invalid 'importance' (expected one of: ${[...allowedImportance].join(", ")})`);
  }
  if (typeof item.optional !== "undefined" && typeof item.optional !== "boolean") {
    fail(`${at} has non-boolean 'optional'`);
  }
  if (typeof item.optional !== "undefined") {
    legacyOptionalCount += 1;
    if (item.optional !== (item.importance === "optional")) {
      fail(`${at} has contradictory optional/importance values`);
    }
  }

  if (typeof item.readingMode !== "string" || !allowedReadingModes.has(item.readingMode)) {
    fail(`${at} has invalid 'readingMode' (expected one of: ${[...allowedReadingModes].join(", ")})`);
  }

  if (typeof item.continuity !== "string" || !allowedContinuity.has(item.continuity)) {
    fail(`${at} has invalid 'continuity' (expected one of: ${[...allowedContinuity].join(", ")})`);
  }

  if (typeof item.dcuiStatus !== "string" || !allowedDcuiStatus.has(item.dcuiStatus)) {
    fail(`${at} has invalid 'dcuiStatus' (expected one of: ${[...allowedDcuiStatus].join(", ")})`);
  }
  if (item.dcuiStatus === "search_fallback") {
    warnings.push(`${at} uses DCUI search fallback link`);
  }
  if (typeof item.dcuiChecked !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(item.dcuiChecked)) {
    fail(`${at} has invalid 'dcuiChecked' (expected YYYY-MM-DD)`);
  } else {
    const checkedAt = Date.parse(`${item.dcuiChecked}T00:00:00Z`);
    const staleThresholdMs = 90 * 24 * 60 * 60 * 1000;
    if (Number.isFinite(checkedAt) && (Date.now() - checkedAt) > staleThresholdMs) {
      warnings.push(`${at} has stale dcuiChecked date (${item.dcuiChecked})`);
    }
  }

  if (typeof item.placementNote === "undefined") {
    warnings.push(`${at} has no placementNote`);
  }

  if (!/^https?:\/\//.test(item.url)) {
    fail(`${at} has invalid url '${item.url}'`);
  }

  const normalizedTopLevelUrl = item.url.trim().toLowerCase();
  const isCollectionUrl = normalizedTopLevelUrl.includes("/collections/");
  const isSearchUrl = normalizedTopLevelUrl.includes("/search");
  if (isCollectionUrl && item.dcuiStatus !== "collection") {
    warnings.push(`${at} has collection URL but dcuiStatus='${item.dcuiStatus}'`);
  }
  if (isSearchUrl && item.dcuiStatus !== "search_fallback") {
    warnings.push(`${at} has search URL but dcuiStatus='${item.dcuiStatus}'`);
  }
  if (item.dcuiStatus === "missing" && !isPlaceholderUrl(item.url)) {
    warnings.push(`${at} uses dcuiStatus='missing' but has a real URL`);
  }
  if (item.dcuiStatus !== "missing" && isPlaceholderUrl(item.url)) {
    warnings.push(`${at} has placeholder URL but dcuiStatus='${item.dcuiStatus}'`);
  }

  const normalizedUrl = item.url.trim();
  if (normalizedUrl) {
    const duplicates = seenUrls.get(normalizedUrl) || [];
    duplicates.push(item.id);
    seenUrls.set(normalizedUrl, duplicates);
  }

  if (typeof item.cover !== "undefined") {
    if (typeof item.cover !== "string" || item.cover.trim() === "") {
      fail(`${at} has invalid optional 'cover'`);
    }
    if (!/^https?:\/\//.test(item.cover)) {
      fail(`${at} has invalid cover url '${item.cover}'`);
    }
  }

  if (typeof item.issues !== "undefined") {
    if (!Array.isArray(item.issues)) {
      fail(`${at} has non-array 'issues'`);
    }
    item.issues.forEach((issue, issueIndex) => {
      const issueAt = `${at} issue #${issueIndex + 1}`;
      if (!issue || typeof issue !== "object") fail(`${issueAt} is not an object`);
      if (typeof issue.title !== "string" || issue.title.trim() === "") {
        fail(`${issueAt} has invalid 'title'`);
      }
      if (typeof issue.url !== "undefined") {
        if (typeof issue.url !== "string" || !/^https?:\/\//.test(issue.url)) {
          fail(`${issueAt} has invalid optional 'url'`);
        }
      }
    });
  }

  const issueCount = Array.isArray(item.issues) ? item.issues.length : 0;
  if (item.readingMode === "selected_issues" && issueCount === 0) {
    fail(`${at} has readingMode='selected_issues' but no issues[]`);
  }
  if (item.readingMode === "checkpoint" && issueCount > 0) {
    warnings.push(`${at} is a checkpoint but also defines issues[]`);
  }
  if (item.readingMode === "read_all" && item.type === "collection" && issueCount === 0) {
    warnings.push(`${at} is read_all collection without issues[] detail`);
  }

  if (item.type === "collection" && !Array.isArray(item.issues)) {
    warnings.push(`${at} is collection without issues[] details`);
  }
});

for (const [url, duplicateIds] of seenUrls.entries()) {
  if (duplicateIds.length <= 1) continue;
  const expectedIds = INTENTIONAL_DUPLICATE_URL_GROUPS.get(url);
  if (!expectedIds) {
    fail(`unexpected duplicate top-level URL used by ids: ${duplicateIds.join(", ")} (${url})`);
  }

  const actualIds = new Set(duplicateIds);
  const expectedMatches = actualIds.size === expectedIds.size
    && [...actualIds].every((id) => expectedIds.has(id));
  if (!expectedMatches) {
    fail(`duplicate URL mapping drift for ${url}; expected ids [${[...expectedIds].join(", ")}], got [${duplicateIds.join(", ")}]`);
  }

  warnings.push(`intentional shared top-level URL used by ids: ${duplicateIds.join(", ")} (${url})`);
}

for (const warning of warnings) {
  console.warn(`[list-validate] WARN: ${warning}`);
}
if (missingOrderCount > 0) {
  console.warn(`[list-validate] WARN: ${missingOrderCount} entries have no explicit 'order' yet (legacy ID order fallback active)`);
}
if (legacyOptionalCount > 0) {
  console.warn(`[list-validate] WARN: ${legacyOptionalCount} entries still define legacy 'optional' (prefer only importance)`);
}

console.log(`[list-validate] ok (${list.length} entries)`);

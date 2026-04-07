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
const ids = new Set();
const seenUrls = new Map();
let previousOrder = null;
const warnings = [];
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
  if (a.number !== b.number) return a.number - b.number;
  return a.suffix.localeCompare(b.suffix);
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

  const order = parseOrderFromId(item.id);
  if (!order) {
    fail(`${at} has unparseable order id '${item.id}'`);
  }

  if (!item.era.startsWith(`Era ${order.era} `)) {
    fail(`${at} has mismatching era label '${item.era}' for id '${item.id}'`);
  }

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

  if (typeof item.optional !== "boolean") {
    fail(`${at} has non-boolean 'optional'`);
  }

  if (!/^https?:\/\//.test(item.url)) {
    fail(`${at} has invalid url '${item.url}'`);
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

console.log(`[list-validate] ok (${list.length} entries)`);

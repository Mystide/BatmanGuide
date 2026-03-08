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
let previousOrder = null;

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

  if (typeof item.cover !== "undefined") {
    if (typeof item.cover !== "string" || item.cover.trim() === "") {
      fail(`${at} has invalid optional 'cover'`);
    }
    if (!/^https?:\/\//.test(item.cover)) {
      fail(`${at} has invalid cover url '${item.cover}'`);
    }
  }
});

console.log(`[list-validate] ok (${list.length} entries)`);

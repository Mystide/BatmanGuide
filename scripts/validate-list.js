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

  if (ids.has(item.id)) {
    fail(`${at} has duplicate id '${item.id}'`);
  }
  ids.add(item.id);

  if (!allowedTypes.has(item.type)) {
    fail(`${at} has unsupported type '${item.type}'`);
  }

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

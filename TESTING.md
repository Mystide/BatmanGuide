# Testing & CI Matrix

This project uses a small set of local commands plus two CI workflows. Use this as the quick reference for what to run and what failures mean.

## Local commands

- `npm run validate-list`
  - Runs schema and data quality validation for `list.js`.
  - Catches issues like missing required fields, invalid IDs/order values, duplicate IDs, and malformed URLs/types.

- `npm run validate-list:strict`
  - Runs the same validator in strict mode (`--require-order`).
  - Also fails if explicit ordering rules are violated (the CI-required list order check).

- `npm run smoke`
  - Runs `scripts/smoke-check.sh`.
  - Verifies syntax, key app-shell files/markers, `/BatmanGuide/` serving assumptions, and baseline list integrity checks.

- `npm run smoke:render`
  - Runs the Playwright browser render smoke (`scripts/smoke-render-playwright.mjs`).
  - Checks browser-level behavior: app/list requests, `.era` and `.item` rendering, search (including Hush), continue-reading fallback, core filtering, reload behavior, browser page errors, and perf logging.

- `npm run links`
  - Fast external-link sample check (`--max 30`).
  - Good pre-PR spot check for obvious dead links.

- `npm run links:full`
  - Broader external-link audit (`--include-covers`, concurrency + timeout settings).
  - Better for release prep or deeper link hygiene work.

## GitHub Actions behavior

### Smoke workflow (`.github/workflows/smoke.yml`)
- Triggers on:
  - `pull_request`
  - `push` to `main`
- Required checks in this workflow:
  - `npm run validate-list:strict`
  - `bash ./scripts/smoke-check.sh`
- Push-only step (for now):
  - `npm run smoke:render` runs only on `push`.
  - Reason: Playwright render coverage is valuable but historically flaky on `pull_request`; it is intentionally limited to push until stability is consistently proven.

### Nightly link check (`.github/workflows/link-check-nightly.yml`)
- Triggers on:
  - Nightly cron schedule
  - Manual run (`workflow_dispatch`)
- Runs full external link audit with covers and emits `link-check-report.json`.
- Uploads artifact:
  - Artifact name: `link-check-report`
  - Expected content: `link-check-report.json`
- Why link results can be flaky:
  - Third-party rate limits, transient outages, redirects/CDN edge behavior, and occasional bot protection challenges can cause intermittent failures even when project code is unchanged.

## Failure guidance

- Validation failure (`validate-list`):
  - Fix data shape/content errors in the list entries (missing fields, bad IDs/types/URLs, duplicates).

- Strict order failure (`validate-list:strict`):
  - Adjust explicit list ordering metadata to satisfy required order rules.

- Render smoke failure (`smoke:render`):
  - Re-run locally first; inspect Playwright failure details.
  - Common causes: browser dependency setup, timing regressions, or DOM/render behavior changes.

- External link failure (`links` / nightly link check):
  - Re-run to rule out transient network/host issues.
  - If persistent, update or replace stale URLs; use nightly artifact report to identify failing targets.

- Browser page error (from render smoke):
  - Treat as a real regression signal unless proven environmental.
  - Investigate runtime exceptions shown in render smoke output before merging.

## Before merging changes

- Run `npm run validate-list:strict`.
- Run `npm run smoke`.
- If your change can affect rendering/interaction, run `npm run smoke:render`.
- If your change touches many URLs or link fields, run `npm run links` (and optionally `npm run links:full`).

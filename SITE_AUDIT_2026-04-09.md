# Batman Guide – Site Audit (2026-04-09)

## Scope
- Reviewed app shell and layout (`index.html`), application logic (`app.js`), service worker (`sw.js`), manifest, and existing validation scripts.
- Executed available checks (`./scripts/smoke-check.sh`, sampled `node ./scripts/check-links.js --max 20`).

## Executive summary
The app already has a solid baseline (good UI structure, local progress state, PWA basics, and schema validation).
Highest-impact improvements are in **accessibility hardening**, **security/CSP compatibility**, **performance hygiene**, and **operational robustness for external links/covers**.

---

## Prioritized improvement opportunities

## P0 (high priority)

1. Remove inline event handler generated in JS (`onerror="..."`) to enable stricter CSP and improve maintainability.
   - Why: inline JS blocks strict `Content-Security-Policy` (`script-src 'self'` without `'unsafe-inline'`) and is harder to test.
   - Evidence: era symbol markup currently injects an inline `onerror` handler in `app.js`.

2. Add explicit accessibility label semantics for quick-search input (and verify all interactive controls have deterministic labels).
   - Why: placeholder text is not a robust accessible name; adding explicit `for`/`id` mapping improves SR compatibility and consistency.
   - Evidence: quick-search input is wrapped in a label, but this pattern should be normalized and validated for all fields.

3. Add basic SEO/share metadata (`meta description`, Open Graph/Twitter cards).
   - Why: currently title exists, but snippet/sharing quality is limited.
   - Evidence: head currently has charset/viewport/theme-color/title/manifest/favicon, but no description or social metadata.

## P1 (medium priority)

4. Reduce heavy `innerHTML` usage where not necessary, especially for repeated card rendering paths.
   - Why: easier to reason about XSS safety and improves maintainability by using `textContent` and DOM APIs consistently.
   - Evidence: multiple render paths build HTML strings (summary, item heads, progress blocks, etc.).

5. Add resource-loading optimizations for core assets.
   - Why: page has a large inline style and multiple large images; preload hints and tighter image sizing strategy can improve first render.
   - Candidates:
     - Preload critical wordmark/logo if consistently above the fold.
     - Evaluate splitting CSS into file for better browser caching across updates.

6. Strengthen offline behavior documentation + strategy for dynamic remote covers.
   - Why: service worker caches same-origin shell well, but remote cover/link behavior depends on network and CORS.
   - Suggestion: define expected offline UX for missing covers and show deterministic fallback states/messages.

## P2 (nice to have)

7. Add automated accessibility and Lighthouse checks in CI.
   - Why: prevent regressions in contrast, labels, and performance.
   - Suggested tooling: `pa11y-ci`/`axe-core` + Lighthouse CI.

8. Add a small i18n strategy (if German users are primary).
   - Why: app language is English (`lang="en"`), while usage context may be German.
   - Suggestion: at least externalize static labels into a translation map.

9. Operational monitoring for data freshness and link quality.
   - Why: many external DCUI endpoints can fail transiently.
   - Suggestion: nightly link checker with artifact report + allowlist for temporary known failures.

---

## Concrete next sprint proposal (small, low risk)
1. CSP-safe refactor: replace inline `onerror` image handler with delegated JS listener.
2. Add `meta description` + OG/Twitter tags.
3. Replace highest-frequency `innerHTML` fragments in card header/progress with DOM-node creation.
4. Add CI job for automated a11y smoke on homepage.

Estimated effort: 0.5–1.5 days.

---

## Checks run during audit
- `./scripts/smoke-check.sh` ✅ passed.
- `node ./scripts/check-links.js --max 20 --timeout-ms 12000` ⚠️ failed due to environment network route errors (`ENETUNREACH`) to `dcuniverseinfinite.com`; not necessarily invalid URLs.

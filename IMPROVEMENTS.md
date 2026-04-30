# Verbesserungen & Roadmap

Stand: 2026-04-30

## P0 – Stable foundation / done

- [x] SEO/Sharing-Basics sind produktiv (`meta description`, Open Graph, Twitter Card inkl. absolute Produktions-URLs).
- [x] Smoke-GitHub-Action für `push` + `pull_request` ist aktiv (`scripts/smoke-check.sh`).
- [x] `APP_VERSION` ist zwischen `app.js` und `sw.js` synchronisiert und wird im Smoke-Check verifiziert.
- [x] Standard-`package.json`-Scripts vorhanden (`validate-list`, `smoke`, `smoke:render`, `links`, `links:full`).
- [x] Nightly-Link-Check läuft per Workflow und lädt den JSON-Report als Artefakt hoch.
- [x] Link-Checker nutzt robustes HEAD→GET-Fallback bei blockierten HEAD-Requests.
- [x] Continue Reading ist implementiert inkl. Fallback: wenn Filter alles ausblenden, werden Filter zurückgesetzt, Ziel angezeigt und fokussiert/highlighted.
- [x] Continue-Reading-Fallback ist im Playwright-Render-Smoke abgedeckt.
- [x] `DATA_SCHEMA.md` existiert als Feld-/Werte-Referenz.

## P1 – Current next steps

- [ ] Playwright-Render-Smoke weiter stabilisieren und Kriterien für Reaktivierung auf `pull_request` festlegen (derzeit absichtlich nur auf `push`).
- [ ] Zuverlässigen Status-Interaktionstest ergänzen (explizit als Ersatz für den früheren flaky Status-Cycle-Test).
- [ ] PWA-Update-Hinweis für Nutzer finalisieren (sichtbare Update-Benachrichtigung/Reload-Flow).

## P2 – Data quality

- [ ] `placementNote`-Abdeckung systematisch erhöhen (Warnungen schrittweise abbauen).
- [ ] `issues[]` bei Collection-Einträgen vervollständigen/konsistent halten.
- [x] Striktere Listenvalidierung (`validate-list --require-order`) ist verbindlich im Smoke-CI verdrahtet (`npm run validate-list:strict`).
- [ ] Legacy-Feld `optional` aus `list.js` bereinigen, sodass nur `importance` maßgeblich bleibt (verify/finish).

## P3 – UI/UX

- [ ] Metadaten-Chips in Karten lesbarer/präsenter machen (ohne Informationsverlust).
- [ ] `placementNote` optional in der UI sichtbar machen („Warum hier?“).
- [ ] Minimalistisches SVG-Asset-System für UI-Elemente evaluieren/einführen (falls sinnvoll gegenüber aktuellen PNG/Font-Assets).

## P4 – CI/testing

- [ ] A11y-Smoke-Checks ergänzen (z. B. axe/pa11y, mindestens für Kernansicht + Filterdialog).
- [ ] Klaren Test-Matrix-Plan dokumentieren: was läuft auf PR vs. nur auf Push/Nightly und warum.

## P5 – Technical cleanup

- [ ] `REAL_COVERS` schrittweise aus `app.js` nach datengetriebener Quelle (`list.js`) migrieren; `app.js` nur noch als Legacy-Fallback.
- [ ] `innerHTML`-Hotspots gezielt auf DOM-API migrieren (priorisiert nach XSS-/Wartungsrisiko).
- [ ] Offline-/Fehlerzustände im UI klarer kommunizieren (z. B. bei fehlendem Netz, Sync-Fehlern, leeren Ergebnissen).

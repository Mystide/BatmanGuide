# Verbesserungen & Roadmap

Stand: 2026-05-03

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
- [x] PWA-Update-Hinweis inkl. sichtbarer Update-Benachrichtigung und Reload-Flow ist umgesetzt.

## P2 – Data quality

- [ ] Reihenfolge-Qualität primär über `order` pflegen; `placementNote` nur für seltene Sonderfälle nutzen.
- [ ] `issues[]` bei Collection-Einträgen vervollständigen/konsistent halten.
- [x] Striktere Listenvalidierung (`validate-list --require-order`) ist verbindlich im Smoke-CI verdrahtet (`npm run validate-list:strict`).
- [x] Legacy-Feld `optional` aus `list.js` bereinigen, sodass nur `importance` maßgeblich bleibt (verify/finish).

## P3 – UI/UX

- [ ] Metadaten-Chips in Karten lesbarer/präsenter machen (ohne Informationsverlust).
- [ ] `placementNote` optional in der UI sichtbar machen („Warum hier?“).
- [ ] Minimalistisches SVG-Asset-System für UI-Elemente evaluieren/einführen (falls sinnvoll gegenüber aktuellen PNG/Font-Assets).

## P4 – CI/testing

- [ ] A11y-Smoke-Checks ergänzen (z. B. axe/pa11y, mindestens für Kernansicht + Filterdialog).
- [x] Test-/CI-Matrix ist in `TESTING.md` dokumentiert (lokale Commands, PR-vs-Push inkl. Push-only Playwright, Nightly Link-Check, Failure-Guidance).

## P5 – Technical cleanup

- [x] Legacy-Coverdaten (`REAL_COVERS`) aus `app.js` in `covers.js` ausgelagert; `app.js` liest `window.BATMAN_GUIDE_COVERS` defensiv als Fallback.
- [ ] Optional/Future: Coverdaten perspektivisch in `list.js` integrieren (nur falls Datenmodell/Ownership klar vereinheitlicht werden soll).
- [ ] `innerHTML`-Hotspots gezielt auf DOM-API migrieren (priorisiert nach XSS-/Wartungsrisiko).
- [ ] Offline-/Fehlerzustände im UI klarer kommunizieren (z. B. bei fehlendem Netz, Sync-Fehlern, leeren Ergebnissen).

# Verbesserungen & Roadmap

## P0 – Sofort

- [x] SEO/Sharing-Basics ergänzt (`meta description`, Open Graph, Twitter Card)
- [x] Smoke-Check als GitHub Action für Push/PR aktiv
- [ ] App-Version + Service-Worker-Cache bei jedem relevanten Release synchron mitziehen
- [x] `package.json`-Scripts als Standard-Workflow etabliert
- [ ] Social-Preview testen (inkl. OG-Image als absolute URL prüfen)

## P1 – Datenqualität

- [ ] `placementNote` für alle diskutierbaren Einträge pflegen
- [ ] `dcuiStatus` semantisch gegen URL-Typ validieren (direct/collection/search_fallback)
- [ ] `dcuiChecked` auf Alter prüfen (Warnung bei veraltetem Check)
- [ ] `issues[]` für Collections konsistent vervollständigen
- [x] `DATA_SCHEMA.md` erstellt (Felder + erlaubte Werte dokumentiert)

## P2 – UI/UX

- [ ] Filter für `importance`, `continuity`, `readingMode`, `dcuiStatus` weiter ausbauen/feintunen
- [ ] Metadaten-Chips in Karten prominenter darstellen
- [ ] Compact-Listenmodus (Grid/Compact-Toggle)
- [ ] `placementNote` in der UI sichtbar machen ("Warum hier?")
- [ ] Continue-Reading: „Nächster sinnvoller Eintrag“ priorisiert statt nur Zufall

## Operativ/CI

- [x] Nightly-Link-Check vorhanden
- [x] Nightly-Link-Check mit Report-Artefakt archiviert
- [ ] A11y-Smoke-Checks (z. B. axe/pa11y) ergänzen
- [x] Link-Check toleranter gemacht (HEAD → GET Fallback bei 403/405/ERR)

## Laufende technische Pflege

- [ ] `innerHTML`-Hotspots schrittweise auf DOM-API migrieren
- [ ] Offline-UX/Fallback-Zustände klarer kommunizieren
- [ ] Cover-Daten langfristig aus `app.js` nach `list.js` migrieren (`REAL_COVERS` nur Legacy-Fallback)

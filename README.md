# Batman Guide

Kleine Web-App, um Batman-Comics/Stories als Leseliste zu verwalten.

## Solo-Workflow (empfohlen)

Da du alleine am Projekt arbeitest, reicht ein sehr schlanker Ablauf:

1. Änderungen machen (`index.html`, `app.js`, `list.js` usw.).
2. Vor dem Push einmal lokal prüfen:
   ```bash
   ./scripts/smoke-check.sh
   ```
   (inkl. Listen-Schema-Validierung via `scripts/validate-list.js`)
3. Commit + Push.

Damit bekommst du schnell Rückmeldung, ohne unnötigen Prozess-Overhead.

## Wenn du **nur mit GitHub** arbeiten willst

Du musst die lokalen Skripte **nicht** ausführen.

1. Repository auf GitHub öffnen.
2. Änderungen direkt im Browser machen (Datei öffnen → **Edit**).
3. Unten auf **Commit changes** klicken.
4. Falls nötig: **Create pull request** und mergen.

Das reicht für normale Inhaltsänderungen völlig aus.

## Optional: Backup-Routine für Inhaltsdaten

Für Solo-Projekte ist ein kleiner Backup-Rhythmus oft hilfreicher als komplexe Merge-Regeln:

- Regelmäßig eine Kopie von `list.js` sichern (z. B. als Datums-Datei).
- Vor größeren Inhaltsänderungen einen separaten Commit machen.

## NPM-Skripte (pflegeleicht)

Es gibt jetzt einen einfachen Script-Workflow:

```bash
npm run validate-list
npm run smoke
npm run links
npm run links:full
```

`links:full` prüft zusätzlich Cover-URLs und nutzt konservative Timeouts/Concurrency.

## Optional: Broken-Link-Check (URL-Qualität)

Wenn du nach größeren Listen-Änderungen prüfen willst, ob die hinterlegten Links erreichbar sind:

```bash
node ./scripts/check-links.js
```

Nützliche Optionen:

- `--max 30` → prüft nur die ersten 30 Links (schneller Spot-Check)
- `--concurrency 4` → weniger parallele Requests
- `--timeout-ms 15000` → längeres Timeout bei langsamen Hosts
- `--include-covers` → prüft zusätzlich vorhandene `cover`-URLs

## Optional (nur wenn du Konflikte hast)

Die Merge-Helfer sind weiter verfügbar, aber im Solo-Setup meist selten nötig:

- `MERGE_POLICY.md`
- `./scripts/setup-merge-driver.sh`
- `./scripts/resolve-known-conflicts.sh`


## Cover-Workflow (DCUI, zuverlässig)

Wenn neue Comics ergänzt werden, sollten Cover **nicht geraten** werden.
Nutze stattdessen den Sync gegen die DCUI-Seiten-Metadaten (`og:image`):

```bash
node ./scripts/sync-dcui-covers.js
```

Optional alles neu auflösen (auch vorhandene `cover`-Felder):

```bash
node ./scripts/sync-dcui-covers.js --refresh
```

Danach wie gewohnt prüfen:

```bash
./scripts/smoke-check.sh
```

Wenn GitHub-Gist-Sync aktiviert ist, werden manuelle Cover-Links zusätzlich in einer
separaten Datei im Gist gespeichert (`batmanguide_covers.json`). Dadurch bleiben
sie auf GitHub verfügbar und können nach lokalem Datenverlust wieder eingespielt werden.

### Troubleshooting Cover-Sync

- Wenn im Log `ENETUNREACH`, `ETIMEDOUT` oder ähnliche Netzwerkfehler stehen,
  kann die Umgebung DCUI temporär nicht erreichen (Routing/DNS/Firewall).
- Das Sync-Script bevorzugt bereits IPv4 (`ipv4first`), um typische IPv6-
  Routingprobleme zu reduzieren.
- In so einem Fall kannst du `cover` pro Eintrag manuell setzen, wenn du die
  offizielle `imgix-media.wbdndc.net`-URL von der DCUI-Seite hast.

## Mehr Details

- Tests: `TESTING.md`
- Konfliktregeln: `MERGE_POLICY.md`
- Datenschema: `DATA_SCHEMA.md`

## Weitere Verbesserungen (Ideen/Fixes)

- **Export/Import für Lesefortschritt** (JSON-Datei), damit der Fortschritt unabhängig von Browser-Storage gesichert ist.
- **Nightly-CI-Job für Link-Checks** aktiv, damit externe Ausfälle früh sichtbar werden (`.github/workflows/link-check-nightly.yml`).
- **Datenpflege-Workflow**: kleine `npm run`-Kommandos für `format-list`, `validate-list`, `smoke`.
- **UX**: „Zuletzt gelesen“-Filter/Shortcut, um schneller wieder einzusteigen.
- **Performance**: Lazy Rendering für sehr große Listen (falls die Liste weiter wächst).


## Migrations-Checkliste: `order` + erweiterte `issues` (minimal risk)

Empfohlene Reihenfolge, um die Datenstruktur zu verbessern ohne bestehende IDs/Links zu brechen:

1. **Schema erweitern (rückwärtskompatibel)**
   - In `list.js` pro Eintrag optionales Feld `order` zulassen.
   - Bestehende `id`-Werte unverändert lassen (stabile technische Referenz).

2. **Sortierung umstellen (mit Fallback)**
   - Primär nach `order` sortieren.
   - Wenn `order` fehlt: auf bisherige ID-Logik zurückfallen.
   - Ergebnis: Alte Daten funktionieren weiter, neue Einträge sind sauber einfügbar.

3. **Validator schrittweise härten**
   - Phase A: `order` optional validieren (Typ, Eindeutigkeit, Monotonie innerhalb einer Ära).
   - Phase B: Warnung ausgeben, wenn `order` fehlt.
   - Phase C (später): `order` verpflichtend machen.

4. **`issues` auf `book` und `series` erweitern**
   - Rendering-/Checklist-Logik in `app.js` so anpassen, dass Unterpunkte nicht nur bei `collection` funktionieren.
   - UI-Verhalten konsistent halten (Count, Häkchen, optional/required).

5. **Cover-Quelle vereinheitlichen**
   - Neue Cover möglichst direkt in `list.js` pflegen.
   - `REAL_COVERS` in `app.js` nur noch als Legacy-Fallback nutzen.
   - Danach schrittweise Migration bestehender Cover-Zuordnungen.

6. **Inhaltliche Pflege separat behandeln**
   - Technische Migration zuerst abschließen.
   - Erst danach größere Content-Erweiterungen (neue Runs/Events), damit Fehlerursachen klar trennbar bleiben.

7. **Abschluss-Checks pro Schritt**
   - `./scripts/smoke-check.sh`
   - optional: `node ./scripts/check-links.js --max 30`

Beispiel-Eintrag:

```js
{
  id: "E4-25",
  order: 4250,
  era: "Era 4 — Post-Crisis (1986–2011)",
  type: "collection",
  title: "Batman: Hush",
  url: "...",
  optional: false,
  track: "main",
  characters: ["batman"],
  hint: "Main continuity placement after Bruce Wayne: Fugitive.",
  issues: []
}
```

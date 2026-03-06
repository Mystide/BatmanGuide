# Batman Guide

Kleine Web-App, um Batman-Comics/Stories als Leseliste zu verwalten.

## Solo-Workflow (empfohlen)

Da du alleine am Projekt arbeitest, reicht ein sehr schlanker Ablauf:

1. Änderungen machen (`index.html`, `app.js`, `list.js` usw.).
2. Vor dem Push einmal lokal prüfen:
   ```bash
   ./scripts/smoke-check.sh
   ```
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

## Optional (nur wenn du Konflikte hast)

Die Merge-Helfer sind weiter verfügbar, aber im Solo-Setup meist selten nötig:

- `MERGE_POLICY.md`
- `./scripts/setup-merge-driver.sh`
- `./scripts/resolve-known-conflicts.sh`

## Mehr Details

- Tests: `TESTING.md`
- Konfliktregeln: `MERGE_POLICY.md`

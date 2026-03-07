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
## Weitere Verbesserungen (Ideen/Fixes)

- **Export/Import für Lesefortschritt** (JSON-Datei), damit der Fortschritt unabhängig von Browser-Storage gesichert ist.
- **Broken-Link-Check** als optionales Script, das alle `url`-Einträge aus `list.js` auf HTTP-Status prüft.
- **Datenpflege-Workflow**: kleine `npm run`-Kommandos für `format-list`, `validate-list`, `smoke`.
- **UX**: „Zuletzt gelesen“-Filter/Shortcut, um schneller wieder einzusteigen.
- **Performance**: Lazy Rendering für sehr große Listen (falls die Liste weiter wächst).

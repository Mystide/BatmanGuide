# Konflikte vermeiden (ohne Programmierwissen)

Damit du **nicht mehr manuell Konflikte entscheiden** musst:

1. Einmal im Repository ausführen:

```bash
./scripts/setup-merge-driver.sh
```

2. Danach werden Konflikte in diesen Dateien automatisch in deinem aktuellen Branch aufgelöst:
   - `index.html`
   - `app.js`

## Wichtig

- Das verhindert Rückfälle auf alte Header-Versionen durch "incoming change".
- Wenn absichtlich neue Änderungen an `index.html`/`app.js` aus einem anderen Branch übernommen werden sollen, muss das bewusst manuell gemacht werden.

# Testing

## Local smoke check

```bash
./scripts/smoke-check.sh
```

This verifies:
- JavaScript syntax (`app.js`, `sw.js`)
- app shell files are served (`index.html`, `app.js`, `list.js`, `sw.js`, `manifest.webmanifest`)
- required startup/cache markers exist
- reading list payload contains a minimum number of entries

## CI

A GitHub Actions workflow runs the same smoke check on push/PR:
- `.github/workflows/smoke.yml`

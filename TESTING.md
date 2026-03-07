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
- list schema/quality checks (`scripts/validate-list.js`: required fields, ID format, duplicates, type/url validity)

## CI

A GitHub Actions workflow runs the same smoke check on push/PR:
- `.github/workflows/smoke.yml`

## Optional quality check: external links

```bash
node ./scripts/check-links.js
```

Useful flags:
- `--max 30` for a quick sample
- `--include-covers` to also validate cover image URLs

# Ideen & Verbesserungen (Roadmap)

## Kurzfristig (High Impact, Low Risk)

1. **Strikte CSP vorbereiten**
   - Inline-Eventhandler (z. B. `onerror`) vollständig entfernen.
   - Ziel: `Content-Security-Policy` ohne `unsafe-inline`.

2. **A11y-Baseline härten**
   - Alle Form-Controls mit expliziten Labels (`for`/`id`) versehen.
   - Fokus-Reihenfolge + Tastatur-Flow einmal systematisch testen.

3. **SEO/Sharing verbessern**
   - `meta description` ergänzen.
   - Open Graph + Twitter Card Metadaten hinzufügen.

## Mittelfristig

4. **Rendering robuster machen**
   - Häufige `innerHTML`-Pfade auf DOM-API (`createElement`, `textContent`) migrieren.
   - Ziel: bessere Wartbarkeit und weniger XSS-Risiko.

5. **Performance für große Listen**
   - Lazy Rendering / Virtualisierung für lange Listen testen.
   - Optional: CSS aus Inline-Block in Datei auslagern (besseres Caching).

6. **Offline-UX klar definieren**
   - Fallback-Zustände für externe Cover/Links (fehlendes Netz, CORS, Timeout).
   - Kurze In-App-Hinweise für Nutzer anzeigen.

## Operativ/Qualität

7. **Automatisierte Qualitätschecks in CI**
   - Nightly Link-Check mit Report-Artefakt.
   - A11y-Smoke-Checks (z. B. axe/pa11y) auf Startseite.

8. **Datenpflege ergonomischer machen**
   - Einheitliche `npm`-Skripte: `format-list`, `validate-list`, `smoke`, `links`.
   - Ziel: schnellere Routine-Checks vor Commits.

## Konkreter Startvorschlag (1 Sprint)

- Sprint-Task 1: CSP-safe Refactor für Image-Fallbacks.
- Sprint-Task 2: SEO-Meta + OG/Twitter hinzufügen.
- Sprint-Task 3: 1-2 zentrale `innerHTML`-Hotspots auf DOM-API umstellen.
- Sprint-Task 4: Einfachen CI-A11y-Check ergänzen.

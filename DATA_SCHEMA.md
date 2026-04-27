# Batman Guide – Daten-Schema (`list.js`)

Diese Datei dokumentiert das Ziel-Schema für Einträge in `window.BATMAN_GUIDE_LIST`.

## Pflichtfelder pro Eintrag

- `id` *(string)*: stabile technische ID im Format `E<era>-<position>` (z. B. `E4-25`).
- `era` *(string)*: historische/lesestrukturelle Epoche, passend zur ID (`Era 4 ...`).
- `type` *(string)*: DCUI-Linktyp.
  - Erlaubte Werte: `book`, `series`, `collection`
- `title` *(string)*: Anzeige-Titel.
- `url` *(string)*: primäre Ziel-URL (HTTP/HTTPS).
- `importance` *(string)*: inhaltliche Priorität.
  - Erlaubte Werte: `core`, `recommended`, `context`, `optional`
- `readingMode` *(string)*: Leseart.
  - Erlaubte Werte: `read_all`, `selected_issues`, `checkpoint`, `context`
- `continuity` *(string)*: Kontinuitäts-/Canon-Zuordnung (getrennt von `era`).
  - Erlaubte Werte: `golden-age`, `pre-crisis`, `post-crisis`, `new-52`, `rebirth`, `infinite-frontier`, `elseworld`, `black-label`
- `dcuiStatus` *(string)*: Zugriffsstatus in DCUI.
  - Erlaubte Werte: `direct`, `collection`, `search_fallback`, `unavailable`
  - Legacy: `missing` wird noch akzeptiert, ist aber deprecated (verwende stattdessen `unavailable`).
- `dcuiChecked` *(string)*: Prüfdatum im Format `YYYY-MM-DD`.

## Optionale Felder

- `order` *(number)*: explizite Sortierung (empfohlen, integer >= 1000).
- `optional` *(boolean, deprecated)*: Legacy-Kompatibilität; Validator warnt bei Vorkommen. Konsistenz mit `importance === "optional"` bleibt verpflichtend, solange das Feld existiert.
- `cover` *(string)*: direkte Cover-URL (HTTP/HTTPS).
- `placementNote` *(string)*: Begründung der Position („Warum hier?“).
- `issues` *(array)*: Untereinträge für Collections/Selektionen.
  - `issues[].title` *(string, Pflicht)*
  - `issues[].url` *(string, optional, HTTP/HTTPS)*

## Semantische Regeln (Validator)

- `type` muss zur URL passen:
  - `collection` → `/collections/`
  - `book` → `/comics/book/`
  - `series` → `/comics/series/`
- `dcuiStatus` soll zum URL-Typ passen:
  - Collection-URL → `collection`
  - Search-URL → `search_fallback`
  - Nicht verfügbare Inhalte in DCUI → `unavailable` (typisch mit Platzhalter-URL wie `missing`/`n/a`)
- `readingMode: selected_issues` erfordert mindestens ein `issues[]`-Element.
- `readingMode: checkpoint` sollte üblicherweise keine `issues[]` haben.

## Beispiel

```js
{
  id: "E4-25",
  order: 4250,
  era: "Era 4 — Post-Crisis (1986–2011)",
  type: "collection",
  title: "Batman: Hush",
  url: "https://www.dcuniverseinfinite.com/collections/...",
  importance: "core",
  readingMode: "read_all",
  continuity: "post-crisis",
  dcuiStatus: "collection",
  dcuiChecked: "2026-04-26",
  placementNote: "Placed after Fugitive for continuity flow.",
  issues: []
}
```

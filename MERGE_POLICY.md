# Konflikte vermeiden (ohne Programmierwissen)

> Hinweis für Solo-Projekte: Wenn du alleine arbeitest, brauchst du diese Regeln meistens nur selten. Nutze sie als Fallback für Ausnahmefälle.

Ziel: Du sollst **nicht mehr raten müssen**, welche Seite bei Konflikten richtig ist.

## 1) Einmalig einrichten

```bash
./scripts/setup-merge-driver.sh
```

Das macht zwei Dinge:
- aktiviert automatische Konfliktauflösung zugunsten deines aktuellen Branches für häufige UI-Dateien
- aktiviert `rerere` (Git merkt sich einmal gelöste Konflikte für das nächste Mal)

## 2) Harte Regeln (Entscheidungsmatrix)

Wenn trotzdem ein Konflikt auftaucht, nutze diese Regeln:

- `app.js` → **ours** (deine aktuelle Branch-Version behalten)
- `index.html` → **ours**
- `sw.js` → **ours**
- `list.js` (reine Inhalts-/Liste-Updates) → **theirs** (eingehende Daten übernehmen)

Damit ist klar: **Code-Shell bleibt stabil**, **Leseliste darf aktualisiert werden**.

## 3) Konflikt mit einem Kommando lösen

```bash
./scripts/resolve-known-conflicts.sh
```

Das Script setzt genau die Regeln oben um und staged die Dateien direkt.

## 4) Warum das hilft

- verhindert kaputte Mischzustände aus altem/neuem Header-Code
- verhindert, dass funktionierende Startup-Logik versehentlich überschrieben wird
- reduziert wiederkehrende manuelle Merge-Entscheidungen auf 0 in Standardfällen

## 5) Ausnahmefall

Wenn du **bewusst** eine andere Version willst (z. B. großes Feature aus anderem Branch), dann **nicht** das Auto-Script nutzen, sondern gezielt manuell auswählen.

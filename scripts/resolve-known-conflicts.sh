#!/usr/bin/env bash
set -euo pipefail

# Resolve common BatmanGuide conflicts with explicit, stable rules:
# - Keep current branch for app shell files
# - Take incoming version for reading-list data

FILES_OURS=(index.html app.js sw.js)
FILES_THEIRS=(list.js)

for f in "${FILES_OURS[@]}"; do
  if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
    git checkout --ours -- "$f" 2>/dev/null || true
    git add "$f" 2>/dev/null || true
  fi
done

for f in "${FILES_THEIRS[@]}"; do
  if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
    git checkout --theirs -- "$f" 2>/dev/null || true
    git add "$f" 2>/dev/null || true
  fi
done

echo "Applied known conflict rules:"
echo "  ours:   ${FILES_OURS[*]}"
echo "  theirs: ${FILES_THEIRS[*]}"
echo "Run 'git status' to verify remaining conflicts (if any)."

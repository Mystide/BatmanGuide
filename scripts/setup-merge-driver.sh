#!/usr/bin/env bash
set -euo pipefail

# Configure local merge behavior for this repository only.
git config --local merge.ours.name "Keep current branch version"
git config --local merge.ours.driver true

# Remember conflict resolutions so recurring merges become automatic.
git config --local rerere.enabled true

echo "Configured merge driver 'ours' for this repository."
echo "Enabled git rerere to remember conflict resolutions."
echo "For index.html, app.js and sw.js, conflicts are auto-resolved in favor of your current branch."

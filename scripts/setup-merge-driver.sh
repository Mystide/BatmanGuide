#!/usr/bin/env bash
set -euo pipefail

# Configure a local merge driver for this repository only.
git config --local merge.ours.name "Keep current branch version"
git config --local merge.ours.driver true

echo "Configured merge driver 'ours' for this repository."
echo "For index.html and app.js, merge conflicts are now auto-resolved in favor of your current branch."

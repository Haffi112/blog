#!/usr/bin/env bash
set -euo pipefail

# Local helper. Deploys are normally driven by .github/workflows/deploy.yml
# on push to master. Use this script when you want to build locally for a
# quick preview without pushing.

echo "→ Building Astro site"
npm run build

echo
echo "Build output is in ./dist/"
echo "To preview locally: npm run preview"
echo
echo "To trigger a real deploy, push to master."
echo "The GitHub Actions workflow at .github/workflows/deploy.yml will"
echo "build and push to Haffi112/haffi112.github.io."

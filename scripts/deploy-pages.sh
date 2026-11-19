#!/usr/bin/env bash
# Build the app and publish it to the gh-pages branch, which GitHub Pages serves
# at https://<owner>.github.io/<repo>/. Run with: pnpm deploy:pages
set -euo pipefail

cd "$(dirname "$0")/.."
remote_url=$(git remote get-url origin)
repo=$(basename -s .git "$remote_url")

BASE_PATH="/$repo/" pnpm build
# SPA fallback: Pages serves 404.html for deep links like /app/invoices
cp dist/index.html dist/404.html
touch dist/.nojekyll

cd dist
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(git -C .. rev-parse --short HEAD)"
git push -q -f "$remote_url" gh-pages
rm -rf .git
echo "Deployed. Live in about a minute at the repo's GitHub Pages URL."

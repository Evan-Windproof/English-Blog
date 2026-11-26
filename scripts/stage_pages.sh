#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
destination=${1:?Provide an absolute path to an empty staging directory}
[[ "$destination" == /* ]]
mkdir -p "$destination"
[[ -z "$(ls -A "$destination")" ]]
cp -R CNAME index.html app.js styles.css assets articles blog js locales projects robots.txt rss.xml sitemap.xml "$destination/"
rm "$destination/blog/.generated.json"
touch "$destination/.nojekyll"

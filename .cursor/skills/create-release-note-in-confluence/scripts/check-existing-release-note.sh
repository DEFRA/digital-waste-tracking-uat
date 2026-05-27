#!/bin/bash
# Check whether a live Confluence release note page already exists
# Usage: ./check-existing-release-note.sh <manifest.json_or_data_dir>
#
# Archived pages are ignored (treated as deleted — we cannot restore/delete via API).
#
# Exit 0 — no live page found (safe to create)
# Exit 1 — live page found (prints details and link)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT="${1:-}"

TEMPLATE_PAGE_ID="${RELEASE_NOTE_TEMPLATE_ID:-6518407484}"
PARENT_PAGE_ID="${RELEASE_NOTE_PARENT_ID:-6518178160}"
SPACE_KEY="${CONFLUENCE_SPACE_KEY:-WTPG}"
BASE_URL="${CONFLUENCE_BASE_URL:-https://eaflood.atlassian.net/wiki}"

if [[ -z "$INPUT" ]]; then
  echo "Usage: ./check-existing-release-note.sh <manifest.json_or_data_dir>"
  exit 2
fi

if [[ -f "$INPUT" ]]; then
  MANIFEST="$INPUT"
elif [[ -f "$INPUT/manifest.json" ]]; then
  MANIFEST="$INPUT/manifest.json"
else
  echo "Error: manifest not found at $INPUT"
  exit 2
fi

USER="${ATLASSIAN_USER:-}"
if [[ -z "$USER" || -z "$ATLASSIAN_TOKEN" ]]; then
  echo "Error: ATLASSIAN_USER and ATLASSIAN_TOKEN must be set"
  echo "See docs/ai/atlassian-credentials.md"
  exit 2
fi

PAGE_TITLE=$(bash "$SCRIPT_DIR/resolve-page-title.sh" "$MANIFEST")

response=$(curl -s -u "$USER:$ATLASSIAN_TOKEN" \
  -G \
  --data-urlencode "spaceKey=$SPACE_KEY" \
  --data-urlencode "title=$PAGE_TITLE" \
  --data-urlencode "type=page" \
  --data-urlencode "status=current" \
  --data-urlencode "expand=version,space,ancestors" \
  "$BASE_URL/rest/api/content")

if echo "$response" | jq -e '.statusCode' > /dev/null 2>&1; then
  echo "Error: $(echo "$response" | jq -r '.message // "Confluence lookup failed"')"
  exit 2
fi

match=$(echo "$response" | jq \
  --arg title "$PAGE_TITLE" \
  --arg template "$TEMPLATE_PAGE_ID" \
  '[.results[]? | select(.title == $title and (.id | tostring) != $template and .status == "current")] | .[0] // empty')

if [[ -z "$match" || "$match" == "null" ]]; then
  echo "No live release note found for: $PAGE_TITLE"
  echo "(Archived pages are ignored.)"
  exit 0
fi

page_id=$(echo "$match" | jq -r '.id')
space=$(echo "$match" | jq -r '.space.key')
url="$BASE_URL/spaces/$space/pages/$page_id"

under_parent="false"
if echo "$match" | jq -e --arg parent "$PARENT_PAGE_ID" \
  '[.ancestors[]?.id | tostring] | index($parent) != null' > /dev/null 2>&1; then
  under_parent="true"
fi

echo "Release note already exists"
echo "Title: $PAGE_TITLE"
echo "ID: $page_id"
echo "Status: current"
echo "Under AUTOMATED RELEASE DOCS: $under_parent"
echo "URL: $url"
echo ""
echo "Not creating a duplicate page."

exit 1

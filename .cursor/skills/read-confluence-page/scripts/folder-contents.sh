#!/bin/bash
# Fetch a Confluence folder and all pages it contains
# Usage: ./folder-contents.sh FOLDER_ID_OR_URL <output_dir>
#
# Writes:
#   folder.txt / folder.json
#   pages/index.txt
#   pages/<PAGE_ID>/page.txt
#   pages/<PAGE_ID>/page.json

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FOLDER_INPUT="${1:-}"
OUTPUT_DIR="${2:-}"

if [[ -z "$FOLDER_INPUT" || -z "$OUTPUT_DIR" ]]; then
  echo "Usage: ./folder-contents.sh FOLDER_ID_OR_URL <output_dir>"
  exit 1
fi

USER="${ATLASSIAN_USER:-}"
if [[ -z "$USER" || -z "$ATLASSIAN_TOKEN" ]]; then
  echo "Error: ATLASSIAN_USER and ATLASSIAN_TOKEN must be set"
  echo "See docs/ai/atlassian-credentials.md"
  exit 1
fi

BASE_URL="${CONFLUENCE_BASE_URL:-https://eaflood.atlassian.net/wiki}"
MAX_PAGES="${CONFLUENCE_MAX_FOLDER_PAGES:-50}"
FOLDER_ID=$(bash "$SCRIPT_DIR/resolve-content-id.sh" "$FOLDER_INPUT")
PAGES_DIR="$OUTPUT_DIR/pages"
mkdir -p "$PAGES_DIR"

folder_response=$(curl -s -u "$USER:$ATLASSIAN_TOKEN" \
  -H "Accept: application/json" \
  "$BASE_URL/rest/api/content/$FOLDER_ID?expand=space,version,ancestors")

if echo "$folder_response" | jq -e '.statusCode' > /dev/null 2>&1; then
  echo "$folder_response" | jq -r '.message // "Unknown error"'
  exit 1
fi

content_type=$(echo "$folder_response" | jq -r '.type')
if [[ "$content_type" != "folder" && "$content_type" != "page" ]]; then
  echo "Warning: content type is '$content_type' (expected folder or page)" >&2
fi

echo "$folder_response" | jq '.' > "$OUTPUT_DIR/folder.json"

{
  echo "=== Folder $FOLDER_ID ==="
  echo "$folder_response" | jq -r '"Title: \(.title)"'
  echo "$folder_response" | jq -r '"Type: \(.type)"'
  echo "$folder_response" | jq -r '"Space: \(.space.key)"'
  echo "$folder_response" | jq -r '"URL: '"$BASE_URL"'/spaces/\(.space.key)/folder/\(.id)"'
  ancestor_count=$(echo "$folder_response" | jq '.ancestors | length')
  if [[ "$ancestor_count" -gt 0 ]]; then
    echo ""
    echo "=== Folder hierarchy ==="
    echo "$folder_response" | jq -r '.ancestors[] | "\(.id)\t\(.title)"' | column -t -s $'\t'
  fi
} > "$OUTPUT_DIR/folder.txt"

ALL_PAGES="[]"
START_AT=0
PAGE_SIZE=50
LAST_BATCH_COUNT=0

while [[ $(echo "$ALL_PAGES" | jq 'length') -lt $MAX_PAGES ]]; do
  remaining=$((MAX_PAGES - $(echo "$ALL_PAGES" | jq 'length')))
  fetch_limit=$PAGE_SIZE
  if [[ $remaining -lt $fetch_limit ]]; then
    fetch_limit=$remaining
  fi

  response=$(curl -s -u "$USER:$ATLASSIAN_TOKEN" \
    -H "Accept: application/json" \
    "$BASE_URL/rest/api/content/$FOLDER_ID/child/page?start=$START_AT&limit=$fetch_limit&expand=page")

  if echo "$response" | jq -e '.statusCode' > /dev/null 2>&1; then
    echo "$response" | jq -r '.message // "Unknown error"'
    exit 1
  fi

  PAGE_BATCH=$(echo "$response" | jq '.results')
  BATCH_COUNT=$(echo "$PAGE_BATCH" | jq 'length')
  ALL_PAGES=$(echo "$ALL_PAGES $PAGE_BATCH" | jq -s 'add')

  START_AT=$((START_AT + BATCH_COUNT))
  LAST_BATCH_COUNT=$BATCH_COUNT
  if [[ $BATCH_COUNT -eq 0 ]]; then
    break
  fi
done

page_count=$(echo "$ALL_PAGES" | jq 'length')
TRUNCATED=false

if [[ $page_count -ge $MAX_PAGES && $LAST_BATCH_COUNT -gt 0 ]]; then
  probe=$(curl -s -u "$USER:$ATLASSIAN_TOKEN" \
    -H "Accept: application/json" \
    "$BASE_URL/rest/api/content/$FOLDER_ID/child/page?start=$page_count&limit=1")
  probe_count=$(echo "$probe" | jq '.results | length')
  if [[ "$probe_count" -gt 0 ]]; then
    TRUNCATED=true
  fi
fi

{
  echo "Pages in folder $FOLDER_ID"
  echo "Fetched: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "Total fetched: $page_count (max $MAX_PAGES)"
  if [[ "$TRUNCATED" == true ]]; then
    echo "WARNING: Folder has more pages than fetched. Re-run with CONFLUENCE_MAX_FOLDER_PAGES=<n> to fetch more."
  fi
  echo ""
} > "$PAGES_DIR/index.txt"

if [[ "$page_count" -eq 0 ]]; then
  echo "  (no pages in folder)" >> "$PAGES_DIR/index.txt"
  cat "$OUTPUT_DIR/folder.txt"
  cat "$PAGES_DIR/index.txt"
  exit 0
fi

while IFS=$'\t' read -r page_id page_title; do
  page_dir="$PAGES_DIR/$page_id"
  mkdir -p "$page_dir"

  bash "$SCRIPT_DIR/page.sh" "$page_id" full > "$page_dir/page.txt"
  bash "$SCRIPT_DIR/page.sh" "$page_id" json > "$page_dir/page.json"

  echo "  $page_id — $page_title" >> "$PAGES_DIR/index.txt"
done < <(echo "$ALL_PAGES" | jq -r '.[] | "\(.id)\t\(.title)"')

cat "$OUTPUT_DIR/folder.txt"
echo ""
cat "$PAGES_DIR/index.txt"

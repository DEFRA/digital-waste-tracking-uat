#!/bin/bash
# Fetch child pages for Confluence context
# Usage: ./child-pages.sh PAGE_ID <output_dir>
#
# Requires page.json to exist in output_dir (run page.sh first).
# Writes:
#   children/index.txt
#   children/<PAGE_ID>/page.txt
#   children/<PAGE_ID>/page.json

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAGE_ID="${1:-}"
OUTPUT_DIR="${2:-}"

if [[ -z "$PAGE_ID" || -z "$OUTPUT_DIR" ]]; then
  echo "Usage: ./child-pages.sh PAGE_ID <output_dir>"
  exit 1
fi

USER="${ATLASSIAN_USER:-}"
if [[ -z "$USER" || -z "$ATLASSIAN_TOKEN" ]]; then
  echo "Error: ATLASSIAN_USER and ATLASSIAN_TOKEN must be set"
  echo "See docs/ai/atlassian-credentials.md"
  exit 1
fi

BASE_URL="${CONFLUENCE_BASE_URL:-https://eaflood.atlassian.net/wiki}"
MAX_CHILDREN="${CONFLUENCE_MAX_CHILDREN:-10}"
CHILDREN_DIR="$OUTPUT_DIR/children"
mkdir -p "$CHILDREN_DIR"

response=$(curl -s -u "$USER:$ATLASSIAN_TOKEN" \
  -H "Accept: application/json" \
  "$BASE_URL/rest/api/content/$PAGE_ID/child/page?limit=$MAX_CHILDREN&expand=page")

if echo "$response" | jq -e '.statusCode' > /dev/null 2>&1; then
  echo "$response" | jq -r '.message // "Unknown error"'
  exit 1
fi

child_count=$(echo "$response" | jq '.results | length')

{
  echo "Child pages for Confluence page $PAGE_ID"
  echo "Fetched: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo ""
  echo "Child pages (full content, max $MAX_CHILDREN):"
} > "$CHILDREN_DIR/index.txt"

if [[ "$child_count" -eq 0 ]]; then
  echo "  (none)" >> "$CHILDREN_DIR/index.txt"
  cat "$CHILDREN_DIR/index.txt"
  exit 0
fi

while IFS=$'\t' read -r child_id child_title; do
  child_dir="$CHILDREN_DIR/$child_id"
  mkdir -p "$child_dir"

  bash "$SCRIPT_DIR/page.sh" "$child_id" full > "$child_dir/page.txt"
  bash "$SCRIPT_DIR/page.sh" "$child_id" json > "$child_dir/page.json"

  echo "  $child_id — $child_title" >> "$CHILDREN_DIR/index.txt"
done < <(echo "$response" | jq -r '.results[] | "\(.id)\t\(.title)"')

cat "$CHILDREN_DIR/index.txt"

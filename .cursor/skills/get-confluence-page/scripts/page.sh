#!/bin/bash
# Get Confluence page details
# Usage: ./page.sh PAGE_ID_OR_URL [format]
# Formats: full (default), summary, json

set -e

INPUT="${1:-}"
FORMAT="${2:-full}"

if [[ -z "$INPUT" ]]; then
  echo "Usage: ./page.sh PAGE_ID_OR_URL [format]"
  echo "Formats: full (default), summary, json"
  exit 1
fi

USER="${ATLASSIAN_USER:-}"
if [[ -z "$USER" ]]; then
  echo "Error: ATLASSIAN_USER environment variable not set"
  echo "See docs/ai/atlassian-credentials.md"
  exit 1
fi

if [[ -z "$ATLASSIAN_TOKEN" ]]; then
  echo "Error: ATLASSIAN_TOKEN environment variable not set"
  echo "See docs/ai/atlassian-credentials.md"
  exit 1
fi

BASE_URL="${CONFLUENCE_BASE_URL:-https://eaflood.atlassian.net/wiki}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAGE_ID=$(bash "$SCRIPT_DIR/resolve-content-id.sh" "$INPUT")

response=$(curl -s -u "$USER:$ATLASSIAN_TOKEN" \
  -H "Accept: application/json" \
  "$BASE_URL/rest/api/content/$PAGE_ID?expand=body.view,body.storage,version,space,history,metadata.labels,ancestors")

if echo "$response" | jq -e '.statusCode' > /dev/null 2>&1; then
  echo "$response" | jq -r '.message // "Unknown error"'
  exit 1
fi

case "$FORMAT" in
  json)
    echo "$response"
    ;;
  summary)
    echo "$response" | jq -r '{
      id: .id,
      title: .title,
      space: .space.key,
      version: .version.number,
      updated: .version.when,
      updatedBy: .version.by.displayName,
      url: "'"$BASE_URL"'/spaces/\(.space.key)/pages/\(.id)"
    }'
    ;;
  full|*)
    echo "=== Page $PAGE_ID ==="
    echo "$response" | jq -r '"Title: \(.title)"'
    echo "$response" | jq -r '"Space: \(.space.key)"'
    echo "$response" | jq -r '"Version: \(.version.number) (Updated: \(.version.when))"'
    echo "$response" | jq -r '"Updated by: \(.version.by.displayName)"'
    echo "$response" | jq -r '"URL: '"$BASE_URL"'/spaces/\(.space.key)/pages/\(.id)"'
    ancestor_count=$(echo "$response" | jq '.ancestors | length')
    if [[ "$ancestor_count" -gt 0 ]]; then
      echo ""
      echo "=== Page hierarchy ==="
      echo "$response" | jq -r '.ancestors[] | "\(.id)\t\(.title)"' | column -t -s $'\t'
    fi
    echo ""
    echo "=== Labels ==="
    labels=$(echo "$response" | jq -r '.metadata.labels.results[].name // empty')
    if [[ -n "$labels" ]]; then
      echo "$labels"
    else
      echo "(none)"
    fi
    echo ""
    echo "=== Body (HTML) ==="
    echo "$response" | jq -r '.body.view.value // "No content"'
    ;;
esac

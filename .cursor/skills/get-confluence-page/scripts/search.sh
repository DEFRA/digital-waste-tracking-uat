#!/bin/bash
# Search Confluence pages
# Usage: ./search.sh "query" [space_key] [format]
# Formats: list (default), json

set -e

QUERY="${1:-}"
SPACE_KEY="${2:-}"
FORMAT="${3:-list}"

if [[ -z "$QUERY" ]]; then
  echo "Usage: ./search.sh \"query\" [space_key] [format]"
  echo "Formats: list (default), json"
  exit 1
fi

USER="${ATLASSIAN_USER:-}"
if [[ -z "$USER" || -z "$ATLASSIAN_TOKEN" ]]; then
  echo "Error: ATLASSIAN_USER and ATLASSIAN_TOKEN must be set"
  echo "See docs/ai/atlassian-credentials.md"
  exit 1
fi

BASE_URL="${CONFLUENCE_BASE_URL:-https://eaflood.atlassian.net/wiki}"
LIMIT="${CONFLUENCE_SEARCH_LIMIT:-25}"

escaped_query=$(printf '%s' "$QUERY" | sed 's/"/\\"/g')
if [[ -n "$SPACE_KEY" ]]; then
  cql="type=page AND space=\"$SPACE_KEY\" AND (title~\"$escaped_query\" OR text~\"$escaped_query\")"
else
  cql="type=page AND (title~\"$escaped_query\" OR text~\"$escaped_query\")"
fi

response=$(curl -s -G -u "$USER:$ATLASSIAN_TOKEN" \
  -H "Accept: application/json" \
  --data-urlencode "cql=$cql" \
  --data-urlencode "limit=$LIMIT" \
  --data-urlencode "expand=space,version" \
  "$BASE_URL/rest/api/content/search")

if echo "$response" | jq -e '.statusCode' > /dev/null 2>&1; then
  echo "$response" | jq -r '.message // "Unknown error"'
  exit 1
fi

case "$FORMAT" in
  json)
    echo "$response"
    ;;
  list|*)
    total=$(echo "$response" | jq '.size')
    echo "=== Confluence search: \"$QUERY\"${SPACE_KEY:+ in space $SPACE_KEY} ($total results) ==="
    echo "$response" | jq -r '.results[] |
      "\(.id)\t\(.space.key)\t\(.title)\t'"$BASE_URL"'/spaces/\(.space.key)/pages/\(.id)"' | column -t -s $'\t'
    ;;
esac

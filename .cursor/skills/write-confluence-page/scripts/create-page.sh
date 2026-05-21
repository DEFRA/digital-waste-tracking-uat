#!/bin/bash
# Create a Confluence page under a parent page
# Usage: ./create-page.sh <parent_id_or_url> "<title>" <body_file>
#
# body_file must contain HTML in Confluence storage format (e.g. <p>, <h1>, <ul>, <table>).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_INPUT="${1:-}"
TITLE="${2:-}"
BODY_FILE="${3:-}"

if [[ -z "$PARENT_INPUT" || -z "$TITLE" || -z "$BODY_FILE" ]]; then
  echo "Usage: ./create-page.sh <parent_id_or_url> \"<title>\" <body_file>"
  exit 1
fi

if [[ ! -f "$BODY_FILE" ]]; then
  echo "Error: body file not found: $BODY_FILE"
  exit 1
fi

USER="${ATLASSIAN_USER:-}"
if [[ -z "$USER" || -z "$ATLASSIAN_TOKEN" ]]; then
  echo "Error: ATLASSIAN_USER and ATLASSIAN_TOKEN must be set"
  echo "See docs/ai/atlassian-credentials.md"
  exit 1
fi

BASE_URL="${CONFLUENCE_BASE_URL:-https://eaflood.atlassian.net/wiki}"
PARENT_ID=$(bash "$SCRIPT_DIR/resolve-page-id.sh" "$PARENT_INPUT")

parent_response=$(curl -s -u "$USER:$ATLASSIAN_TOKEN" \
  -H "Accept: application/json" \
  "$BASE_URL/rest/api/content/$PARENT_ID?expand=space")

if echo "$parent_response" | jq -e '.statusCode' > /dev/null 2>&1; then
  echo "$parent_response" | jq -r '.message // "Unknown error"'
  exit 1
fi

SPACE_KEY=$(echo "$parent_response" | jq -r '.space.key')
PARENT_TITLE=$(echo "$parent_response" | jq -r '.title')

payload=$(jq -n \
  --arg title "$TITLE" \
  --arg space "$SPACE_KEY" \
  --argjson parent_id "$PARENT_ID" \
  --rawfile body "$BODY_FILE" \
  '{
    type: "page",
    title: $title,
    ancestors: [{id: $parent_id}],
    space: {key: $space},
    body: {
      storage: {
        value: $body,
        representation: "storage"
      }
    }
  }')

response=$(curl -s -u "$USER:$ATLASSIAN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -X POST \
  -d "$payload" \
  "$BASE_URL/rest/api/content?expand=space,version")

if echo "$response" | jq -e '.statusCode' > /dev/null 2>&1; then
  echo "$response" | jq -r '.message // "Unknown error"'
  exit 1
fi

page_id=$(echo "$response" | jq -r '.id')
space=$(echo "$response" | jq -r '.space.key')
url="$BASE_URL/spaces/$space/pages/$page_id"

echo "Created page under \"$PARENT_TITLE\" (parent $PARENT_ID)"
echo "Title: $TITLE"
echo "ID: $page_id"
echo "URL: $url"

#!/bin/bash
# Update an existing Confluence page
# Usage: ./update-page.sh <page_id_or_url> <body_file> ["<new_title>"]
#
# body_file must contain HTML in Confluence storage format.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAGE_INPUT="${1:-}"
BODY_FILE="${2:-}"
NEW_TITLE="${3:-}"

if [[ -z "$PAGE_INPUT" || -z "$BODY_FILE" ]]; then
  echo "Usage: ./update-page.sh <page_id_or_url> <body_file> [\"<new_title>\"]"
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
PAGE_ID=$(bash "$SCRIPT_DIR/resolve-page-id.sh" "$PAGE_INPUT")

current=$(curl -s -u "$USER:$ATLASSIAN_TOKEN" \
  -H "Accept: application/json" \
  "$BASE_URL/rest/api/content/$PAGE_ID?expand=space,version,body.storage")

if echo "$current" | jq -e '.statusCode' > /dev/null 2>&1; then
  echo "$current" | jq -r '.message // "Unknown error"'
  exit 1
fi

TITLE=$(echo "$current" | jq -r '.title')
SPACE_KEY=$(echo "$current" | jq -r '.space.key')
VERSION=$(echo "$current" | jq -r '.version.number')
NEXT_VERSION=$((VERSION + 1))

if [[ -n "$NEW_TITLE" ]]; then
  TITLE="$NEW_TITLE"
fi

payload=$(jq -n \
  --arg id "$PAGE_ID" \
  --arg title "$TITLE" \
  --arg space "$SPACE_KEY" \
  --argjson version "$NEXT_VERSION" \
  --arg type "page" \
  --rawfile body "$BODY_FILE" \
  '{
    id: $id,
    type: $type,
    title: $title,
    space: {key: $space},
    version: {number: $version},
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
  -X PUT \
  -d "$payload" \
  "$BASE_URL/rest/api/content/$PAGE_ID?expand=space,version")

if echo "$response" | jq -e '.statusCode' > /dev/null 2>&1; then
  echo "$response" | jq -r '.message // "Unknown error"'
  exit 1
fi

page_id=$(echo "$response" | jq -r '.id')
space=$(echo "$response" | jq -r '.space.key')
url="$BASE_URL/spaces/$space/pages/$page_id"

echo "Updated page"
echo "Title: $TITLE"
echo "Version: $(echo "$response" | jq -r '.version.number')"
echo "ID: $page_id"
echo "URL: $url"

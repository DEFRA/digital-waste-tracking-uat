#!/bin/bash
# Get Jira fix version (release) metadata
# Usage:
#   ./release.sh <version_id_or_url> [format]
#   ./release.sh <project_key> "<version_name>" [format]
# Formats: full (default), summary, json

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT="${1:-}"
ARG2="${2:-}"
ARG3="${3:-}"

if [[ -z "$INPUT" ]]; then
  echo "Usage: ./release.sh <version_id_or_url> [format]"
  echo "   or: ./release.sh <project_key> \"<version_name>\" [format]"
  echo "Formats: full (default), summary, json"
  exit 1
fi

is_format() {
  [[ "$1" == "full" || "$1" == "summary" || "$1" == "json" ]]
}

if is_format "$ARG2"; then
  FORMAT="$ARG2"
  VERSION_NAME=""
elif [[ -n "$ARG2" ]]; then
  VERSION_NAME="$ARG2"
  if is_format "$ARG3"; then
    FORMAT="$ARG3"
  else
    FORMAT="full"
  fi
else
  FORMAT="full"
  VERSION_NAME=""
fi

USER="${ATLASSIAN_USER:-}"
if [[ -z "$USER" || -z "$ATLASSIAN_TOKEN" ]]; then
  echo "Error: ATLASSIAN_USER and ATLASSIAN_TOKEN must be set"
  echo "See docs/ai/atlassian-credentials.md"
  exit 1
fi

AUTH="$USER:$ATLASSIAN_TOKEN"
BASE_URL="${ATLASSIAN_BASE_URL:-https://eaflood.atlassian.net}"

if [[ -n "$VERSION_NAME" ]]; then
  VERSION_ID=$(bash "$SCRIPT_DIR/resolve-release-id.sh" "$INPUT" "$VERSION_NAME")
else
  VERSION_ID=$(bash "$SCRIPT_DIR/resolve-release-id.sh" "$INPUT")
fi

response=$(curl -s -u "$AUTH" \
  -H "Accept: application/json" \
  "$BASE_URL/rest/api/2/version/$VERSION_ID")

if echo "$response" | jq -e '.errorMessages' > /dev/null 2>&1; then
  echo "Error: $(echo "$response" | jq -r '.errorMessages[]')"
  exit 1
fi

case "$FORMAT" in
  json)
    echo "$response"
    ;;
  summary)
    echo "$response" | jq -r '{
      id: .id,
      name: .name,
      description: (.description // ""),
      released: .released,
      archived: .archived,
      releaseDate: (.releaseDate // "Not set"),
      projectId: .projectId,
      overdue: (.overdue // false)
    }'
    ;;
  full|*)
    echo "=== Release $VERSION_ID ==="
    echo "$response" | jq -r '"Name: \(.name)"'
    echo "$response" | jq -r '"Released: \(.released)"'
    echo "$response" | jq -r '"Archived: \(.archived)"'
    echo "$response" | jq -r '"Release date: \(.releaseDate // "Not set")"'
    echo "$response" | jq -r '"Overdue: \(.overdue // false)"'
    echo "$response" | jq -r '"Project ID: \(.projectId)"'
    echo ""
    echo "=== Description ==="
    echo "$response" | jq -r '.description // "No description"'
    echo ""
    echo "URL: $BASE_URL/projects/<project>/versions/$VERSION_ID/tab/release-report-all-issues"
    ;;
esac

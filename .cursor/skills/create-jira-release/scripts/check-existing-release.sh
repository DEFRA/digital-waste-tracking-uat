#!/bin/bash
# Check whether a Jira fix version already exists in a project
# Usage: ./check-existing-release.sh <project_key> "<version_name>"
#
# Exit 0 — no matching version (safe to create)
# Exit 1 — version exists (prints id, name, url)
# Exit 2 — usage or API error

set -e

PROJECT_KEY="${1:-}"
VERSION_NAME="${2:-}"

if [[ -z "$PROJECT_KEY" || -z "$VERSION_NAME" ]]; then
  echo "Usage: ./check-existing-release.sh <project_key> \"<version_name>\"" >&2
  exit 2
fi

USER="${ATLASSIAN_USER:-}"
if [[ -z "$USER" || -z "$ATLASSIAN_TOKEN" ]]; then
  echo "Error: ATLASSIAN_USER and ATLASSIAN_TOKEN must be set" >&2
  echo "See docs/ai/atlassian-credentials.md" >&2
  exit 2
fi

AUTH="$USER:$ATLASSIAN_TOKEN"
BASE_URL="${ATLASSIAN_BASE_URL:-https://eaflood.atlassian.net}"
PROJECT_KEY=$(echo "$PROJECT_KEY" | tr '[:lower:]' '[:upper:]')

response=$(curl -s -u "$AUTH" \
  -H "Accept: application/json" \
  "$BASE_URL/rest/api/2/project/$PROJECT_KEY/versions")

if echo "$response" | jq -e '.errorMessages' > /dev/null 2>&1; then
  echo "Error: $(echo "$response" | jq -r '.errorMessages[]')" >&2
  exit 2
fi

match=$(echo "$response" | jq \
  --arg name "$VERSION_NAME" \
  '[.[]? | select(.name == $name)] | .[0] // empty')

if [[ -z "$match" || "$match" == "null" ]]; then
  echo "No release found for: $VERSION_NAME"
  exit 0
fi

version_id=$(echo "$match" | jq -r '.id')
released=$(echo "$match" | jq -r '.released')
archived=$(echo "$match" | jq -r '.archived')
url="$BASE_URL/projects/$PROJECT_KEY/versions/$version_id"

echo "Release already exists"
echo "Name: $VERSION_NAME"
echo "ID: $version_id"
echo "Released: $released"
echo "Archived: $archived"
echo "URL: $url"
echo ""
echo "Use --version $version_id to update description or assign tickets."

exit 1

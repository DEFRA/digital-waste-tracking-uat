#!/bin/bash
# Resolve a Jira fix version ID from a URL, numeric ID, or project + version name
# Usage:
#   ./resolve-release-id.sh 38223
#   ./resolve-release-id.sh "https://eaflood.atlassian.net/projects/DWTA/versions/38223/tab/release-report-all-issues"
#   ./resolve-release-id.sh DWTA "Release name"

set -e

INPUT="${1:-}"
VERSION_NAME="${2:-}"

USER="${ATLASSIAN_USER:-}"
if [[ -z "$USER" || -z "$ATLASSIAN_TOKEN" ]]; then
  echo "Error: ATLASSIAN_USER and ATLASSIAN_TOKEN must be set" >&2
  echo "See docs/ai/atlassian-credentials.md" >&2
  exit 1
fi

AUTH="$USER:$ATLASSIAN_TOKEN"
BASE_URL="${ATLASSIAN_BASE_URL:-https://eaflood.atlassian.net}"

if [[ -z "$INPUT" ]]; then
  echo "Usage: ./resolve-release-id.sh <version_id_or_url> [version_name]" >&2
  exit 1
fi

if [[ "$INPUT" =~ ^[0-9]+$ ]]; then
  echo "$INPUT"
  exit 0
fi

if [[ "$INPUT" =~ /projects/[^/]+/versions/([0-9]+) ]]; then
  echo "${BASH_REMATCH[1]}"
  exit 0
fi

if [[ "$INPUT" =~ /versions/([0-9]+) ]]; then
  echo "${BASH_REMATCH[1]}"
  exit 0
fi

if [[ -n "$VERSION_NAME" ]]; then
  PROJECT_KEY="$INPUT"
  versions_response=$(curl -s -u "$AUTH" \
    -H "Accept: application/json" \
    "$BASE_URL/rest/api/2/project/$PROJECT_KEY/versions")

  if echo "$versions_response" | jq -e '.errorMessages' > /dev/null 2>&1; then
    echo "Error: $(echo "$versions_response" | jq -r '.errorMessages[]')" >&2
    exit 1
  fi

  version_id=$(echo "$versions_response" | jq -r --arg name "$VERSION_NAME" '.[] | select(.name == $name) | .id' | head -1)

  if [[ -z "$version_id" || "$version_id" == "null" ]]; then
    echo "Error: version '$VERSION_NAME' not found in project $PROJECT_KEY" >&2
    exit 1
  fi

  echo "$version_id"
  exit 0
fi

echo "Error: unable to resolve version ID from input: $INPUT" >&2
echo "Provide a numeric ID, release URL, or project key + version name" >&2
exit 1

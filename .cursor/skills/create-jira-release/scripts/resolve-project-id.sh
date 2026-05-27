#!/bin/bash
# Resolve a Jira project ID from a project key
# Usage: ./resolve-project-id.sh <project_key>

set -e

PROJECT_KEY="${1:-}"

if [[ -z "$PROJECT_KEY" ]]; then
  echo "Usage: ./resolve-project-id.sh <project_key>" >&2
  exit 1
fi

USER="${ATLASSIAN_USER:-}"
if [[ -z "$USER" || -z "$ATLASSIAN_TOKEN" ]]; then
  echo "Error: ATLASSIAN_USER and ATLASSIAN_TOKEN must be set" >&2
  echo "See docs/ai/atlassian-credentials.md" >&2
  exit 1
fi

AUTH="$USER:$ATLASSIAN_TOKEN"
BASE_URL="${ATLASSIAN_BASE_URL:-https://eaflood.atlassian.net}"
PROJECT_KEY=$(echo "$PROJECT_KEY" | tr '[:lower:]' '[:upper:]')

response=$(curl -s -u "$AUTH" \
  -H "Accept: application/json" \
  "$BASE_URL/rest/api/2/project/$PROJECT_KEY")

if echo "$response" | jq -e '.errorMessages' > /dev/null 2>&1; then
  echo "Error: $(echo "$response" | jq -r '.errorMessages[]')" >&2
  exit 1
fi

project_id=$(echo "$response" | jq -r '.id')
if [[ -z "$project_id" || "$project_id" == "null" ]]; then
  echo "Error: project '$PROJECT_KEY' not found" >&2
  exit 1
fi

echo "$project_id"

#!/bin/bash
# Assign a fix version to one or more Jira issues
# Usage: ./assign-issues.sh <version_id> "DWTA-154,DWTA-155" [output_dir]

set -e

VERSION_ID="${1:-}"
TICKETS_CSV="${2:-}"
OUTPUT_DIR="${3:-}"

if [[ -z "$VERSION_ID" || -z "$TICKETS_CSV" ]]; then
  echo "Usage: ./assign-issues.sh <version_id> \"DWTA-154,DWTA-155\" [output_dir]"
  exit 1
fi

USER="${ATLASSIAN_USER:-}"
if [[ -z "$USER" || -z "$ATLASSIAN_TOKEN" ]]; then
  echo "Error: ATLASSIAN_USER and ATLASSIAN_TOKEN must be set"
  echo "See docs/ai/atlassian-credentials.md"
  exit 1
fi

AUTH="$USER:$ATLASSIAN_TOKEN"
BASE_URL="${ATLASSIAN_BASE_URL:-https://eaflood.atlassian.net}"

IFS=',' read -ra TICKETS <<< "${TICKETS_CSV// /}"
declare -a ASSIGNED=()
declare -a FAILED=()

for ticket in "${TICKETS[@]}"; do
  ticket=$(echo "$ticket" | tr '[:lower:]' '[:upper:]')
  [[ -z "$ticket" ]] && continue

  payload=$(jq -n \
    --argjson version_id "$VERSION_ID" \
    '{update: {fixVersions: [{add: {id: ($version_id | tostring)}}]}}')

  response=$(curl -s -u "$AUTH" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -X PUT \
    -d "$payload" \
    "$BASE_URL/rest/api/2/issue/$ticket")

  if echo "$response" | jq -e '.errorMessages' > /dev/null 2>&1; then
    message=$(echo "$response" | jq -r '.errorMessages[]? // .errors | to_entries[]? | .value' | head -1)
    echo "Failed: $ticket — ${message:-unknown error}"
    FAILED+=("$ticket")
    continue
  fi

  echo "Assigned: $ticket"
  ASSIGNED+=("$ticket")
done

if [[ -n "$OUTPUT_DIR" ]]; then
  mkdir -p "$OUTPUT_DIR"
  assigned_json=$(printf '%s\n' "${ASSIGNED[@]}" | jq -R . | jq -s 'map(select(length > 0))')
  failed_json=$(printf '%s\n' "${FAILED[@]}" | jq -R . | jq -s 'map(select(length > 0))')
  jq -n \
    --arg versionId "$VERSION_ID" \
    --argjson assigned "$assigned_json" \
    --argjson failed "$failed_json" \
    '{versionId: $versionId, assigned: $assigned, failed: $failed}' \
    > "$OUTPUT_DIR/assignments.json"
fi

if [[ ${#FAILED[@]} -gt 0 ]]; then
  exit 1
fi

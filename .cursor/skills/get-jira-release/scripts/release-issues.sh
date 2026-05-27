#!/bin/bash
# Get work items assigned to a Jira fix version (release)
# Usage: ./release-issues.sh <version_id_or_url> <output_dir> [version_name_if_project_key]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT="${1:-}"
OUTPUT_DIR="${2:-}"
VERSION_NAME="${3:-}"

if [[ -z "$INPUT" || -z "$OUTPUT_DIR" ]]; then
  echo "Usage: ./release-issues.sh <version_id_or_url> <output_dir> [version_name]"
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
MAX_RESULTS="${JIRA_RELEASE_MAX_ISSUES:-100}"
FIELDS="key,summary,status,issuetype,assignee,priority,parent,labels"

if [[ -n "$VERSION_NAME" && "$INPUT" =~ ^[A-Z][A-Z0-9_-]+$ ]]; then
  VERSION_ID=$(bash "$SCRIPT_DIR/resolve-release-id.sh" "$INPUT" "$VERSION_NAME")
else
  VERSION_ID=$(bash "$SCRIPT_DIR/resolve-release-id.sh" "$INPUT")
fi

mkdir -p "$OUTPUT_DIR"

version_response=$(curl -s -u "$AUTH" \
  -H "Accept: application/json" \
  "$BASE_URL/rest/api/2/version/$VERSION_ID")

if echo "$version_response" | jq -e '.errorMessages' > /dev/null 2>&1; then
  echo "Error: $(echo "$version_response" | jq -r '.errorMessages[]')"
  exit 1
fi

VERSION_NAME_VALUE=$(echo "$version_response" | jq -r '.name')
JQL="fixVersion = $VERSION_ID ORDER BY key ASC"

issues="[]"
next_page_token=""
is_last="false"

while [[ "$is_last" != "true" ]]; do
  curl_args=(
    -s -u "$AUTH"
    -G
    --data-urlencode "jql=$JQL"
    --data-urlencode "maxResults=$MAX_RESULTS"
    --data-urlencode "fields=$FIELDS"
  )

  if [[ -n "$next_page_token" ]]; then
    curl_args+=(--data-urlencode "nextPageToken=$next_page_token")
  fi

  search_response=$(curl "${curl_args[@]}" "$BASE_URL/rest/api/3/search/jql")

  if echo "$search_response" | jq -e '.errorMessages' > /dev/null 2>&1; then
    echo "Error: $(echo "$search_response" | jq -r '.errorMessages[]')"
    exit 1
  fi

  page_issues=$(echo "$search_response" | jq '[.issues[] | {
    key: .key,
    summary: .fields.summary,
    status: .fields.status.name,
    type: .fields.issuetype.name,
    priority: (.fields.priority.name // "None"),
    assignee: (.fields.assignee.displayName // "Unassigned"),
    parent: (.fields.parent.key // null),
    labels: (.fields.labels // [])
  }]')

  issues=$(echo "$issues $page_issues" | jq -s 'add')
  is_last=$(echo "$search_response" | jq -r '.isLast')
  next_page_token=$(echo "$search_response" | jq -r '.nextPageToken // empty')
done

total=$(echo "$issues" | jq 'length')

{
  echo "=== Release work items ==="
  echo "Version ID: $VERSION_ID"
  echo "Version name: $VERSION_NAME_VALUE"
  echo "Total issues: $total"
  echo ""
  echo "=== Issues ==="
  echo -e "KEY\tTYPE\tSTATUS\tPRIORITY\tASSIGNEE\tSUMMARY"
  echo "$issues" | jq -r '.[] | [.key, .type, .status, .priority, .assignee, .summary] | @tsv' | column -t -s $'\t'
  echo ""
  echo "=== By status ==="
  echo "$issues" | jq -r 'group_by(.status) | .[] | "\(.[0].status): \(length)"'
  echo ""
  echo "=== By type ==="
  echo "$issues" | jq -r 'group_by(.type) | .[] | "\(.[0].type): \(length)"'
} > "$OUTPUT_DIR/issues.txt"

echo "$issues" | jq \
  --arg versionId "$VERSION_ID" \
  --arg versionName "$VERSION_NAME_VALUE" \
  --arg jql "$JQL" \
  --argjson total "$total" \
  '{
    versionId: $versionId,
    versionName: $versionName,
    jql: $jql,
    total: $total,
    issues: .
  }' > "$OUTPUT_DIR/issues.json"

echo "Saved: $OUTPUT_DIR/issues.txt"
echo "Saved: $OUTPUT_DIR/issues.json"
echo "Total issues: $total"

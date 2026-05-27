#!/bin/bash
# Add a Related work link to a Jira fix version (release)
# Usage:
#   ./link-related-work.sh <version_id_or_url> <url> [--title "Title"] [--category Documentation] [output_file]
#
# Skips creation if the same URL is already linked to the version.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VERSION_INPUT="${1:-}"
WORK_URL="${2:-}"
WORK_TITLE=""
WORK_CATEGORY="${JIRA_RELATED_WORK_CATEGORY:-Documentation}"
OUTPUT_FILE=""
DRY_RUN="false"

shift 2 2>/dev/null || true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --title)
      WORK_TITLE="$2"
      shift 2
      ;;
    --category)
      WORK_CATEGORY="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    *)
      if [[ -z "$OUTPUT_FILE" ]]; then
        OUTPUT_FILE="$1"
      else
        echo "Error: unknown argument: $1"
        exit 2
      fi
      shift
      ;;
  esac
done

if [[ -z "$VERSION_INPUT" || -z "$WORK_URL" ]]; then
  echo "Usage: ./link-related-work.sh <version_id_or_url> <url> [--title \"Title\"] [--category Documentation] [output.json]"
  exit 2
fi

USER="${ATLASSIAN_USER:-}"
if [[ -z "$USER" || -z "$ATLASSIAN_TOKEN" ]]; then
  echo "Error: ATLASSIAN_USER and ATLASSIAN_TOKEN must be set"
  echo "See docs/ai/atlassian-credentials.md"
  exit 2
fi

AUTH="$USER:$ATLASSIAN_TOKEN"
BASE_URL="${ATLASSIAN_BASE_URL:-https://eaflood.atlassian.net}"

VERSION_ID=$(bash "$SKILLS_DIR/get-jira-release/scripts/resolve-release-id.sh" "$VERSION_INPUT")

if [[ -z "$WORK_TITLE" ]]; then
  WORK_TITLE="Release notes"
fi

existing=$(curl -s -u "$AUTH" \
  -H "Accept: application/json" \
  "$BASE_URL/rest/api/3/version/$VERSION_ID/relatedwork")

if echo "$existing" | jq -e '.statusCode' > /dev/null 2>&1; then
  echo "Error: $(echo "$existing" | jq -r '.message // "Failed to fetch related work"')"
  exit 1
fi

duplicate=$(echo "$existing" | jq --arg url "$WORK_URL" '[.[]? | select(.url == $url)] | .[0] // empty')

if [[ -n "$duplicate" && "$duplicate" != "null" ]]; then
  echo "Related work already linked"
  echo "Title: $(echo "$duplicate" | jq -r '.title')"
  echo "URL: $WORK_URL"
  echo "ID: $(echo "$duplicate" | jq -r '.relatedWorkId')"
  if [[ -n "$OUTPUT_FILE" ]]; then
    echo "$duplicate" | jq '{status: "existing", relatedWork: .}' > "$OUTPUT_FILE"
  fi
  exit 0
fi

if [[ "$DRY_RUN" == "true" ]]; then
  echo "Dry run — would add related work"
  echo "  Version ID: $VERSION_ID"
  echo "  Title: $WORK_TITLE"
  echo "  Category: $WORK_CATEGORY"
  echo "  URL: $WORK_URL"
  exit 0
fi

payload=$(jq -n \
  --arg category "$WORK_CATEGORY" \
  --arg title "$WORK_TITLE" \
  --arg url "$WORK_URL" \
  '{category: $category, title: $title, url: $url}')

response=$(curl -s -u "$AUTH" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -X POST \
  -d "$payload" \
  "$BASE_URL/rest/api/3/version/$VERSION_ID/relatedwork")

if echo "$response" | jq -e '.statusCode' > /dev/null 2>&1; then
  echo "Error: $(echo "$response" | jq -r '.message // "Failed to create related work"')"
  exit 1
fi

echo "Added related work to release $VERSION_ID"
echo "Title: $(echo "$response" | jq -r '.title')"
echo "Category: $(echo "$response" | jq -r '.category')"
echo "URL: $(echo "$response" | jq -r '.url')"
echo "ID: $(echo "$response" | jq -r '.relatedWorkId')"

if [[ -n "$OUTPUT_FILE" ]]; then
  echo "$response" | jq '{status: "created", relatedWork: .}' > "$OUTPUT_FILE"
fi

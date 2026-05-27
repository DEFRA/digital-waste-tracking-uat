#!/bin/bash
# Link a Confluence release note page to a Jira fix version as Related work
# Usage:
#   ./link-jira-release.sh <data_dir> <confluence_page_url_or_id> <version_id_or_url> \
#     [--related-work-title "Title"]
#
# Use after publishing or updating a Confluence page when --link-jira-release was not
# passed to publish-release-note.sh.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

DATA_DIR="${1:-}"
PAGE_INPUT="${2:-}"
VERSION_INPUT="${3:-}"
RELATED_WORK_TITLE=""

shift 3 2>/dev/null || true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --related-work-title)
      RELATED_WORK_TITLE="$2"
      shift 2
      ;;
    *)
      echo "Error: unknown argument: $1"
      exit 2
      ;;
  esac
done

if [[ -z "$DATA_DIR" || -z "$PAGE_INPUT" || -z "$VERSION_INPUT" ]]; then
  echo "Usage: ./link-jira-release.sh <data_dir> <confluence_page_url_or_id> <version_id_or_url> \\"
  echo "  [--related-work-title \"Title\"]"
  exit 2
fi

if [[ "$PAGE_INPUT" =~ ^[0-9]+$ ]]; then
  BASE_URL="${CONFLUENCE_BASE_URL:-https://eaflood.atlassian.net/wiki}"
  SPACE_KEY="${CONFLUENCE_SPACE_KEY:-WTPG}"
  page_url="$BASE_URL/spaces/$SPACE_KEY/pages/$PAGE_INPUT"
elif [[ "$PAGE_INPUT" =~ ^https?:// ]]; then
  page_url="$PAGE_INPUT"
else
  echo "Error: provide a Confluence page URL or numeric page ID"
  exit 2
fi

link_title="$RELATED_WORK_TITLE"
if [[ -z "$link_title" && -f "$DATA_DIR/manifest.json" ]]; then
  link_title=$(jq -r '.pageTitle // .confluencePage.title // empty' "$DATA_DIR/manifest.json")
fi
if [[ -z "$link_title" ]]; then
  link_title="Release notes"
fi

bash "$SKILLS_DIR/create-jira-release/scripts/link-related-work.sh" \
  "$VERSION_INPUT" \
  "$page_url" \
  --title "$link_title" \
  "$DATA_DIR/related-work.json"

if [[ -f "$DATA_DIR/manifest.json" ]]; then
  tmp_manifest=$(mktemp)
  jq \
    --arg url "$page_url" \
    --slurpfile relatedWork "$DATA_DIR/related-work.json" \
    '. + {
      confluencePage: ((.confluencePage // {}) + {url: $url}),
      relatedWork: $relatedWork[0].relatedWork
    }' "$DATA_DIR/manifest.json" > "$tmp_manifest"
  mv "$tmp_manifest" "$DATA_DIR/manifest.json"
fi

echo "Linked Jira release to Confluence page"

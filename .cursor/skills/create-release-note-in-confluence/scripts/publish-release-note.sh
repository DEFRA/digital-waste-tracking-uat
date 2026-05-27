#!/bin/bash
# Publish a release note if one does not already exist
# Usage:
#   ./publish-release-note.sh <data_dir> <draft_dir> [parent_id_or_url] \
#     [--link-jira-release <version_id_or_url>] [--related-work-title "Title"]
#
# Optional --link-jira-release adds a Related work link on the Jira fix version
# pointing to the published Confluence page (shown on the Jira release page).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

DATA_DIR="${1:-}"
DRAFT_DIR="${2:-}"
shift 2 2>/dev/null || true

PARENT="${RELEASE_NOTE_PARENT_ID:-6518178160}"
LINK_JIRA_RELEASE=""
RELATED_WORK_TITLE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --link-jira-release)
      LINK_JIRA_RELEASE="$2"
      shift 2
      ;;
    --related-work-title)
      RELATED_WORK_TITLE="$2"
      shift 2
      ;;
    *)
      PARENT="$1"
      shift
      ;;
  esac
done

if [[ -z "$DATA_DIR" || -z "$DRAFT_DIR" ]]; then
  echo "Usage: ./publish-release-note.sh <data_dir> <draft_dir> [parent_id_or_url] \\"
  echo "  [--link-jira-release <version_id_or_url>] [--related-work-title \"Title\"]"
  exit 2
fi

if [[ ! -f "$DRAFT_DIR/page.html" ]]; then
  echo "Error: draft not found — run build-release-note.sh first"
  exit 2
fi

if ! bash "$SCRIPT_DIR/check-existing-release-note.sh" "$DATA_DIR"; then
  exit 1
fi

PAGE_TITLE=$(bash "$SCRIPT_DIR/resolve-page-title.sh" "$DATA_DIR/manifest.json")

echo "Publishing with title: $PAGE_TITLE"

publish_output=$(bash "$SKILLS_DIR/create-confluence-page/scripts/create-page.sh" \
  "$PARENT" \
  "$PAGE_TITLE" \
  "$DRAFT_DIR/page.html" 2>&1)

echo "$publish_output"

page_url=$(echo "$publish_output" | awk '/^URL: /{print $2}')
page_id=$(echo "$publish_output" | awk '/^ID: /{print $2}')

if [[ -z "$page_url" ]]; then
  echo "Error: could not determine published page URL"
  exit 1
fi

if [[ -n "$LINK_JIRA_RELEASE" ]]; then
  link_title="$RELATED_WORK_TITLE"
  if [[ -z "$link_title" ]]; then
    link_title="$PAGE_TITLE"
  fi

  echo ""
  echo "Linking Confluence page to Jira release..."
  bash "$SKILLS_DIR/create-jira-release/scripts/link-related-work.sh" \
    "$LINK_JIRA_RELEASE" \
    "$page_url" \
    --title "$link_title" \
    "$DATA_DIR/related-work.json"
fi

if [[ -f "$DATA_DIR/manifest.json" ]]; then
  tmp_manifest=$(mktemp)
  jq \
    --arg confluencePageId "${page_id:-}" \
    --arg confluencePageUrl "$page_url" \
    --arg confluencePageTitle "$PAGE_TITLE" \
    '. + {
      confluencePage: {
        id: (if $confluencePageId == "" then null else $confluencePageId end),
        title: $confluencePageTitle,
        url: $confluencePageUrl
      }
    }' "$DATA_DIR/manifest.json" > "$tmp_manifest"
  mv "$tmp_manifest" "$DATA_DIR/manifest.json"

  if [[ -f "$DATA_DIR/related-work.json" ]]; then
    tmp_manifest=$(mktemp)
    jq \
      --slurpfile relatedWork "$DATA_DIR/related-work.json" \
      '. + {relatedWork: $relatedWork[0].relatedWork}' \
      "$DATA_DIR/manifest.json" > "$tmp_manifest"
    mv "$tmp_manifest" "$DATA_DIR/manifest.json"
  fi
fi

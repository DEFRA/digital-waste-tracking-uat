#!/bin/bash
# Collect Jira, service version, and config data for a release note
# Usage:
#   ./collect-release-data.sh <output_dir> --release <release_id_or_url>
#   ./collect-release-data.sh <output_dir> --tickets "DWTA-154,DWTA-155"

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

OUTPUT_DIR="${1:-}"
MODE="${2:-}"
INPUT="${3:-}"

TEMPLATE_PAGE_ID="${RELEASE_NOTE_TEMPLATE_ID:-6518407484}"
JIRA_BASE="${ATLASSIAN_BASE_URL:-https://eaflood.atlassian.net}"

if [[ -z "$OUTPUT_DIR" || -z "$MODE" || -z "$INPUT" ]]; then
  echo "Usage:"
  echo "  ./collect-release-data.sh <output_dir> --release <release_id_or_url>"
  echo "  ./collect-release-data.sh <output_dir> --tickets \"DWTA-154,DWTA-155\""
  exit 1
fi

mkdir -p "$OUTPUT_DIR/tickets"

declare -a TICKETS=()
RELEASE_JSON="null"

if [[ "$MODE" == "--release" ]]; then
  VERSION_ID=$(bash "$SKILLS_DIR/get-jira-release/scripts/resolve-release-id.sh" "$INPUT")

  bash "$SKILLS_DIR/get-jira-release/scripts/release.sh" "$INPUT" json \
    > "$OUTPUT_DIR/release.json"
  bash "$SKILLS_DIR/get-jira-release/scripts/release-issues.sh" "$INPUT" "$OUTPUT_DIR"

  while IFS= read -r key; do
    TICKETS+=("$key")
  done < <(jq -r '.issues[].key' "$OUTPUT_DIR/issues.json")

  RELEASE_JSON=$(jq -n \
    --arg id "$VERSION_ID" \
    --arg name "$(jq -r '.name' "$OUTPUT_DIR/release.json")" \
    --arg url "$JIRA_BASE/projects/DWTA/versions/$VERSION_ID/tab/release-report-all-issues" \
    --arg releaseDate "$(jq -r '.releaseDate // ""' "$OUTPUT_DIR/release.json")" \
    '{id: $id, name: $name, url: $url, releaseDate: $releaseDate}')

elif [[ "$MODE" == "--tickets" ]]; then
  IFS=',' read -ra TICKETS <<< "${INPUT// /}"
  RELEASE_JSON="null"
else
  echo "Error: mode must be --release or --tickets"
  exit 1
fi

if [[ ${#TICKETS[@]} -eq 0 ]]; then
  echo "Error: no tickets found"
  exit 1
fi

echo "Collecting data for ${#TICKETS[@]} ticket(s)..."

for ticket in "${TICKETS[@]}"; do
  ticket=$(echo "$ticket" | tr '[:lower:]' '[:upper:]')
  ticket_dir="$OUTPUT_DIR/tickets/$ticket"
  mkdir -p "$ticket_dir/attachments"

  echo "  - $ticket"
  bash "$SKILLS_DIR/get-jira-ticket/scripts/ticket.sh" "$ticket" json \
    > "$ticket_dir/ticket.json"
  bash "$SKILLS_DIR/get-jira-ticket/scripts/ticket.sh" "$ticket" full \
    > "$ticket_dir/ticket.txt"
  bash "$SKILLS_DIR/get-jira-ticket/scripts/comments.sh" "$ticket" list \
    > "$ticket_dir/comments.txt"
  bash "$SKILLS_DIR/get-jira-ticket/scripts/github-dev.sh" "$ticket" "$ticket_dir" \
    > /dev/null
  bash "$SKILLS_DIR/get-jira-ticket/scripts/related-tickets.sh" "$ticket" "$ticket_dir" \
    > /dev/null || true

  for related_dir in "$ticket_dir/related"/*/; do
    [[ -d "$related_dir" ]] || continue
    related_ticket=$(basename "$related_dir")
    bash "$SKILLS_DIR/get-jira-ticket/scripts/github-dev.sh" "$related_ticket" "$related_dir" \
      > /dev/null || true
  done

  if [[ -f "$ticket_dir/github.txt" ]]; then
    bash "$SKILLS_DIR/get-pr-service-version/scripts/pr-versions-from-file.sh" \
      "$ticket_dir/github.txt" "$ticket_dir" > /dev/null || true
  fi
done

bash "$SCRIPT_DIR/config-prs.sh" "$OUTPUT_DIR/tickets" "$OUTPUT_DIR/config-prs.json"

bash "$SKILLS_DIR/get-confluence-page/scripts/page.sh" "$TEMPLATE_PAGE_ID" json \
  > "$OUTPUT_DIR/template.json"
jq -r '.body.storage.value' "$OUTPUT_DIR/template.json" > "$OUTPUT_DIR/template.html"

service_versions="[]"

semver_gt() {
  local a="$1"
  local b="$2"
  [[ "$(printf '%s\n%s\n' "$a" "$b" | sort -V | tail -1)" == "$a" && "$a" != "$b" ]]
}

for ticket in "${TICKETS[@]}"; do
  ticket=$(echo "$ticket" | tr '[:lower:]' '[:upper:]')
  svc_file="$OUTPUT_DIR/tickets/$ticket/service-versions.json"
  [[ -f "$svc_file" ]] || continue

  while IFS= read -r entry; do
    repo=$(echo "$entry" | jq -r '.repo')
    version=$(echo "$entry" | jq -r '.version')
    pr_url=$(echo "$entry" | jq -r '.url')

    [[ -z "$repo" || "$version" == "null" || -z "$version" ]] && continue

    existing_version=$(echo "$service_versions" | jq -r --arg repo "$repo" '.[] | select(.repo == $repo) | .version' | head -1)

    if [[ -n "$existing_version" ]]; then
      if semver_gt "$version" "$existing_version"; then
        pick_version="$version"
      else
        pick_version="$existing_version"
      fi
      service_versions=$(echo "$service_versions" | jq \
        --arg repo "$repo" \
        --arg version "$pick_version" \
        --arg ticket "$ticket" \
        --arg prUrl "$pr_url" \
        'map(if .repo == $repo then .version = $version | .tickets = ((.tickets + [$ticket]) | unique) | .prUrls = ((.prUrls + [$prUrl]) | unique) else . end)')
    else
      service_versions=$(echo "$service_versions" | jq \
        --arg repo "$repo" \
        --arg version "$version" \
        --arg ticket "$ticket" \
        --arg prUrl "$pr_url" \
        '. + [{repo: $repo, version: $version, tickets: [$ticket], prUrls: [$prUrl]}]')
    fi
  done < <(jq -c '.[]' "$svc_file")
done

issues_json="[]"
if [[ -f "$OUTPUT_DIR/issues.json" ]]; then
  issues_json=$(jq '.issues' "$OUTPUT_DIR/issues.json")
else
  for ticket in "${TICKETS[@]}"; do
    ticket=$(echo "$ticket" | tr '[:lower:]' '[:upper:]')
    ticket_json="$OUTPUT_DIR/tickets/$ticket/ticket.json"
    [[ -f "$ticket_json" ]] || continue
    issues_json=$(echo "$issues_json" | jq \
      --argjson row "$(jq '{
        key: .key,
        summary: .fields.summary,
        status: .fields.status.name,
        type: .fields.issuetype.name,
        priority: (.fields.priority.name // "None"),
        assignee: (.fields.assignee.displayName // "Unassigned"),
        parent: (.fields.parent.key // null),
        labels: (.fields.labels // [])
      }' "$ticket_json")" \
      '. + [$row]')
  done
fi

jq -n \
  --arg createdAt "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
  --arg templatePageId "$TEMPLATE_PAGE_ID" \
  --argjson release "$RELEASE_JSON" \
  --argjson tickets "$(printf '%s\n' "${TICKETS[@]}" | jq -R . | jq -s 'map(ascii_upcase)')" \
  --argjson issues "$issues_json" \
  --argjson serviceVersions "$service_versions" \
  --argjson configChanges "$(jq '.changes' "$OUTPUT_DIR/config-prs.json")" \
  '{
    createdAt: $createdAt,
    templatePageId: $templatePageId,
    release: $release,
    tickets: $tickets,
    issues: $issues,
    serviceVersions: $serviceVersions,
    configChanges: $configChanges
  }' > "$OUTPUT_DIR/manifest.json"

PAGE_TITLE=$(bash "$SCRIPT_DIR/resolve-page-title.sh" "$OUTPUT_DIR/manifest.json")
jq --arg pageTitle "$PAGE_TITLE" '. + {pageTitle: $pageTitle}' "$OUTPUT_DIR/manifest.json" \
  > "$OUTPUT_DIR/manifest.json.tmp" && mv "$OUTPUT_DIR/manifest.json.tmp" "$OUTPUT_DIR/manifest.json"

echo ""
echo "Collected release data:"
echo "  Tickets: ${#TICKETS[@]}"
echo "  Service versions: $(jq '.serviceVersions | length' "$OUTPUT_DIR/manifest.json")"
echo "  Config changes: $(jq '.configChanges | length' "$OUTPUT_DIR/manifest.json")"
echo "  Page title: $(jq -r '.pageTitle' "$OUTPUT_DIR/manifest.json")"
echo "  Manifest: $OUTPUT_DIR/manifest.json"

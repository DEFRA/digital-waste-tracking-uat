#!/bin/bash
# Find cdp-app-config PRs linked to release tickets (including related tickets)
# Usage: ./config-prs.sh <tickets_dir> <output_file>
#
# Sources (no GITHUB_TOKEN required):
#   - Jira GitHub dev panel on release tickets
#   - Jira GitHub dev panel on related tickets
#   - cdp-app-config PR URLs in ticket descriptions and comments
#
# Optional with GITHUB_TOKEN:
#   - GitHub search for PRs mentioning ticket keys

set -e

TICKETS_DIR="${1:-}"
OUTPUT_FILE="${2:-}"

CONFIG_REPO="${CDP_CONFIG_REPO:-DEFRA/cdp-app-config}"
CONFIG_REPO_SLUG="DEFRA/cdp-app-config"
JIRA_BASE="${ATLASSIAN_BASE_URL:-https://eaflood.atlassian.net}"

if [[ -z "$TICKETS_DIR" || -z "$OUTPUT_FILE" ]]; then
  echo "Usage: ./config-prs.sh <tickets_dir> <output_file>"
  exit 1
fi

AUTH_ARGS=()
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  AUTH_ARGS=(-H "Authorization: Bearer $GITHUB_TOKEN")
fi

results="[]"
seen_prs=""

add_pr() {
  local source_ticket="$1"
  local url="$2"
  local title="$3"
  local repo="$4"
  local pr_number="$5"
  local source="$6"
  local related_ticket="${7:-}"

  [[ -z "$url" || "$url" == "null" ]] && return 0
  if echo "$seen_prs" | grep -q "|$url|"; then
    existing_index=$(echo "$results" | jq --arg url "$url" 'to_entries | map(select(.value.prUrl == $url)) | .[0].key')
    if [[ -n "$existing_index" && "$existing_index" != "null" ]]; then
      results=$(echo "$results" | jq \
        --argjson idx "$existing_index" \
        --arg ticket "$source_ticket" \
        --arg related "$related_ticket" \
        --arg source "$source" \
        '.[$idx].tickets = ((.[$idx].tickets + [$ticket]) | unique)
         | .[$idx].sources = ((.[$idx].sources + [$source]) | unique)
         | if $related != "" then .[$idx].relatedTickets = ((.[$idx].relatedTickets + [$related]) | unique) else . end')
    fi
    return 0
  fi
  seen_prs="${seen_prs}|$url|"

  config_names="[]"
  services="[]"
  environments="[]"

  if [[ -n "${GITHUB_TOKEN:-}" && -n "$pr_number" && "$pr_number" != "null" ]]; then
    pr_response=$(curl -s "${AUTH_ARGS[@]}" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$repo/pulls/$pr_number")

    if ! echo "$pr_response" | jq -e '.message' > /dev/null 2>&1; then
      if [[ -z "$title" || "$title" == "null" ]]; then
        title=$(echo "$pr_response" | jq -r '.title')
      fi

      files_response=$(curl -s "${AUTH_ARGS[@]}" \
        -H "Accept: application/vnd.github+json" \
        "https://api.github.com/repos/$repo/pulls/$pr_number/files?per_page=100")

      config_names=$(echo "$files_response" | jq '[.[]?.filename | select(. != null)] | unique')
      services=$(echo "$config_names" | jq '[.[] | split("/")[0]] | unique | map(select(length > 0))')
      environments=$(echo "$config_names" | jq '[.[] | split("/")[1] // empty] | map(select(. != "" and . != "README.md")) | unique')
    fi
  fi

  related_json='[]'
  if [[ -n "$related_ticket" ]]; then
    related_json=$(jq -n --arg related "$related_ticket" '[$related]')
  fi

  results=$(echo "$results" | jq \
    --arg ticket "$source_ticket" \
    --arg url "$url" \
    --arg title "$title" \
    --arg repo "$repo" \
    --arg source "$source" \
    --argjson relatedTickets "$related_json" \
    --argjson configNames "$config_names" \
    --argjson services "$services" \
    --argjson environments "$environments" \
    '. + [{
      tickets: [$ticket],
      relatedTickets: $relatedTickets,
      sources: [$source],
      prUrl: $url,
      prTitle: $title,
      repository: $repo,
      configNames: $configNames,
      services: $services,
      environments: $environments
    }]')
}

scan_github_json() {
  local github_json="$1"
  local release_ticket="$2"
  local related_ticket="${3:-}"
  local source="${4:-jira-dev}"

  [[ -f "$github_json" ]] || return 0

  while IFS=$'\t' read -r url repo_name title pr_id; do
    repo="${repo_name#DEFRA/}"
    repo="DEFRA/${repo}"
    pr_number="${pr_id//#/}"
    add_pr "$release_ticket" "$url" "$title" "$repo" "$pr_number" "$source" "$related_ticket"
  done < <(jq -r '.pullRequests.detail[]?.pullRequests[]? |
    select(.repositoryName | test("cdp-app-config"; "i")) |
    [.url, .repositoryName, .name, .id] | @tsv' "$github_json")
}

scan_text_files() {
  local release_ticket="$1"
  local related_ticket="${2:-}"
  local source="${3:-comment-link}"
  shift 3

  for file in "$@"; do
    [[ -f "$file" ]] || continue
    while IFS= read -r url; do
      [[ -z "$url" ]] && continue
      pr_number="${url##*/pull/}"
      add_pr "$release_ticket" "$url" "" "$CONFIG_REPO_SLUG" "$pr_number" "$source" "$related_ticket"
    done < <(grep -hoE "https://github.com/${CONFIG_REPO_SLUG}/pull/[0-9]+" "$file" | sort -u)
  done
}

for ticket_dir in "$TICKETS_DIR"/*/; do
  [[ -d "$ticket_dir" ]] || continue
  release_ticket=$(basename "$ticket_dir")

  scan_github_json "$ticket_dir/github.json" "$release_ticket" "" "jira-dev"
  scan_text_files "$release_ticket" "" "comment-link" \
    "$ticket_dir/ticket.txt" \
    "$ticket_dir/comments.txt" \
    "$ticket_dir/github.txt"

  for related_dir in "$ticket_dir/related"/*/; do
    [[ -d "$related_dir" ]] || continue
    related_ticket=$(basename "$related_dir")

    scan_github_json "$related_dir/github.json" "$release_ticket" "$related_ticket" "related-jira-dev"
    scan_text_files "$release_ticket" "$related_ticket" "related-comment-link" \
      "$related_dir/ticket.txt" \
      "$related_dir/comments.txt"
  done
done

if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  for ticket_dir in "$TICKETS_DIR"/*/; do
    [[ -d "$ticket_dir" ]] || continue
    release_ticket=$(basename "$ticket_dir")

    search_response=$(curl -s "${AUTH_ARGS[@]}" \
      "https://api.github.com/search/issues?q=repo:${CONFIG_REPO_SLUG}+is:pr+${release_ticket}&per_page=20")

    if echo "$search_response" | jq -e '.items' > /dev/null 2>&1; then
      while IFS=$'\t' read -r url title pr_number; do
        add_pr "$release_ticket" "$url" "$title" "$CONFIG_REPO_SLUG" "$pr_number" "github-search" ""
      done < <(echo "$search_response" | jq -r '.items[] | [.html_url, .title, (.html_url | capture(".*/pull/(?<n>[0-9]+)$").n)] | @tsv')
    fi
  done
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"
echo "$results" | jq '{
  repository: "'"$CONFIG_REPO_SLUG"'",
  configRepoUrl: "https://github.com/'"$CONFIG_REPO_SLUG"'/tree/main",
  count: length,
  changes: .
}' > "$OUTPUT_FILE"

echo "Config PRs found: $(echo "$results" | jq 'length')"
echo "Saved: $OUTPUT_FILE"

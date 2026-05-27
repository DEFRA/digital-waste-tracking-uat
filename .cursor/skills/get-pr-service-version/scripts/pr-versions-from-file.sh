#!/bin/bash
# Resolve minted versions for PR URLs listed in a file (e.g. github.txt from get-jira-ticket)
# Usage: ./pr-versions-from-file.sh <file> [output_dir]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT_FILE="${1:-}"
OUTPUT_DIR="${2:-}"

if [[ -z "$INPUT_FILE" || ! -f "$INPUT_FILE" ]]; then
  echo "Usage: ./pr-versions-from-file.sh <file> [output_dir]"
  exit 1
fi

if [[ -n "$OUTPUT_DIR" ]]; then
  mkdir -p "$OUTPUT_DIR"
  OUT_FILE="$OUTPUT_DIR/service-versions.txt"
  JSON_FILE="$OUTPUT_DIR/service-versions.json"
else
  OUT_FILE=""
  JSON_FILE=""
fi

RESULTS="[]"
FOUND=0
FAILED=0
PR_OUTPUTS=""

while IFS= read -r url; do
  [[ -z "$url" ]] && continue

  if output=$(bash "$SCRIPT_DIR/pr-version.sh" "$url" 2>&1); then
    FOUND=$((FOUND + 1))
    status="ok"
  else
    FAILED=$((FAILED + 1))
    status="error"
  fi

  if [[ -n "$OUT_FILE" ]]; then
    PR_OUTPUTS="${PR_OUTPUTS}${output}"$'\n\n'
  else
    echo "$output"
    echo ""
  fi

  tag=$(echo "$output" | sed -n 's/^Version: //p' | head -1)
  repo=$(echo "$output" | sed -n 's/^=== PR DEFRA\/\([^#]*\)#.*/\1/p' | head -1)
  pr_num=$(echo "$output" | sed -n 's/^=== PR DEFRA\/[^#]*#\([0-9]*\) ===/\1/p' | head -1)

  version_json="null"
  if [[ -n "$tag" && "$tag" != "(not found on merge commit)" && "$tag" != "(not applicable — not a CDP service repo)" ]]; then
    version_json=$(jq -n --arg tag "$tag" '$tag')
  fi

  RESULTS=$(echo "$RESULTS" | jq \
    --arg url "$url" \
    --arg status "$status" \
    --arg repo "$repo" \
    --arg pr "$pr_num" \
    --argjson version "$version_json" \
    --arg output "$output" \
    '. + [{url: $url, status: $status, repo: $repo, pr: $pr, version: $version, details: $output}]')
done < <(grep -Eo 'https://github.com/[^ ]+/pull/[0-9]+' "$INPUT_FILE" | sort -u)

SUMMARY="Resolved $FOUND PR(s), $FAILED failed"

if [[ -n "$OUT_FILE" ]]; then
  {
    echo "=== Service versions summary ==="
    echo "Source: $INPUT_FILE"
    echo "Fetched: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "$SUMMARY"
    echo ""
    printf '%s' "$PR_OUTPUTS"
  } > "$OUT_FILE"

  echo "$RESULTS" | jq '.' > "$JSON_FILE"
  echo "$SUMMARY"
  echo "Saved: $OUT_FILE"
  echo "Saved: $JSON_FILE"
else
  echo "$SUMMARY"
fi

#!/bin/bash
# Resolve minted CDP service version for a merged GitHub PR
# Usage: ./pr-version.sh <pr_url_or_owner/repo#number>
#
# Examples:
#   ./pr-version.sh https://github.com/DEFRA/waste-movement-backend/pull/113
#   ./pr-version.sh DEFRA/waste-movement-backend 113

set -e

INPUT="${1:-}"
PR_NUMBER="${2:-}"

GITHUB_ORG="${GITHUB_ORG:-DEFRA}"

SERVICE_REPOS="waste-movement-backend waste-movement-external-api waste-tracking-id-backend"

if [[ -z "$INPUT" ]]; then
  echo "Usage: ./pr-version.sh <pr_url> OR ./pr-version.sh <owner/repo> <pr_number>"
  exit 1
fi

if [[ "$INPUT" =~ ^https?://github.com/ ]]; then
  if [[ "$INPUT" =~ github.com/([^/]+)/([^/]+)/pull/([0-9]+) ]]; then
    GITHUB_ORG="${BASH_REMATCH[1]}"
    REPO="${BASH_REMATCH[2]}"
    PR_NUMBER="${BASH_REMATCH[3]}"
  else
    echo "Error: unable to parse PR URL: $INPUT"
    exit 1
  fi
elif [[ -n "$PR_NUMBER" ]]; then
  if [[ "$INPUT" =~ / ]]; then
    GITHUB_ORG="${INPUT%%/*}"
    REPO="${INPUT#*/}"
  else
    REPO="$INPUT"
  fi
else
  echo "Error: provide PR URL or owner/repo and PR number"
  exit 1
fi

AUTH_ARGS=()
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  AUTH_ARGS=(-H "Authorization: Bearer $GITHUB_TOKEN")
fi

pr_response=$(curl -s "${AUTH_ARGS[@]}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$GITHUB_ORG/$REPO/pulls/$PR_NUMBER")

if echo "$pr_response" | jq -e '.message' > /dev/null 2>&1; then
  echo "Error: $(echo "$pr_response" | jq -r '.message')"
  exit 1
fi

merged=$(echo "$pr_response" | jq -r '.merged')
if [[ "$merged" != "true" ]]; then
  echo "Error: PR $GITHUB_ORG/$REPO#$PR_NUMBER is not merged"
  exit 1
fi

TITLE=$(echo "$pr_response" | jq -r '.title')
MERGE_SHA=$(echo "$pr_response" | jq -r '.merge_commit_sha')
MERGED_AT=$(echo "$pr_response" | jq -r '.merged_at')
PR_URL=$(echo "$pr_response" | jq -r '.html_url')

is_service=false
for service_repo in $SERVICE_REPOS; do
  if [[ "$REPO" == "$service_repo" ]]; then
    is_service=true
    break
  fi
done

TAG=""
if [[ "$is_service" == true ]]; then
  PAGE=1
  while [[ -z "$TAG" && $PAGE -le 10 ]]; do
    tags_response=$(curl -s "${AUTH_ARGS[@]}" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$GITHUB_ORG/$REPO/tags?per_page=100&page=$PAGE")

    TAG=$(echo "$tags_response" | jq -r --arg sha "$MERGE_SHA" '.[] | select(.commit.sha == $sha) | .name' | head -1)

    tag_count=$(echo "$tags_response" | jq 'length')
    if [[ "$tag_count" -lt 100 ]]; then
      break
    fi
    PAGE=$((PAGE + 1))
  done
fi

{
  echo "=== PR $GITHUB_ORG/$REPO#$PR_NUMBER ==="
  echo "Title: $TITLE"
  echo "URL: $PR_URL"
  echo "Merged: $MERGED_AT"
  echo "Merge commit: $MERGE_SHA"
  echo "Service repo: $is_service"
  echo ""

  if [[ -n "$TAG" ]]; then
    echo "Version: $TAG"
  else
    if [[ "$is_service" == true ]]; then
      echo "Version: (not found on merge commit)"
      echo "Note: CDP service repos should tag the merge commit when Publish workflow runs."
      echo "Check the Publish workflow run on main for this merge."
    else
      echo "Version: (not applicable — not a CDP service repo)"
      echo "Note: $REPO does not mint CDP service versions on merge."
    fi
  fi
}

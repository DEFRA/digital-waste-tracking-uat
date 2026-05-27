#!/bin/bash
# Resolve a Confluence content ID from a numeric ID, page URL, or folder URL
# Usage: resolve-content-id.sh CONTENT_ID_OR_URL

set -e

INPUT="${1:-}"

if [[ -z "$INPUT" ]]; then
  echo "Usage: resolve-content-id.sh CONTENT_ID_OR_URL" >&2
  exit 1
fi

if [[ "$INPUT" =~ ^https?:// ]]; then
  if [[ "$INPUT" =~ /folder/([0-9]+) ]]; then
    CONTENT_ID="${BASH_REMATCH[1]}"
  elif [[ "$INPUT" =~ /pages/([0-9]+) ]]; then
    CONTENT_ID="${BASH_REMATCH[1]}"
  else
    CONTENT_ID=$(echo "$INPUT" | sed -E 's#.*/(pages|folder)/([0-9]+).*#\2#')
  fi
else
  CONTENT_ID="$INPUT"
fi

if ! [[ "$CONTENT_ID" =~ ^[0-9]+$ ]]; then
  echo "Error: unable to determine content id from input: $INPUT" >&2
  exit 1
fi

echo "$CONTENT_ID"

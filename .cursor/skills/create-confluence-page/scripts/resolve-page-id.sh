#!/bin/bash
# Resolve a Confluence content ID from a numeric ID, page URL, or folder URL
# Usage: resolve-page-id.sh CONTENT_ID_OR_URL

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GET_RESOLVE="$SCRIPT_DIR/../../get-confluence-page/scripts/resolve-content-id.sh"

exec bash "$GET_RESOLVE" "$1"

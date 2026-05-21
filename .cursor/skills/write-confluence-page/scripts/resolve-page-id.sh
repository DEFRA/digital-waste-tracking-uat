#!/bin/bash
# Resolve a Confluence content ID from a numeric ID, page URL, or folder URL
# Usage: resolve-page-id.sh CONTENT_ID_OR_URL

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
READ_RESOLVE="$SCRIPT_DIR/../../read-confluence-page/scripts/resolve-content-id.sh"

exec bash "$READ_RESOLVE" "$1"

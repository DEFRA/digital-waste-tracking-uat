#!/bin/bash
# Derive Confluence page title: DWTA - Release X
# Usage: ./resolve-page-title.sh <manifest.json>
#
# X is taken from the Jira fix version name (e.g. "Release 4" -> "DWTA - Release 4").
# Requires release metadata in manifest — ticket-only input cannot produce a valid title.

set -e

MANIFEST="${1:-}"

if [[ -z "$MANIFEST" || ! -f "$MANIFEST" ]]; then
  echo "Usage: ./resolve-page-title.sh <manifest.json>"
  exit 1
fi

python3 - "$MANIFEST" <<'PY'
import json
import re
import sys

manifest = json.load(open(sys.argv[1]))
release = manifest.get("release") or {}
name = (release.get("name") or "").strip()

if not name:
    print("Error: cannot derive page title — collect with --release and a Jira fix version", file=sys.stderr)
    print("Title must be: DWTA - Release X (matching the template)", file=sys.stderr)
    sys.exit(1)

match = re.match(r"^Release\s+(.+)$", name, re.IGNORECASE)
suffix = match.group(1).strip() if match else name.strip()

title = f"DWTA - Release {suffix}"

if re.search(r"release note", title, re.IGNORECASE):
    print(f"Error: invalid title derived from fix version: {title}", file=sys.stderr)
    sys.exit(1)

if not re.fullmatch(r"DWTA - Release .+", title):
    print(f"Error: title does not match required pattern DWTA - Release X: {title}", file=sys.stderr)
    sys.exit(1)

print(title)
PY

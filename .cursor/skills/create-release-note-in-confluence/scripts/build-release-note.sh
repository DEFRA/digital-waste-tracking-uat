#!/bin/bash
# Build a Confluence release note draft from collected data and the WTPG template
# Usage: ./build-release-note.sh <data_dir> <draft_dir>
#
# Page title is always derived as "DWTA - Release X" from manifest.json

set -e

DATA_DIR="${1:-}"
DRAFT_DIR="${2:-}"

PARENT_PAGE_ID="${RELEASE_NOTE_PARENT_ID:-6518178160}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JIRA_BASE="${ATLASSIAN_BASE_URL:-https://eaflood.atlassian.net}"
GITHUB_ORG="${GITHUB_ORG:-DEFRA}"

if [[ -z "$DATA_DIR" || -z "$DRAFT_DIR" ]]; then
  echo "Usage: ./build-release-note.sh <data_dir> <draft_dir>"
  exit 1
fi

if [[ ! -f "$DATA_DIR/manifest.json" || ! -f "$DATA_DIR/template.html" ]]; then
  echo "Error: run collect-release-data.sh first — missing manifest.json or template.html"
  exit 1
fi

mkdir -p "$DRAFT_DIR"

PAGE_TITLE=$(bash "$SCRIPT_DIR/resolve-page-title.sh" "$DATA_DIR/manifest.json")

python3 - "$DATA_DIR" "$DRAFT_DIR" "$PAGE_TITLE" "$PARENT_PAGE_ID" "$JIRA_BASE" "$GITHUB_ORG" <<'PY'
import html
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

data_dir = Path(sys.argv[1])
draft_dir = Path(sys.argv[2])
page_title = sys.argv[3]
parent_page_id = sys.argv[4]
jira_base = sys.argv[5]
github_org = sys.argv[6]

manifest = json.loads((data_dir / "manifest.json").read_text())
template = (data_dir / "template.html").read_text()

now = datetime.now(timezone.utc).strftime("%d/%m/%y %H:%M UTC")
release = manifest.get("release") or {}
issues = manifest.get("issues") or []
service_versions = manifest.get("serviceVersions") or []
config_changes = manifest.get("configChanges") or []

def link(url, text):
    safe_url = html.escape(url, quote=True)
    safe_text = html.escape(text)
    return f'<a href="{safe_url}">{safe_text}</a>'

created_date_line = (
    f"Release note created: {now}<br />"
    "Release scheduled for: XX/XX/XX XX:XX<br />"
    "Release concluded: XX/XX/XX XX:XX"
)

def build_jql(manifest):
    release = manifest.get("release") or {}
    if release.get("id"):
        return f'project in (DWTA) and fixVersion = {release["id"]} ORDER BY created DESC '
    tickets = manifest.get("tickets") or []
    if tickets:
        keys = ", ".join(tickets)
        return f"project in (DWTA) and key in ({keys}) ORDER BY created DESC "
    return "project in (DWTA) ORDER BY created DESC "

def jql_fix_version_token(manifest):
    release = manifest.get("release") or {}
    if release.get("id"):
        return str(release["id"])
    if release.get("name"):
        return f'"{release["name"]}"'
    tickets = manifest.get("tickets") or []
    if tickets:
        return ", ".join(tickets)
    return "EnterFixVersionFromReleaseNoteHere"

jql = build_jql(manifest)
jql_token = jql_fix_version_token(manifest)
encoded_jql = quote(jql, safe="")

if release.get("url"):
    release_label = release.get("name") or "Release"
    if release.get("id"):
        release_label = f'{release_label} ({release["id"]})'
    release_intro_html = f"<p>Release: {link(release['url'], release_label)}</p>"
else:
    ticket_links = ", ".join(
        link(f"{jira_base}/browse/{t}", t) for t in manifest.get("tickets", [])
    )
    release_intro_html = f"<p>Tickets: {ticket_links}</p>"

service_items = []
for svc in sorted(service_versions, key=lambda x: x.get("repo", "")):
    repo = svc["repo"]
    version = svc["version"]
    current_placeholder = "0.yyy.0"
    service_items.append(
        "<li><p>"
        f"{html.escape(repo)} "
        f"[{link(f'https://github.com/{github_org}/{repo}/releases/tag/{current_placeholder}', current_placeholder)} "
        f"&rarr; {link(f'https://github.com/{github_org}/{repo}/releases/tag/{version}', version)} ]"
        "</p></li>"
    )

if service_items:
    services_html = f"<ol>{''.join(service_items)}</ol>"
else:
    services_html = (
        "<ol><li><p>some-microservice "
        f"[{link(f'https://github.com/{github_org}/xxx/releases/tag/0.yyy.0', '0.yyy.0')} "
        f"&rarr; {link(f'https://github.com/{github_org}/xxx/releases/tag/0.zzz.0', '0.zzz.0')} ]"
        "</p></li></ol><p><em>No service versions resolved from linked PRs.</em></p>"
    )

config_items = []
if config_changes:
    for change in config_changes:
        ticket_keys = change.get("tickets") or []
        if change.get("ticket"):
            ticket_keys = ticket_keys + [change.get("ticket")]
        ticket_links = ", ".join(
            link(f"{jira_base}/browse/{t}", t) for t in sorted(set(ticket_keys)) if t
        )
        related = change.get("relatedTickets") or []
        related_links = ", ".join(
            link(f"{jira_base}/browse/{t}", t) for t in sorted(set(related)) if t
        )
        config_names = change.get("configNames") or []
        services = change.get("services") or []
        environments = change.get("environments") or []
        config_name = ", ".join(config_names) if config_names else "See PR"
        service_list = ", ".join(services) if services else "See PR"
        env_list = ", ".join(environments) if environments else "ext-test and/or prod"
        pr_title = change.get("prTitle") or change.get("prUrl", "")
        pr_link = link(change.get("prUrl", ""), pr_title)

        related_line = ""
        if related_links:
            related_line = f"<li><p>Related tickets: {related_links}</p></li>"

        config_items.append(
            "<li><ol>"
            f"<li><p>Tickets: {ticket_links}</p></li>"
            f"{related_line}"
            f"<li><p>Config Name: {html.escape(config_name)}</p></li>"
            f"<li><p>Services: {html.escape(service_list)}</p></li>"
            f"<li><p>Environments: {html.escape(env_list)}</p></li>"
            f"<li><p>PR: {pr_link}</p></li>"
            f"<li><p>Config repo: {link('https://github.com/DEFRA/cdp-app-config/tree/main', 'DEFRA/cdp-app-config')}</p></li>"
            "</ol></li>"
        )
    config_html = f"<ol>{''.join(config_items)}</ol>"
else:
    config_html = (
        "<ol><li><ol>"
        "<li><p>Tickets: (none identified)</p></li>"
        "<li><p>Config Name: none</p></li>"
        "<li><p>Services: none</p></li>"
        "<li><p>Environments: ext-test and/or prod</p></li>"
        "<li><p>PR: none — no "
        f"{link('https://github.com/DEFRA/cdp-app-config/tree/main', 'cdp-app-config')} "
        "PRs found for these tickets</p></li>"
        "</ol></li></ol>"
    )

body = template
body = body.replace(
    "Release note created: XX/XX/XX XX:XX<br />Release scheduled for: XX/XX/XX XX:XX<br />Release concluded: XX/XX/XX XX:XX",
    created_date_line,
)

import re

if "{{Obtain a link from" in body:
    body = re.sub(
        r'<p local-id="5211d9639e9c">.*?</p>',
        release_intro_html,
        body,
        count=1,
        flags=re.DOTALL,
    )

body = body.replace("EnterFixVersionFromReleaseNoteHere", jql_token)

issues_jql_href = f"{jira_base}/issues/?jql={encoded_jql}"
body = re.sub(
    r'href="https://eaflood\.atlassian\.net/issues/\?jql=[^"]+"',
    f'href="{issues_jql_href}"',
    body,
    count=1,
)
body = re.sub(
    r'>https://eaflood\.atlassian\.net/issues/\?jql=[^<]+</a>',
    f">{html.escape(issues_jql_href)}</a>",
    body,
    count=1,
)

services_marker = "some-microservice"
if services_marker in body:
    start = body.index("<tr ac:local-id=\"c4684cfe-b0aa-4f90-91b3-6d5eb70d326f\">")
    end = body.index("</tr>", start) + len("</tr>")
    replacement = (
        '<tr ac:local-id="c4684cfe-b0aa-4f90-91b3-6d5eb70d326f">'
        '<td ac:local-id="075c99ae-5b3c-4b37-af0f-3f3149e14af9">'
        '<p local-id="9bf06f06-0663-4081-afec-48df3400998f">Services and Versions</p></td>'
        f'<td ac:local-id="d915e949-7e5c-4d9f-bd4c-5f42f3c976b2">{services_html}</td>'
        "</tr>"
    )
    body = body[:start] + replacement + body[end:]

config_marker = "Tickets: DWT-xxx"
if config_marker in body:
    start = body.index("<tr ac:local-id=\"d64271c5-3a4d-4386-b3e7-137f32c66ef2\">")
    end = body.index("</tr>", start) + len("</tr>")
    replacement = (
        '<tr ac:local-id="d64271c5-3a4d-4386-b3e7-137f32c66ef2">'
        '<td ac:local-id="dc7bad17-b770-4eb8-b172-46cf168bb6c6">'
        '<p local-id="2e0c0a90-cdce-49f5-8928-a2f1c39b678e">Are there any config changes?</p></td>'
        f'<td ac:local-id="cd68e3a7-1b7d-43ee-ad98-3f327f176fde">{config_html}</td>'
        "</tr>"
    )
    body = body[:start] + replacement + body[end:]

(draft_dir / "page.html").write_text(body)
(draft_dir / "meta.txt").write_text(
    "\n".join([
        f"parent_id: {parent_page_id}",
        f"parent_url: https://eaflood.atlassian.net/wiki/spaces/WTPG/pages/{parent_page_id}",
        f"template_page_id: {manifest.get('templatePageId', '')}",
        f"title: {page_title}",
        "action: create",
        f"created_at: {manifest.get('createdAt', '')}",
    ]) + "\n"
)

print(f"Draft title: {page_title}")
print(f"Draft body: {draft_dir / 'page.html'}")
print(f"Draft meta: {draft_dir / 'meta.txt'}")
PY

echo "Review the draft, then publish with create-confluence-page after user confirmation."

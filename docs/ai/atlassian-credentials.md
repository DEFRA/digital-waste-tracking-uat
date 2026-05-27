# Atlassian credentials setup

Overview of all Cursor skills: [.cursor/skills/README.md](../.cursor/skills/README.md).

Scripts under `.cursor/skills/get-jira-ticket/scripts/`, `.cursor/skills/get-jira-release/scripts/`, `.cursor/skills/create-jira-release/scripts/`, `.cursor/skills/get-confluence-page/scripts/`, and `.cursor/skills/create-confluence-page/scripts/` require Atlassian API credentials.

## Required environment variables

| Variable          | Value                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `ATLASSIAN_USER`  | Your Atlassian account email                                                                                                      |
| `ATLASSIAN_TOKEN` | API token from [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |

Use a token created via "Create API token" (not the scoped variant) so it covers both Jira and Confluence.

## Where to set them

Put the exports in `~/.zshenv` (zsh users):

```sh
# ~/.zshenv
export ATLASSIAN_USER=your.name@example.com
export ATLASSIAN_TOKEN=your-atlassian-api-token
```

`~/.zshenv` is loaded by every zsh invocation, so scripts run from Cursor terminals will see the vars.

For bash users, add the same exports to `~/.bash_profile` (or `~/.bashrc`).

## Verify Jira

```bash
mkdir -p .tmp/jira-tickets/DWT-123/attachments
bash .cursor/skills/get-jira-ticket/scripts/ticket.sh DWT-123 full > .tmp/jira-tickets/DWT-123/ticket.txt
bash .cursor/skills/get-jira-ticket/scripts/comments.sh DWT-123 list > .tmp/jira-tickets/DWT-123/comments.txt
bash .cursor/skills/get-jira-ticket/scripts/attachments.sh DWT-123 .tmp/jira-tickets/DWT-123/attachments
```

Replace `DWT-123` with a ticket you can access.

## Verify Jira release

```bash
mkdir -p .tmp/jira-releases/38223
bash .cursor/skills/get-jira-release/scripts/release.sh 38223 full > .tmp/jira-releases/38223/release.txt
bash .cursor/skills/get-jira-release/scripts/release-issues.sh 38223 .tmp/jira-releases/38223
```

Replace `38223` with a fix version ID or use the full release URL from Jira.

## Verify Jira release create (dry run)

```bash
mkdir -p .tmp/jira-releases/new
cat > .tmp/jira-releases/new/description.md <<'EOF'
## Summary

Draft release for testing the create-jira-release skill.
EOF

bash .cursor/skills/create-jira-release/scripts/create-release.sh \
  .tmp/jira-releases/new \
  --project DWTA \
  --release-name "Release test" \
  --release-date 2026-05-20 \
  --tickets "DWTA-154,DWTA-155" \
  --description-file .tmp/jira-releases/new/description.md \
  --dry-run
```

Remove `--dry-run` only after confirming the release name and tickets are correct.

## Verify Related work link (optional)

```bash
bash .cursor/skills/create-jira-release/scripts/link-related-work.sh \
  39317 \
  "https://eaflood.atlassian.net/wiki/spaces/WTPG/pages/6518114167" \
  --title "DWTA - Release 4"
```

## Verify release note draft (no publish)

```bash
bash .cursor/skills/create-release-note-in-confluence/scripts/collect-release-data.sh \
  .tmp/release-notes/38223 --release 38223
bash .cursor/skills/create-release-note-in-confluence/scripts/build-release-note.sh \
  .tmp/release-notes/38223 .tmp/confluence-drafts/dwta-release-4
```

Review `.tmp/confluence-drafts/dwta-release-4/page.html` before publishing.

## Verify Confluence read (folder)

```bash
bash .cursor/skills/get-confluence-page/scripts/folder-contents.sh \
  "https://eaflood.atlassian.net/wiki/spaces/WTPG/folder/6483182044" \
  .tmp/confluence-folders/6483182044
```

## Verify Confluence read (single page)

```bash
bash .cursor/skills/get-confluence-page/scripts/page.sh <page_id> summary
```

## Verify Confluence create (draft only)

```bash
# Draft locally first — do not run create-page.sh without user confirmation
bash .cursor/skills/create-confluence-page/scripts/create-page.sh <parent_page_id> "Draft title" .tmp/confluence-drafts/example/page.html
```

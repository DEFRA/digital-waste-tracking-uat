---
name: read-jira-ticket
description: Fetch a Jira ticket's details (summary, description, comments, attachments, GitHub PRs/commits, epic, and related tickets) by ticket ID and save everything to .tmp for analysis. Use whenever another skill or task needs to read a Jira ticket in this repository.
---

## Parameters

`args` is the Jira ticket ID, e.g. `DWT-624` or `DWTA-166`.

## Steps

1. From the repo root, create the output directory and run all scripts. Replace `<ticket>` with the ticket ID (e.g. `DWT-624`):

   ```bash
   mkdir -p .tmp/jira-tickets/<ticket>/attachments

   bash .cursor/skills/read-jira-ticket/scripts/ticket.sh <ticket> full > .tmp/jira-tickets/<ticket>/ticket.txt
   bash .cursor/skills/read-jira-ticket/scripts/ticket.sh <ticket> json > .tmp/jira-tickets/<ticket>/ticket.json
   bash .cursor/skills/read-jira-ticket/scripts/comments.sh <ticket> list > .tmp/jira-tickets/<ticket>/comments.txt
   bash .cursor/skills/read-jira-ticket/scripts/comments.sh <ticket> json > .tmp/jira-tickets/<ticket>/comments.json
   bash .cursor/skills/read-jira-ticket/scripts/attachments.sh <ticket> .tmp/jira-tickets/<ticket>/attachments
   bash .cursor/skills/read-jira-ticket/scripts/github-dev.sh <ticket> .tmp/jira-tickets/<ticket>
   bash .cursor/skills/read-jira-ticket/scripts/related-tickets.sh <ticket> .tmp/jira-tickets/<ticket>
   ```

   Requires `ATLASSIAN_USER` and `ATLASSIAN_TOKEN` env vars. See [atlassian-credentials.md](../../../docs/ai/atlassian-credentials.md).

   Output under `.tmp/jira-tickets/<ticket>/`:

   | File / folder                    | Contents                                                                   |
   | -------------------------------- | -------------------------------------------------------------------------- |
   | `ticket.txt` / `ticket.json`     | Primary issue                                                              |
   | `comments.txt` / `comments.json` | Primary issue comments                                                     |
   | `attachments/`                   | Downloaded attachment files                                                |
   | `github.txt` / `github.json`     | Linked PRs, commits, changed files, CI builds from Jira GitHub integration |
   | `related/index.txt`              | Why each related ticket was fetched                                        |
   | `related/<KEY>/`                 | Full ticket + comments for parent, linked issues, subtasks (max 10)        |
   | `epic/`                          | Epic description, comments, and sibling issue list (when an epic is found) |

2. **If any script fails, stop immediately.** Report the exact error to the user and ask them to fix credentials before retrying. Do not guess ticket contents from memory or scrape the Jira UI.

   Note: `github-dev.sh` may return empty PR/commit sections if nothing is linked in Jira's development panel — that is not an error.

3. **Read every file** under `.tmp/jira-tickets/<ticket>/` — especially `comments.txt`, `github.txt`, `related/`, `epic/`, and `attachments/`. Acceptance criteria, PR changes, and scope often live in comments, GitHub links, the epic, or linked tickets.

4. Return the full contents to the caller. Do not summarise or filter — the caller needs complete ticket details to do its job.

## Scripts

| Script               | Purpose                                                                          |
| -------------------- | -------------------------------------------------------------------------------- |
| `ticket.sh`          | Issue details                                                                    |
| `comments.sh`        | Issue comments                                                                   |
| `attachments.sh`     | Download attachment files                                                        |
| `github-dev.sh`      | GitHub PRs, commits, changed files, and CI builds (Jira dev-status API)          |
| `related-tickets.sh` | Parent, linked issues, subtasks, and epic context (requires `ticket.json` first) |
| `epic-issues.sh`     | List all issues in an epic (called by `related-tickets.sh`)                      |

Set `JIRA_MAX_RELATED=20` to fetch more than the default 10 related tickets.

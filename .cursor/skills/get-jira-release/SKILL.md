---
name: get-jira-release
description: Get a Jira fix version (release) and its work items by version ID, release URL, or project + version name. Use when the user asks for release contents, fix version issues, or a Jira release report like DWTA versions.
---

# Get Jira release

Reads fix version metadata and all work items assigned to that version. Does not modify Jira.

## Parameters

`args` is one of:

| Input type   | Example                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------ |
| Release URL  | `https://eaflood.atlassian.net/projects/DWTA/versions/38223/tab/release-report-all-issues` |
| Version ID   | `38223`                                                                                    |
| Project+name | Project key `DWTA` and version name (second argument)                                      |

## Steps

1. From the repo root, create the output directory and run all scripts. Replace `<version>` with the ID or URL:

   ```bash
   mkdir -p .tmp/jira-releases/<version-id>

   bash .cursor/skills/get-jira-release/scripts/release.sh <version> full \
     > .tmp/jira-releases/<version-id>/release.txt
   bash .cursor/skills/get-jira-release/scripts/release.sh <version> json \
     > .tmp/jira-releases/<version-id>/release.json
   bash .cursor/skills/get-jira-release/scripts/release-issues.sh <version> \
     .tmp/jira-releases/<version-id>
   ```

   For project key + version name:

   ```bash
   bash .cursor/skills/get-jira-release/scripts/release.sh DWTA "Release name" full \
     > .tmp/jira-releases/<version-id>/release.txt
   bash .cursor/skills/get-jira-release/scripts/release-issues.sh DWTA "Release name" \
     .tmp/jira-releases/<version-id>
   ```

   Requires `ATLASSIAN_USER` and `ATLASSIAN_TOKEN`. See [atlassian-credentials.md](../../../docs/ai/atlassian-credentials.md).

   Output under `.tmp/jira-releases/<version-id>/`:

   | File / folder                  | Contents                                      |
   | ------------------------------ | --------------------------------------------- |
   | `release.txt` / `release.json` | Release metadata (name, dates, released flag) |
   | `issues.txt` / `issues.json`   | All work items in the release                 |

2. **If any script fails, stop immediately.** Report the exact error to the user. Do not guess release contents from memory or scrape the Jira UI.

3. **Read every file** under `.tmp/jira-releases/<version-id>/`. The work items list is the primary output — use `issues.txt` for the human-readable table and `issues.json` for structured data.

4. Return the full contents to the caller. Do not summarise or filter unless the user asked for a summary only.

## Scripts

| Script                  | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `resolve-release-id.sh` | Parse version ID from URL, ID, or project + name |
| `release.sh`            | Release metadata (`full`, `summary`, `json`)     |
| `release-issues.sh`     | Paginated work items assigned to the fix version |

Set `JIRA_RELEASE_MAX_ISSUES=100` to change pagination page size (default 100).

## Examples

```
/get-jira-release https://eaflood.atlassian.net/projects/DWTA/versions/38223/tab/release-report-all-issues
/get-jira-release 38223
/get-jira-release DWTA "Sprint 42 Release"
```

## Related skills

- [get-jira-ticket](../get-jira-ticket/SKILL.md) — full details for individual tickets from the release
- [get-pr-service-version](../get-pr-service-version/SKILL.md) — minted service versions for merged PRs linked to release tickets
- [create-jira-release](../create-jira-release/SKILL.md) — create or update a fix version and assign tickets
- [create-release-note-in-confluence](../create-release-note-in-confluence/SKILL.md) — formatted release note from this release

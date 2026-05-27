---
name: create-jira-release
description: Create or update a Jira fix version (release) from a release name, release date, ticket list, and description. Assigns tickets to the fix version. Use when batching DWTA work items into a Jira release, or when another skill needs to create the Jira side of a release workflow.
---

# Create Jira release

Creates or updates a Jira **fix version** (release) such as [Release 4](https://eaflood.atlassian.net/projects/DWTA/versions/38223). In Jira this is the fix version **`name`** (shown as the release title in the UI) and **`releaseDate`**. Today Confluence holds the main release note; Jira releases batch tickets. This skill is composable — other skills (e.g. [create-release-note-in-confluence](../create-release-note-in-confluence/SKILL.md)) can call it to create the Jira release first.

## Parameters

| Parameter                           | Required            | Jira field             | Example                      |
| ----------------------------------- | ------------------- | ---------------------- | ---------------------------- |
| **Release name** (`--release-name`) | Yes for **create**  | `name`                 | `Release 5`                  |
| **Release date** (`--release-date`) | Yes for **create**  | `releaseDate`          | `2026-05-20`                 |
| Ticket list (`--tickets`)           | Yes                 | (assigns `fixVersion`) | `DWTA-154,DWTA-155,DWTA-157` |
| Description                         | Yes                 | `description`          | Markdown file or inline text |
| Project key (`--project`)           | No (default `DWTA`) | `projectId`            | `DWTA`                       |
| Version ID / URL (`--version`)      | Yes for **update**  | —                      | `38223` or release URL       |

`--name` is an alias for `--release-name`.

Optional on **update** only:

| Parameter        | Default     | Purpose                                           |
| ---------------- | ----------- | ------------------------------------------------- |
| `--release-date` | (unchanged) | Set a new release date on an existing fix version |

Other optional flags:

| Parameter                 | Default         | Purpose                                                  |
| ------------------------- | --------------- | -------------------------------------------------------- |
| `--description-format`    | `markdown`      | Input format: `markdown`, `wiki`, `text`, `html`         |
| `--released`              | `false`         | Mark fix version as released                             |
| `--related-work-url`      | (none)          | Link a Confluence page (or URL) in Jira **Related work** |
| `--related-work-title`    | `Release notes` | Title shown for the Related work link                    |
| `--related-work-category` | `Documentation` | Related work category in Jira                            |
| `--dry-run`               | —               | Validate only; no Jira writes                            |

Release date format: **`YYYY-MM-DD`** (ISO date, no time component).

## Description format

Jira fix version descriptions are a **plain text API field**. They do not accept Confluence storage HTML or ADF. Wiki markup is converted for storage but **may display as plain text** in the Jira UI (including tables).

| Input                      | Handling                                                              |
| -------------------------- | --------------------------------------------------------------------- |
| **Markdown** (recommended) | Converted to Jira wiki markup (`h2.`, `*bold*`, `[text\|url]`, lists) |
| **Wiki**                   | Sent as-is                                                            |
| **Text**                   | Sent as-is                                                            |
| **HTML**                   | Stripped to plain text (structure preserved with line breaks)         |

Callers should author descriptions in **markdown** so future release-note layouts can reuse the same source file. When the Confluence release note skill matures, it can read the same markdown and render the Confluence template separately.

## Related work (optional formatted link)

The **Give this section a name** rich text block on the Jira release page cannot be set via API. To surface formatted release notes on the release page, link a Confluence page as **Related work** instead (Atlassian’s supported pattern).

Pass `--related-work-url` when you already have a Confluence page URL (typically after publishing the release note):

```bash
bash .cursor/skills/create-jira-release/scripts/create-release.sh \
  .tmp/jira-releases/38223 \
  --version 38223 \
  --release-date 2026-05-13 \
  --tickets "DWTA-189" \
  --description-file .tmp/jira-releases/38223/description.md \
  --related-work-url "https://eaflood.atlassian.net/wiki/spaces/WTPG/pages/6518114167" \
  --related-work-title "DWTA - Release 4"
```

Or link separately:

```bash
bash .cursor/skills/create-jira-release/scripts/link-related-work.sh \
  38223 \
  "https://eaflood.atlassian.net/wiki/spaces/WTPG/pages/6518114167" \
  --title "DWTA - Release 4"
```

Skips duplicate URLs already linked to the version.

When publishing a Confluence release note first, use [create-release-note-in-confluence](../create-release-note-in-confluence/SKILL.md) with `--link-jira-release` instead (see that skill).

## Workflow

### 1. Prepare description

Write a markdown file, for example `.tmp/jira-releases/new/description.md`:

```markdown
## Summary

Batch of ext-test fixes for waste movement APIs.

## Services

- waste-movement-backend
- waste-movement-external-api

## Notes

See Confluence release note for deployment details.
```

### 2. Check for existing release (create only)

```bash
bash .cursor/skills/create-jira-release/scripts/check-existing-release.sh \
  DWTA "Release 5"
```

- **Exit 0** — safe to create
- **Exit 1** — release name already exists; use `--version` to update instead

### 3. Create release

```bash
mkdir -p .tmp/jira-releases/new

bash .cursor/skills/create-jira-release/scripts/create-release.sh \
  .tmp/jira-releases/new \
  --project DWTA \
  --release-name "Release 5" \
  --release-date 2026-05-20 \
  --tickets "DWTA-154,DWTA-155,DWTA-157" \
  --description-file .tmp/jira-releases/new/description.md
```

### 4. Update existing release

Use when adding tickets or refreshing the description on an existing fix version:

```bash
mkdir -p .tmp/jira-releases/38223

bash .cursor/skills/create-jira-release/scripts/create-release.sh \
  .tmp/jira-releases/38223 \
  --version 38223 \
  --release-date 2026-05-13 \
  --tickets "DWTA-189" \
  --description-file .tmp/jira-releases/38223/description.md
```

Ticket assignment **adds** the fix version; it does not remove other fix versions from an issue.

### 5. Review output

| File                     | Contents                                                  |
| ------------------------ | --------------------------------------------------------- |
| `manifest.json`          | Version ID, URLs, tickets, formatted description          |
| `description-source.txt` | Original input                                            |
| `description-jira.txt`   | Wiki/plain text sent to Jira                              |
| `assignments.json`       | Per-ticket assign results                                 |
| `related-work.json`      | Related work link result (when `--related-work-url` used) |

Requires `ATLASSIAN_USER` and `ATLASSIAN_TOKEN`. See [atlassian-credentials.md](../../../docs/ai/atlassian-credentials.md).

**Ask for user confirmation before creating or updating a release** unless the caller skill already obtained it.

## Scripts

| Script                      | Purpose                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `create-release.sh`         | Create or update fix version, format description, assign tickets |
| `check-existing-release.sh` | Detect duplicate release name in project                         |
| `assign-issues.sh`          | Add fix version to ticket keys                                   |
| `link-related-work.sh`      | Add a Related work link to the Jira release page                 |
| `format-description.py`     | Convert markdown/html/text to Jira description                   |
| `resolve-project-id.sh`     | Resolve project key to numeric ID                                |

## Environment

| Variable                     | Default         | Purpose                         |
| ---------------------------- | --------------- | ------------------------------- |
| `JIRA_PROJECT_KEY`           | `DWTA`          | Default project key             |
| `JIRA_RELATED_WORK_CATEGORY` | `Documentation` | Category for Related work links |

## Examples

```
/create-jira-release --release-name "Release 5" --release-date 2026-05-20 --tickets DWTA-154,DWTA-155 --description "Ext-test batch"
/create-jira-release --version 38223 --release-date 2026-05-13 --tickets DWTA-189 --description-file description.md
```

Dry run:

```bash
bash .cursor/skills/create-jira-release/scripts/create-release.sh \
  .tmp/jira-releases/new \
  --project DWTA \
  --release-name "Release 5" \
  --release-date 2026-05-20 \
  --tickets "DWTA-154,DWTA-155" \
  --description-text "Draft release summary" \
  --dry-run
```

## Important constraints

- **Release name and date are required for create** — maps to Jira fix version `name` and `releaseDate`
- **Never create a duplicate release name** — run `check-existing-release.sh` first
- **Never write to Jira without user confirmation** (unless a parent skill already confirmed)
- **Use markdown for descriptions** — best fit for future Confluence release note layout
- **Do not send Confluence HTML** to Jira — it will not render
- **If any script fails, stop immediately** — report the exact error
- Jira releases batch tickets; formatted release notes live in Confluence and can be linked via **Related work**
- **Related work is optional** — omit `--related-work-url` if no Confluence page exists yet

## Related skills

- [get-jira-release](../get-jira-release/SKILL.md) — read release metadata and work items after creation
- [create-release-note-in-confluence](../create-release-note-in-confluence/SKILL.md) — Confluence release note from a Jira release
- [get-jira-ticket](../get-jira-ticket/SKILL.md) — ticket details for release contents

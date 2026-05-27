---
name: create-release-note-in-confluence
description: Create a DWTA release note in Confluence from a Jira release or ticket list. Collects tickets, service versions from merged PRs, cdp-app-config changes, and drafts a page from the WTPG template. Use when the user asks to create or draft a release note in Confluence.
---

# Create release note in Confluence

Builds a Confluence release note under [AUTOMATED RELEASE DOCS](https://eaflood.atlassian.net/wiki/spaces/WTPG/pages/6518178160) using the [DWTA release template](https://eaflood.atlassian.net/wiki/spaces/WTPG/pages/6518407484/TEMPLATE+DWTA+-+Release+X).

For the full release picture across Jira and Confluence, see [.cursor/skills/README.md](../README.md).

## End-to-end release (with Jira)

Typical order when automating a new release:

1. **[create-jira-release](../create-jira-release/SKILL.md)** — create fix version, assign tickets, short plain description
2. **This skill** — collect data from that release (`--release <id>`), build draft, publish
3. **Publish with `--link-jira-release`** — adds Confluence page as **Related work** on the Jira release page

If the Jira release already exists (e.g. created manually), start at step 2 with `--release 38223`.

## Parameters

One of:

| Input type  | Example                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------ |
| Release URL | `https://eaflood.atlassian.net/projects/DWTA/versions/38223/tab/release-report-all-issues` |
| Release ID  | `38223`                                                                                    |
| Ticket list | `DWTA-154,DWTA-155,DWTA-157`                                                               |

Optional:

- **Environment** — default `ext-test/prod` (edit draft manually if needed)

**Page title** must match the template exactly: **`DWTA - Release X`**, where `X` comes from the Jira fix version name (e.g. fix version `Release 4` → `DWTA - Release 4`).

- Always derived by `resolve-page-title.sh` — **never set manually**
- **Never** add suffixes such as `- Release note`, `Release note`, or draft folder names
- Publishing requires `--release` (a Jira fix version) — ticket-only input cannot produce a valid title

## Workflow

### 1. Collect data

From a Jira release:

```bash
mkdir -p .tmp/release-notes/38223

bash .cursor/skills/create-release-note-in-confluence/scripts/collect-release-data.sh \
  .tmp/release-notes/38223 \
  --release 38223
```

From a ticket list:

```bash
mkdir -p .tmp/release-notes/custom

bash .cursor/skills/create-release-note-in-confluence/scripts/collect-release-data.sh \
  .tmp/release-notes/custom \
  --tickets "DWTA-154,DWTA-155,DWTA-157"
```

This orchestrates:

| Skill / script                                               | Purpose                                                                                                                           |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| [get-jira-release](../get-jira-release/SKILL.md)             | Release metadata and work items (when using `--release`)                                                                          |
| [get-jira-ticket](../get-jira-ticket/SKILL.md)               | Ticket details and linked GitHub PRs per ticket                                                                                   |
| [get-pr-service-version](../get-pr-service-version/SKILL.md) | Minted service version IDs from merged service PRs                                                                                |
| [get-confluence-page](../get-confluence-page/SKILL.md)       | Template page body                                                                                                                |
| `config-prs.sh`                                              | [cdp-app-config](https://github.com/DEFRA/cdp-app-config/tree/main) PRs from Jira dev links, related tickets, and ticket comments |

Config PR discovery **does not require `GITHUB_TOKEN`**. The skill checks:

1. Jira GitHub dev panel on each release ticket
2. Jira GitHub dev panel on **related tickets** (parent, linked, subtasks)
3. `cdp-app-config` PR URLs pasted in ticket descriptions or comments

Set `GITHUB_TOKEN` only if you want GitHub search and automatic changed-file paths from the config repo.

| File / folder                  | Contents                                        |
| ------------------------------ | ----------------------------------------------- |
| `manifest.json`                | Aggregated release note data                    |
| `release.json` / `issues.json` | Release metadata and work items (release mode)  |
| `config-prs.json`              | Config repo PRs and changed file paths          |
| `tickets/<KEY>/`               | Per-ticket Jira + GitHub + service version data |
| `template.html`                | Confluence template storage HTML                |

Requires `ATLASSIAN_USER` and `ATLASSIAN_TOKEN`. See [atlassian-credentials.md](../../../docs/ai/atlassian-credentials.md).

### 2. Check for existing page

Before building or publishing, check whether a release note already exists:

```bash
bash .cursor/skills/create-release-note-in-confluence/scripts/check-existing-release-note.sh \
  .tmp/release-notes/38223
```

- **Exit 0** — no live page found; continue
- **Exit 1** — a **live** page already exists; **stop** and give the user the URL printed by the script. Do not build or publish.

Archived pages are **ignored** (treated as deleted). We cannot restore or permanently delete archived content in this space via API.

If create fails because an archived page still holds the title, ask the user to unarchive or permanently delete it, then **update** the existing live page with `update-page.sh` rather than creating a duplicate.

### 3. Build draft

```bash
bash .cursor/skills/create-release-note-in-confluence/scripts/build-release-note.sh \
  .tmp/release-notes/38223 \
  .tmp/confluence-drafts/dwta-release-4
```

Writes:

| File        | Purpose                                |
| ----------- | -------------------------------------- |
| `page.html` | Confluence storage-format release note |
| `meta.txt`  | Parent page, title, intended action    |

The draft follows the template structure:

- **Date & Time** — sets “Release note created”; leaves scheduled/concluded as placeholders
- **Jira Release** — link to the Jira release report, plus the template’s live Jira/Confluence datasource table with JQL updated to `fixVersion = <id>`
- **Services and Versions** — each service as `[0.yyy.0 → new version]` where **0.yyy.0 stays as the template placeholder** (current deployed version unknown); new version links to GitHub release tag
- **Config changes** — tickets, config file paths, services, environments, and PR links from `cdp-app-config`
- **Other sections** — left as template placeholders (test reports, swagger, Bruno)

### 4. Review with user

Show the draft summary from `manifest.json` and key sections of `page.html`. **Ask for confirmation before publishing.**

Highlight:

- Service versions found (and any missing)
- Config PRs found (or none)
- Work items included

### 5. Publish (only after user confirms, and only if check passed)

Default parent: **AUTOMATED RELEASE DOCS** (`6518178160` — same folder as the template).

```bash
bash .cursor/skills/create-release-note-in-confluence/scripts/publish-release-note.sh \
  .tmp/release-notes/38223 \
  .tmp/confluence-drafts/dwta-release-4 \
  --link-jira-release 38223
```

`--link-jira-release` is **optional**. When provided, adds a **Related work** link on the Jira release page pointing to the published Confluence page (title defaults to `DWTA - Release X`). Override with `--related-work-title`.

`publish-release-note.sh` runs the duplicate check again, then creates the page using **`resolve-page-title.sh`** (always `DWTA - Release X`).

If a live page already exists with the correct title, update it instead:

```bash
bash .cursor/skills/create-confluence-page/scripts/update-page.sh \
  <page_id_or_url> \
  .tmp/confluence-drafts/dwta-release-4/page.html \
  "DWTA - Release 4"
```

Then optionally link to Jira (if not done at publish time):

```bash
bash .cursor/skills/create-release-note-in-confluence/scripts/link-jira-release.sh \
  .tmp/release-notes/38223 \
  6518114167 \
  38223
```

Do **not** call `create-page.sh` directly or pass a custom title. Wrong titles (e.g. `DWTA - Release 4 - Release note`) do not match the template pattern.

Override parent with `RELEASE_NOTE_PARENT_ID` if needed.

## Scripts

| Script                           | Purpose                                                                 |
| -------------------------------- | ----------------------------------------------------------------------- |
| `collect-release-data.sh`        | Fetch Jira, GitHub, config, and template data                           |
| `resolve-page-title.sh`          | Derive `DWTA - Release X` from manifest                                 |
| `check-existing-release-note.sh` | Detect an existing **live** page with the same title (ignores archived) |
| `build-release-note.sh`          | Build Confluence draft HTML                                             |
| `publish-release-note.sh`        | Check for duplicates, publish, optionally link Jira Related work        |
| `link-jira-release.sh`           | Link an existing Confluence page to a Jira release (Related work)       |
| `config-prs.sh`                  | Find cdp-app-config PRs from Jira links and comments                    |

## Environment

| Variable                             | Default                | Purpose                                                |
| ------------------------------------ | ---------------------- | ------------------------------------------------------ |
| `ATLASSIAN_USER` / `ATLASSIAN_TOKEN` | (required)             | Jira and Confluence API                                |
| `GITHUB_TOKEN`                       | (none)                 | Optional: GitHub search and config file paths from PRs |
| `RELEASE_NOTE_TEMPLATE_ID`           | `6518407484`           | Template page ID                                       |
| `RELEASE_NOTE_PARENT_ID`             | `6518178160`           | Parent folder for new release notes                    |
| `CDP_CONFIG_REPO`                    | `DEFRA/cdp-app-config` | Config repository                                      |
| `JIRA_RELATED_WORK_CATEGORY`         | `Documentation`        | Category for Related work links on Jira releases       |

## Examples

```
/create-release-note-in-confluence https://eaflood.atlassian.net/projects/DWTA/versions/38223/tab/release-report-all-issues
/create-release-note-in-confluence 38223
/create-release-note-in-confluence DWTA-154,DWTA-155,DWTA-157
```

## Important constraints

- **Never publish without user confirmation**
- **Never create a duplicate live page** — run `check-existing-release-note.sh` first; if a live page exists, stop and share the link (or update it)
- **Archived pages are ignored** — only `current` pages block creation; archived titles may still block create via Confluence API
- **Page title is always `DWTA - Release X`** — derived from the Jira fix version; never add `- Release note` or other suffixes
- **Always publish via `publish-release-note.sh`** — never pass a manual title to `create-page.sh`
- **Do not guess the currently deployed service version** — keep `0.yyy.0` placeholder links in the template format
- **If collection fails, stop immediately** — report the exact error
- Service versions only resolve for merged PRs in known CDP service repos (see [get-pr-service-version](../get-pr-service-version/SKILL.md))
- Hotfix versions may not resolve if the tag is not on the PR merge commit

## Related skills

- [create-confluence-page](../create-confluence-page/SKILL.md) — publish or update the draft
- [create-jira-release](../create-jira-release/SKILL.md) — create or update the Jira fix version and assign tickets
- [get-jira-release](../get-jira-release/SKILL.md) — release work items
- [get-pr-service-version](../get-pr-service-version/SKILL.md) — deploying service versions

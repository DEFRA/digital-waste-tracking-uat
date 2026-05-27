---
name: get-confluence-page
description: Get a Confluence page or folder (title, body, labels, child pages) by page/folder ID or URL, or search by query, and save everything to .tmp for analysis. Use when the user asks for Confluence documentation, wiki pages, folders, or design docs for Digital Waste Tracking.
---

# Get Confluence page

Read-only fetch of Confluence pages, folders, or search results to `.tmp/confluence-*`.

## Parameters

`args` is one of:

| Input type     | Example                                                               |
| -------------- | --------------------------------------------------------------------- |
| Page URL       | `https://eaflood.atlassian.net/wiki/spaces/WTPG/pages/6511037444/...` |
| Folder URL     | `https://eaflood.atlassian.net/wiki/spaces/WTPG/folder/6483182044`    |
| Page/folder ID | `6511037444`                                                          |
| Search query   | `release runbook` (optional space: `WTPG`)                            |

Requires `ATLASSIAN_USER` and `ATLASSIAN_TOKEN`. See [atlassian-credentials.md](../../../docs/ai/atlassian-credentials.md). If missing, stop and tell the user to set them in `~/.zshenv`.

## Route the input

Pick **one** path:

```
Input contains /folder/     → Folder workflow (step 1)
Input is plain text/query   → Search workflow (step 2), then page or folder workflow
Otherwise                   → Page workflow (step 3)
```

## Steps

### 1. Folder workflow

```bash
mkdir -p .tmp/confluence-folders/<folder-id>

bash .cursor/skills/get-confluence-page/scripts/folder-contents.sh \
  <folder_id_or_url> \
  .tmp/confluence-folders/<folder-id>
```

Output: `.tmp/confluence-folders/<folder-id>/`

| File / folder                | Contents                                          |
| ---------------------------- | ------------------------------------------------- |
| `folder.txt` / `folder.json` | Folder metadata and hierarchy                     |
| `pages/index.txt`            | Page list (includes truncation warning if capped) |
| `pages/<id>/page.txt`        | Full HTML body per page                           |
| `pages/<id>/page.json`       | Raw API response per page                         |

Default max **50 pages**. Raise with `CONFLUENCE_MAX_FOLDER_PAGES=<n>`.

### 2. Search workflow

Only when the user gives a search term, not a URL or ID:

```bash
mkdir -p .tmp/confluence-searches

bash .cursor/skills/get-confluence-page/scripts/search.sh "<query>" [space_key] \
  > ".tmp/confluence-searches/<query-slug>.txt"
```

Use a filesystem-safe slug from the query (e.g. `release-runbook`). Show results; ask the user which page or folder to fetch; then run step 1 or 3.

Each search gets its own file — searches do not overwrite each other.

### 3. Page workflow

For a single page URL or ID:

```bash
mkdir -p .tmp/confluence-pages/<page-id>

bash .cursor/skills/get-confluence-page/scripts/page.sh <page_id_or_url> full > .tmp/confluence-pages/<page-id>/page.txt
bash .cursor/skills/get-confluence-page/scripts/page.sh <page_id_or_url> json > .tmp/confluence-pages/<page-id>/page.json
bash .cursor/skills/get-confluence-page/scripts/child-pages.sh <page-id> .tmp/confluence-pages/<page-id>
```

Output: `.tmp/confluence-pages/<page-id>/`

| File / folder            | Contents                        |
| ------------------------ | ------------------------------- |
| `page.txt` / `page.json` | Primary page                    |
| `children/index.txt`     | Child pages fetched             |
| `children/<id>/`         | Full content per child (max 10) |

Raise child limit with `CONFLUENCE_MAX_CHILDREN=20`.

### 4. Read saved files

**If any script fails, stop immediately.** Report the exact error. Do not scrape the UI or guess content.

After a successful fetch:

1. Read `folder.txt` / `page.txt` and `pages/index.txt` or `children/index.txt` first
2. Read bodies under `pages/<id>/` or `children/<id>/` as needed
3. For **folders**, read all saved page files when the user needs full context; for large folders, summarise the index and ask which pages to focus on unless the user asked for everything

### 5. Respond to the caller

- **Single page:** return full page content from saved files
- **Folder:** return folder metadata, page index, and full content of relevant pages (or all saved pages if requested)
- Always mention the `.tmp/` path so the user can inspect files directly

## Scripts

| Script                  | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `page.sh`               | Fetch one page by ID or URL                   |
| `folder-contents.sh`    | Fetch folder metadata and all pages inside it |
| `search.sh`             | Find pages by title/body text                 |
| `child-pages.sh`        | Fetch child pages under a page                |
| `resolve-content-id.sh` | Parse numeric ID from page or folder URL      |

## Examples

```
/get-confluence-page https://eaflood.atlassian.net/wiki/spaces/WTPG/folder/6483182044
/get-confluence-page 6511037444
/get-confluence-page POPs validation WTPG
```

## Related skills

- [create-confluence-page](../create-confluence-page/SKILL.md) — publish or update pages (after reading existing content)
- [create-release-note-in-confluence](../create-release-note-in-confluence/SKILL.md) — uses this to load the release note template

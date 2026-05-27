---
name: create-confluence-page
description: Draft and publish a Confluence page under a specified parent page. Use when the user asks to create or update Confluence documentation, test plans, or wiki pages for Digital Waste Tracking.
---

# Create Confluence page

Creates or updates a Confluence page as a child of a parent page.

## Parameters

1. **Parent** (required) — parent page or folder ID/URL (e.g. a folder under WTPG Release Documentation)
2. **Title** (required for new pages)
3. **Content** — what to write (from user request, ticket analysis, test plan, etc.)
4. **Mode** (optional) — `create` (default) or `update` with an existing page ID/URL

## Workflow

### 1. Confirm parent

If the parent is not provided, ask the user. Optionally verify it exists:

```bash
# Page parent
bash .cursor/skills/get-confluence-page/scripts/page.sh <parent_id_or_url> summary

# Folder parent
bash .cursor/skills/get-confluence-page/scripts/folder-contents.sh <folder_id_or_url> .tmp/confluence-folders/<folder-id>
```

The new page inherits the parent's space. Pages can be created under a **page or folder** parent.

### 2. Draft locally first

Write the page body to `.tmp/confluence-drafts/<slug>/`:

| File        | Purpose                                                   |
| ----------- | --------------------------------------------------------- |
| `page.html` | Confluence storage-format HTML body                       |
| `meta.txt`  | Parent ID/URL, title, and intended action (create/update) |

**Storage format rules:**

- Use HTML fragments: `<p>`, `<h1>`–`<h3>`, `<ul>`, `<ol>`, `<li>`, `<table>`, `<tr>`, `<th>`, `<td>`, `<ac:structured-macro>` sparingly
- Do not include `<html>`, `<head>`, or `<body>` wrappers
- Escape `<` in plain text as `&lt;` where needed
- Code blocks: `<pre><code>...</code></pre>`

Show the draft to the user and **ask for confirmation before publishing**.

### 3. Publish (only after user confirms)

**Create** a new child page:

```bash
bash .cursor/skills/create-confluence-page/scripts/create-page.sh \
  <parent_id_or_url> \
  "<title>" \
  .tmp/confluence-drafts/<slug>/page.html
```

**Update** an existing page:

```bash
bash .cursor/skills/create-confluence-page/scripts/update-page.sh \
  <page_id_or_url> \
  .tmp/confluence-drafts/<slug>/page.html \
  "<new_title>"
```

Requires `ATLASSIAN_USER` and `ATLASSIAN_TOKEN`. See [atlassian-credentials.md](../../../docs/ai/atlassian-credentials.md).

### 4. Report result

Return the page ID and URL from the script output. Save them to `.tmp/confluence-drafts/<slug>/published.txt`.

## Important constraints

- **Never publish without user confirmation**
- **If any script fails, stop immediately** — report the exact error; do not retry with guessed content
- Prefer updating an existing page when the user asks to revise docs they already own
- Use [get-confluence-page](../get-confluence-page/SKILL.md) first when extending existing documentation

## Scripts

| Script               | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `create-page.sh`     | Create a page under a parent                   |
| `update-page.sh`     | Update an existing page (increments version)   |
| `resolve-page-id.sh` | Parse page ID from ID or URL (used internally) |

## Example storage-format body

```html
<h1>Test plan for DWT-624</h1>
<p>Summary of validation scenarios for POPs source of components.</p>
<h2>Scenarios</h2>
<ul>
  <li>Reject empty sourceOfComponents</li>
  <li>Reject missing sourceOfComponents when POPs present</li>
</ul>
```

## Related skills

- [get-confluence-page](../get-confluence-page/SKILL.md) — read existing pages before update
- [create-release-note-in-confluence](../create-release-note-in-confluence/SKILL.md) — specialised release note publish (uses these scripts internally)

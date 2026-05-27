---
name: get-pr-service-version
description: Get minted CDP service version IDs for merged GitHub pull requests in DEFRA waste tracking service repos. Use when the user asks for the version minted by a PR or service version from Jira-linked GitHub PRs.
---

# Get PR service version

When a PR merges to `main` in a CDP **service repo**, the Publish workflow runs `DEFRA/cdp-build-action/build`, which auto-tags the merge commit with a version ID.

## Known service repos

These repos mint versions on merge to `main`:

- `waste-movement-backend`
- `waste-movement-external-api`
- `waste-tracking-id-backend`

Test/uat repos (e.g. `digital-waste-tracking-uat`) use `cdp-build-action/build-test` and do **not** follow this versioning pattern.

## Parameters

One of:

1. **PR URL** — e.g. `https://github.com/DEFRA/waste-movement-backend/pull/113`
2. **Repo + number** — e.g. `waste-movement-backend 113`
3. **Jira github.txt** — after [get-jira-ticket](../get-jira-ticket/SKILL.md), resolve all PRs in `github.txt`

Optional: `GITHUB_TOKEN` for higher GitHub API rate limits (public repos work without it).

## Steps

### Single PR

```bash
bash .cursor/skills/get-pr-service-version/scripts/pr-version.sh <pr_url>
```

Save output when working from a ticket:

```bash
bash .cursor/skills/get-pr-service-version/scripts/pr-version.sh <pr_url> \
  | tee -a .tmp/jira-tickets/<ticket>/service-versions.txt
```

### All PRs from a Jira fetch

```bash
bash .cursor/skills/get-pr-service-version/scripts/pr-versions-from-file.sh \
  .tmp/jira-tickets/<ticket>/github.txt \
  .tmp/jira-tickets/<ticket>
```

Writes:

| File                    | Contents                         |
| ----------------------- | -------------------------------- |
| `service-versions.txt`  | Human-readable version ID per PR |
| `service-versions.json` | Structured results               |

### 2. Handle results

- **Version found** — report version ID to the user
- **PR not merged** — report error; no version exists yet
- **Service repo but no tag** — Publish workflow may have failed; link to GitHub Actions on `main`
- **Non-service repo** — explain it does not mint CDP service versions

### 3. Typical workflow with Jira

1. [get-jira-ticket](../get-jira-ticket/SKILL.md) → saves `github.txt`
2. This skill → resolves minted versions for service PRs only

## Output format

```
=== PR DEFRA/waste-movement-backend#113 ===
Title: DWT-180 Add POPs and Hazardous components PAT scenario
URL: https://github.com/DEFRA/waste-movement-backend/pull/113
Merged: 2026-05-19T11:11:42Z
Merge commit: 33e7c89...
Service repo: true

Version: 0.107.0
```

## Environment

| Variable       | Default | Purpose         |
| -------------- | ------- | --------------- |
| `GITHUB_TOKEN` | (none)  | GitHub API auth |
| `GITHUB_ORG`   | `DEFRA` | Organisation    |

## Examples

```
/get-pr-service-version https://github.com/DEFRA/waste-movement-backend/pull/113
/get-pr-service-version waste-movement-external-api 42
```

After fetching DWTA-180:

```bash
bash .cursor/skills/get-pr-service-version/scripts/pr-versions-from-file.sh \
  .tmp/jira-tickets/DWTA-180/github.txt \
  .tmp/jira-tickets/DWTA-180
```

## Related skills

- [get-jira-ticket](../get-jira-ticket/SKILL.md) — provides `github.txt` for batch resolution
- [create-release-note-in-confluence](../create-release-note-in-confluence/SKILL.md) — service versions section in release notes

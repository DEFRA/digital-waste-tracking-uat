# Cursor skills — Digital Waste Tracking UAT

Scripts live under `.cursor/skills/<skill-name>/scripts/`. All Jira and Confluence skills require `ATLASSIAN_USER` and `ATLASSIAN_TOKEN` — see [docs/ai/atlassian-credentials.md](../../docs/ai/atlassian-credentials.md).

## Skill map

| Skill                                                                           | Invoke                                     | Role                                              |
| ------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| [get-jira-ticket](get-jira-ticket/SKILL.md)                                     | `/get-jira-ticket DWT-624`                 | Read one Jira issue (+ comments, GitHub, related) |
| [get-jira-release](get-jira-release/SKILL.md)                                   | `/get-jira-release 38223`                  | Read a fix version and its work items             |
| [get-pr-service-version](get-pr-service-version/SKILL.md)                       | `/get-pr-service-version <pr_url>`         | Resolve CDP service version from merged PR        |
| [get-confluence-page](get-confluence-page/SKILL.md)                             | `/get-confluence-page <id_or_url>`         | Read Confluence pages/folders                     |
| [create-jira-release](create-jira-release/SKILL.md)                             | `/create-jira-release …`                   | Create/update Jira fix version, assign tickets    |
| [create-release-note-in-confluence](create-release-note-in-confluence/SKILL.md) | `/create-release-note-in-confluence 38223` | Build/publish DWTA release note                   |
| [create-confluence-page](create-confluence-page/SKILL.md)                       | (manual)                                   | Generic Confluence create/update                  |
| [create-uat-tests-from-jira](create-uat-tests-from-jira/SKILL.md)               | (manual)                                   | Plan/implement API tests from a ticket            |

**Read skills** fetch data to `.tmp/` and return full contents — do not guess from memory.

**Write skills** draft locally first and require **user confirmation** before Jira/Confluence writes.

## Release workflow (holistic)

Today: **Confluence** holds the formatted release note; **Jira** batches tickets. The Jira rich-text section (“Give this section a name”) is not API-accessible — use **Related work** to link the Confluence page.

```text
1. create-jira-release          → fix version, tickets, plain description
2. create-release-note-in-confluence → collect PR versions, config PRs, build HTML
3. publish (+ optional --link-jira-release) → Confluence page + Related work link on Jira
```

Or start from an existing Jira release (`--release 38223`) if step 1 was done manually.

## Shared conventions

- Output under `.tmp/` (gitignored) — `jira-tickets/`, `jira-releases/`, `release-notes/`, `confluence-drafts/`
- On script failure: stop and report the exact error
- Ticket keys: `DWT-*` and `DWTA-*` both appear in this programme; use the key from the ticket or release

## Dependencies between skills

```text
get-jira-ticket ──► get-pr-service-version
       │
       ├──► create-uat-tests-from-jira
       └──► create-release-note-in-confluence (via collect-release-data)

get-jira-release ──► create-release-note-in-confluence
                  └──► create-jira-release (resolve version ID)

get-confluence-page ──► create-release-note-in-confluence (template)
                   └──► create-confluence-page

create-release-note-in-confluence ──► create-confluence-page (publish)
                                 └──► create-jira-release (link-related-work)
```

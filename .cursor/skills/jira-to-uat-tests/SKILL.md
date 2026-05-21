---
name: jira-to-uat-tests
description: Reads a Jira ticket (with attachments), analyses acceptance criteria, and proposes or implements UAT API tests for digital-waste-tracking-uat. Use when the user asks to write tests from a Jira ticket, plan tests for DWT/DWTA work, or mentions a ticket number like DWT-123.
---

# Jira ticket to UAT tests

Turns Jira acceptance criteria into behavioural API tests for this repo.

## Parameters

1. **Ticket ID** (required) — e.g. `DWT-624`. Ask the user if not provided.
2. **Mode** (optional) — `plan` (default) or `implement`. Only implement after the user approves the plan.

## Workflow

### 1. Fetch ticket

Follow [read-jira-ticket](../read-jira-ticket/SKILL.md) — run all scripts including `related-tickets.sh` and save output to `.tmp/jira-tickets/<ticket>/`.

Read all files there — especially `ticket.txt`, `comments.txt`, `github.txt`, `related/`, `epic/`, and `attachments/`. Use [pr-service-version](../pr-service-version/SKILL.md) to resolve minted version IDs for merged service PRs in `github.txt`.

Extract: summary, description, comments, acceptance criteria, testing notes, linked tickets, and attachment content.

### 2. Load project conventions

Read these before proposing or writing tests:

- `.cursor/rules/test.mdc` (index — follow all linked rule files)
- `test/README.md` and `test/CONFIGURATION.md`
- Existing tests for the same API/feature under `test/specs/`
- Confluence pages linked from the ticket — use [read-confluence-page](../read-confluence-page/SKILL.md) if the ticket references wiki docs

Match file placement, naming, assertions, auth patterns, and test data helpers already used nearby.

### 3. Map ticket to test structure

Use the four-level hierarchy:

| Level       | Where                 | Example                             |
| ----------- | --------------------- | ----------------------------------- |
| API         | Folder                | `WasteMovementExternalAPI/`         |
| Feature     | Subfolder             | `CreateWasteMovement/`              |
| Behavior    | describe block + file | `pops-source-of-components.test.js` |
| Expectation | it block              | `should reject ... when ...`        |

Prefer extending an existing test file when the behaviour belongs to the same validation area.

### 4. Derive test scenarios

From acceptance criteria, produce UAT-focused scenarios:

- **Happy path** — valid values accepted (status asserted first)
- **Validation errors** — invalid/missing values rejected with exact error body (`toEqual`)
- **Business rules** — cross-field or conditional logic from the ticket

Keep tests behavioural and minimal (see `test-focus.mdc`). Do not add exhaustive unit-style matrices.

For each scenario note:

- describe/it name
- API method (`globalThis.apis.*`)
- test data changes (prefer `generateBaseWasteReceiptData()` and test-data-manager helpers)
- expected status code and response shape
- Jira tag: `@allure.label.tag:<TICKET>` and `addAllureLink('/<TICKET>', '<TICKET>', 'jira')`

### 5. Output test plan (always)

Present this before writing code:

```markdown
## Test plan for <TICKET>: <summary>

### Ticket understanding

<1–3 sentences on what the ticket requires>

### Proposed location

- File: `test/specs/.../....test.js`
- API: `globalThis.apis....`

### Scenarios

1. **<describe > / <it name>**
   - Arrange: ...
   - Expect: status X, ...

### Open questions

- <anything unclear from the ticket>
```

Ask: **"Implement these tests?"** Stop here unless mode is `implement` or the user confirms.

### 6. Implement (when approved)

- Follow all `.cursor/rules/` test rules (no parameterized tests, no for-loops in tests, exact error bodies, fresh data in `beforeEach`, `authenticateAndSetToken()` in `beforeEach`)
- Run `npm run format` on changed files
- Run targeted tests: `source ./env.sh && NODE_OPTIONS='--experimental-vm-modules --no-warnings' npx jest <path>`

## Important constraints

- **Prompt for ticket number** when creating tests if not supplied
- **Do not hardcode credentials** — use `globalThis.testConfig`
- **Status code first** in every assertion block
- **Error cases** must use `toEqual()` with the full expected validation structure
- **No TypeScript** — JavaScript only

## Additional resources

- Atlassian setup: [atlassian-credentials.md](../../../docs/ai/atlassian-credentials.md)
- Example tagged test: `test/specs/WasteMovementExternalAPI/CreateWasteMovement/pops-source-of-components.test.js`

# Atlassian credentials setup

Scripts under `.cursor/skills/read-jira-ticket/scripts/` (and the skills that call them) require Atlassian API credentials.

## Required environment variables

| Variable          | Value                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `ATLASSIAN_USER`  | Your Atlassian account email                                                                                                      |
| `ATLASSIAN_TOKEN` | API token from [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |

Use a token created via "Create API token" (not the scoped variant) so it covers Jira in one go.

## Where to set them

Put the exports in `~/.zshenv` (zsh users):

```sh
# ~/.zshenv
export ATLASSIAN_USER=your.name@example.com
export ATLASSIAN_TOKEN=your-atlassian-api-token
```

`~/.zshenv` is loaded by every zsh invocation, so scripts run from Cursor terminals will see the vars.

For bash users, add the same exports to `~/.bash_profile` (or `~/.bashrc`).

## Verify

````bash
```bash
mkdir -p .tmp/jira-tickets/DWT-123/attachments
bash .cursor/skills/read-jira-ticket/scripts/ticket.sh DWT-123 full > .tmp/jira-tickets/DWT-123/ticket.txt
bash .cursor/skills/read-jira-ticket/scripts/comments.sh DWT-123 list > .tmp/jira-tickets/DWT-123/comments.txt
bash .cursor/skills/read-jira-ticket/scripts/attachments.sh DWT-123 .tmp/jira-tickets/DWT-123/attachments
````

```

Replace `DWT-123` with a ticket you can access.
```

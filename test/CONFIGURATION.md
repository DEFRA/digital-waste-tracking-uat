# Test Configuration

This test suite requires certain environment variables to be set for authentication tests to work properly.

## Required Environment Variables

### Cognito OAuth Credentials

- `COGNITO_CLIENT_ID`: Your Cognito client ID for OAuth2 client credentials flow
- `COGNITO_CLIENT_SECRET`: Your Cognito client secret for OAuth2 client credentials flow
- `COGNITO_CLIENT_NAME`: Display name for the primary Cognito client (default: `Test Client 1`; set per environment in `env.sh`)

### Optional Environment Variables

- `COGNITO_CLIENT_ID_2`: Second Cognito client ID for cross-client ownership tests (e.g. PAT)
- `COGNITO_CLIENT_SECRET_2`: Second Cognito client secret for cross-client ownership tests
- `COGNITO_CLIENT_NAME_2`: Display name for the second Cognito client (default: `Test Client 2`; set per environment in `env.sh`)
- `WASTE_MOVEMENT_CLIENT_SYNC_API_BASE_URL`: Base URL for the DWT client-sync service (e.g. `…/dwt-client-sync`)
- `SERVICE_AUTH_PASSWORD_CLIENT_SYNC`: Basic auth password for client-sync (`waste-movement-backend:<password>`)
- `ENVIRONMENT`: The environment name (defaults to 'test')
- `RESULTS_OUTPUT_S3_PATH`: S3 path for publishing test results (used in CI/CD)
- `API_CODE`: Organisation API code for movement payloads
- `ORGANISATION_ID`: Defra customer organisation ID for bulk upload payloads

Set `API_CODE` and `ORGANISATION_ID` together. Global setup in `test/support/jest/global-setup.js` treats either value as missing when only one is set:

- **Both set** — setup uses them and does not create an organisation. Both are required when `ENVIRONMENT=prod`.
- **Either unset, and not production** — setup creates an organisation via `createOrUpdateOrganisation`, reads its API code via `getAllApiCodesForOrganisation`, and writes both values to `process.env`.
- **Either unset and `ENVIRONMENT=prod`** — setup throws.

### Run-Scoped Identifiers

Tests read these through `globalThis.testConfig`. The getters read `process.env`, which workers inherit from global setup.

| Variable          | Set by                           | Exposed in tests as                    | Purpose                                  |
| ----------------- | -------------------------------- | -------------------------------------- | ---------------------------------------- |
| `API_CODE`        | Environment or `global-setup.js` | `globalThis.testConfig.apiCode`        | API code for external API movement tests |
| `ORGANISATION_ID` | Environment or `global-setup.js` | `globalThis.testConfig.organisationId` | Organisation ID for bulk upload payloads |

## Setting Up Environment Variables

### Local Development

Use the provided `env.sh` script in the project root:

```bash
# Source the environment variables
source ./env.sh

# Then run your tests
npm test
```

**Note:** You'll need to edit `env.sh` and add your actual credentials. Cognito client names sit with each environment's IDs and secrets:

```bash
export COGNITO_CLIENT_ID=<your_cognito_client_id>
export COGNITO_CLIENT_SECRET=<your_cognito_client_secret>
export COGNITO_CLIENT_NAME="Test Client 1"
export COGNITO_CLIENT_ID_2=<your_second_cognito_client_id>
export COGNITO_CLIENT_SECRET_2=<your_second_cognito_client_secret>
export COGNITO_CLIENT_NAME_2="Test Client 2"
export COGNITO_OAUTH_BASE_URL=<your_cognito_oauth_base_url>
export ENVIRONMENT=test
```

### CI/CD Pipeline

Set these environment variables in your CI/CD pipeline:

```bash
export COGNITO_CLIENT_ID="<your_cognito_client_id>"
export COGNITO_CLIENT_SECRET="<your_cognito_client_secret>"
export COGNITO_CLIENT_NAME="Test Client 1"
export COGNITO_CLIENT_ID_2="<your_second_cognito_client_id>"
export COGNITO_CLIENT_SECRET_2="<your_second_cognito_client_secret>"
export COGNITO_CLIENT_NAME_2="Test Client 2"
export COGNITO_OAUTH_BASE_URL="<your_cognito_oauth_base_url>"
export ENVIRONMENT="test"
```

## Configuration Validation

The test suite will automatically validate that all required environment variables are present when tests start. If any required variables are missing, the tests will fail with a clear error message indicating which variables need to be set.

## Usage in Tests

The configuration is available globally in tests via `globalThis.testConfig`:

```javascript
// Access client credentials
const clientId = globalThis.testConfig.cognitoClientId
const clientSecret = globalThis.testConfig.cognitoClientSecret
const clientName = globalThis.testConfig.cognitoClientName
const clientName2 = globalThis.testConfig.cognitoClientName2

// Access environment
const env = globalThis.testConfig.environment

// Organisation identifiers for this run
const apiCode = globalThis.testConfig.apiCode
const organisationId = globalThis.testConfig.organisationId
```

## Security Notes

- Never commit actual client secrets to version control
- Use CI/CD secrets management for sensitive values

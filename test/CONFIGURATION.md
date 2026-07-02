# Test Configuration

This test suite requires certain environment variables to be set for authentication tests to work properly.

## Required Environment Variables

### Cognito OAuth Credentials

- `COGNITO_CLIENT_ID`: Your Cognito client ID for OAuth2 client credentials flow
- `COGNITO_CLIENT_SECRET`: Your Cognito client secret for OAuth2 client credentials flow

### Optional Environment Variables

- `ENVIRONMENT`: The environment name (defaults to 'test')
- `RESULTS_OUTPUT_S3_PATH`: S3 path for publishing test results (used in CI/CD)
- `API_CODE_IN_GIO_ORG_EXCLUDE_LIST`: A comma-separated list of API codes for organisations excluded from GIO audit logging. These API codes will NOT send audit logs to S3, as they should be excluded by the waste-backend service, which has the corresponding org IDs for these API codes. Global setup behaviour:
  - **Unset** — creates a new API code via `createApiCodeForOrganisation` for a random organisation ID
  - **Set** — picks a random API code from the comma-separated list
  - **Either way** — calls `getOrganisationByApiCode` to resolve `defraCustomerOrganisationId` for use in bulk upload test data

### Runtime-Generated Variables (Read-Only)

Global setup writes these into `process.env` before workers start. Do not set them in `env.sh`; worker processes read them via `test/support/jest/setup.js`.

| Variable             | Set by            | Exposed in tests as           | Purpose                                                         |
| -------------------- | ----------------- | ----------------------------- | --------------------------------------------------------------- |
| `GENERATED_API_CODE` | `global-setup.js` | `globalThis.generatedApiCode` | API code for external API movement tests                        |
| `GENERATED_DEFRA_ID` | `global-setup.js` | `globalThis.generatedDefraId` | `defraCustomerOrganisationId` for backend bulk upload test data |

## Setting Up Environment Variables

### Local Development

Use the provided `env.sh` script in the project root:

```bash
# Source the environment variables
source ./env.sh

# Then run your tests
npm test
```

**Note:** You'll need to edit `env.sh` and add your actual credentials:

```bash
export COGNITO_CLIENT_ID=<your_cognito_client_id>
export COGNITO_CLIENT_SECRET=<your_cognito_client_secret>
export COGNITO_OAUTH_BASE_URL=<your_cognito_oauth_base_url>
export ENVIRONMENT=test
```

### CI/CD Pipeline

Set these environment variables in your CI/CD pipeline:

```bash
export COGNITO_CLIENT_ID="<your_cognito_client_id>"
export COGNITO_CLIENT_SECRET="<your_cognito_client_secret>"
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

// Access environment
const env = globalThis.testConfig.environment
```

## Security Notes

- Never commit actual client secrets to version control
- Use CI/CD secrets management for sensitive values

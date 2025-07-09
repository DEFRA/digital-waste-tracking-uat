# Test Configuration

This test suite requires certain environment variables to be set for authentication tests to work properly.

## Required Environment Variables

### Cognito OAuth Credentials

- `COGNITO_CLIENT_ID`: Your Cognito client ID for OAuth2 client credentials flow
- `COGNITO_CLIENT_SECRET`: Your Cognito client secret for OAuth2 client credentials flow

### Optional Environment Variables

- `ENVIRONMENT`: The environment name (defaults to 'test')

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
export COGNITO_CLIENT_ID=your_actual_client_id
export COGNITO_CLIENT_SECRET=your_actual_client_secret
export ENVIRONMENT=test
```

### CI/CD Pipeline

Set these environment variables in your CI/CD pipeline:

```bash
export COGNITO_CLIENT_ID="your_actual_client_id"
export COGNITO_CLIENT_SECRET="your_actual_client_secret"
export ENVIRONMENT="test"
```

## Configuration Validation

The test suite will automatically validate that all required environment variables are present when tests start. If any required variables are missing, the tests will fail with a clear error message indicating which variables need to be set.

## Usage in Tests

The configuration is available globally in tests via `global.testConfig`:

```javascript
// Access client credentials
const clientId = global.testConfig.cognitoClientId
const clientSecret = global.testConfig.cognitoClientSecret

// Access environment
const env = global.testConfig.environment
```

## Security Notes

- Never commit actual client secrets to version control
- Use CI/CD secrets management for sensitive values

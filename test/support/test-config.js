/**
 * Test configuration class that validates required environment variables
 */
export class TestConfig {
  constructor() {
    this.validateRequiredEnvVars()
  }

  /**
   * Validates that all required environment variables are present
   * @throws {Error} If any required environment variable is missing
   */
  validateRequiredEnvVars() {
    const requiredVars = [
      'WASTE_MOVEMENT_EXTERNAL_API_BASE_URL',
      'JIRA_BASE_URL'
    ]

    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}. ` +
          'These must be set in your CI environment or you might have to source the env.sh file.'
      )
    }
  }

  /**
   * Get the Cognito client ID from environment variables
   * @returns {string} The client ID
   */
  get cognitoClientId() {
    return process.env.COGNITO_CLIENT_ID
  }

  /**
   * Get the Cognito client secret from environment variables
   * @returns {string} The client secret
   */
  get cognitoClientSecret() {
    return process.env.COGNITO_CLIENT_SECRET
  }

  get cognitoOAuthBaseUrl() {
    return process.env.COGNITO_OAUTH_BASE_URL
  }

  get wasteMovementExternalApiToWasteMovementBackendPassword() {
    return process.env
      .WASTE_MOVEMENT_EXTERNAL_API_TO_WASTE_MOVEMENT_BACKEND_PASSWORD
  }

  get wasteOrganisationsBackendToWasteMovementBackendPassword() {
    return process.env
      .WASTE_ORGANISATIONS_BACKEND_TO_WASTE_MOVEMENT_BACKEND_PASSWORD
  }

  get cdpDevApiKey() {
    return process.env.CDP_DEV_API_KEY
  }

  /**
   * get JIRA base URL
   * @returns {string}
   */
  get jiraBaseUrl() {
    return process.env.JIRA_BASE_URL
  }

  /**
   * Get the HTTP proxy URL from environment variables
   * @returns {string} The proxy URL if set
   */
  get httpProxy() {
    return process.env.HTTP_PROXY
  }

  /**
   * Get the environment name
   * @returns {string} The environment name
   */
  get environment() {
    return process.env.ENVIRONMENT
  }

  /** */
  get wasteMovementExternalApiBaseUrl() {
    return process.env.WASTE_MOVEMENT_EXTERNAL_API_BASE_URL
  }

  /** */
  get wasteMovementBackendApiBaseUrl() {
    return process.env.WASTE_MOVEMENT_BACKEND_API_BASE_URL
  }

  /**
   * Check if additional logging is available
   * @returns {boolean} Whether additional logging is available
   */
  get isAdditionalLoggingEnabled() {
    return process.env.API_LOGGING === 'true'
  }

  /**
   * Check if auth is disabled
   * @returns {boolean} Whether auth is disabled
   */
  get isAuthDisabled() {
    // Should we do this based on test pack? i.e if integration test, then auth is disabled? Maybe not changing it allows us to run integration pack in CDP envs?
    return process.env.AUTH_DISABLED === 'true'
  }
}

// Create a singleton instance
export const testConfig = new TestConfig()

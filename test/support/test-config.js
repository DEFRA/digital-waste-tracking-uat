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
      'ENVIRONMENT',
      'COGNITO_CLIENT_ID',
      'COGNITO_CLIENT_SECRET',
      'COGNITO_OAUTH_BASE_URL'
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

  /**
   * Get the environment name
   * @returns {string} The environment name
   */
  get environment() {
    return process.env.ENVIRONMENT
  }
}

// Create a singleton instance
export const testConfig = new TestConfig()

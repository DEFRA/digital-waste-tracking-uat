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
      'JIRA_BASE_URL',
      'PROXY_MODE'
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
   * Organisation API code for testing GIO org exclude behaviour in pre-prod environments.
   * This shouldn't be used in the production smoke tests.
   * @returns {string} The API code
   */
  get apiCodeInGioOrgExcludeList() {
    return process.env.API_CODE_IN_GIO_ORG_EXCLUDE_LIST
      ? process.env.API_CODE_IN_GIO_ORG_EXCLUDE_LIST
      : undefined
  }

  // Service auth password for the Waste Movement External API to connect to other services
  get serviceAuthPassword() {
    return process.env.SERVICE_AUTH_PASSWORD
  }

  // Service auth password for the Waste Organisation Backend to connect to other services
  get serviceAuthPasswordWasteOrganisationBackend() {
    return process.env.SERVICE_AUTH_PASSWORD_WASTE_ORGANISATION_BACKEND
  }

  get cdpDevApiKey() {
    return process.env.CDP_DEV_API_KEY
  }

  /**
   * Basic auth password for QA-only backend routes (e.g. GET /qa-non-prod/movements).
   * Set in dev/test CDP environments when running retrieve-movement tests.
   * @returns {string|undefined}
   */
  get authPasswordQaNonProd() {
    return process.env.AUTH_PASSWORD_QA_NON_PROD
  }

  /**
   * Basic auth password for POST /production-approval-tests (production-approval-tests user).
   * Set in CDP environments when running production approval API tests.
   * @returns {string|undefined}
   */
  get authPasswordProductionApprovalTests() {
    return process.env.AUTH_PASSWORD_PRODUCTION_APPROVAL_TESTS
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
   * Decide when to honour HTTP_PROXY (CDP sets it implicitly).
   * - off: never use proxy (ignore HTTP_PROXY)
   * - cdp: use proxy only for CDP-required external calls (e.g. Cognito)
   * - zap: use proxy for service calls so ZAP can observe traffic
   * @returns {'off'|'cdp'|'zap'}
   */
  get proxyMode() {
    const value = process.env.PROXY_MODE
    if (value === 'off' || value === 'cdp' || value === 'zap') {
      return value
    }
    throw new Error(
      `Invalid PROXY_MODE "${value}". Expected one of: off, cdp, zap.`
    )
  }

  /**
   * ZAP API key for REST API calls (session clear, report download).
   * @returns {string|undefined}
   */
  get zapApiKey() {
    return process.env.ZAP_API_KEY
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

  get wasteOrganisationBackendApiBaseUrl() {
    return process.env.WASTE_ORGANISATION_BACKEND_API_BASE_URL
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

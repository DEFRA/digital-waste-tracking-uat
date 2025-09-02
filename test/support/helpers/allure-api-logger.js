/**
 * Allure API Logging Helper
 *
 * Provides Allure reporting functionality for API requests and responses
 */

/**
 * Log API request details to Allure report
 * @param {string} method - HTTP method (GET, POST, PUT, etc.)
 * @param {string} endpoint - API endpoint path
 * @param {string} url - Full request URL
 * @param {Object} headers - Request headers
 * @param {string|Object} [data] - Request body data
 */
export async function logAllureRequest(
  method,
  endpoint,
  url,
  headers,
  data = null
) {
  if (globalThis.testConfig.isAdditionalLoggingEnabled) {
    await globalThis.allure.step(
      `${method} Request to ${endpoint}`,
      async () => {
        // Attach request details to Allure report
        globalThis.allure.attachment('Request URL', url, 'text/plain')
        globalThis.allure.attachment(
          'Request Headers',
          JSON.stringify(headers, null, 2),
          'application/json'
        )

        if (data) {
          try {
            // Try to parse as JSON for better formatting
            const jsonData = typeof data === 'string' ? JSON.parse(data) : data
            globalThis.allure.attachment(
              'Request Body',
              JSON.stringify(jsonData, null, 2),
              'application/json'
            )
          } catch {
            // If not JSON, attach as plain text
            globalThis.allure.attachment('Request Body', data, 'text/plain')
          }
        }
      }
    )
  }
}

/**
 * Log API response details to Allure report
 * @param {string} method - HTTP method (GET, POST, PUT, etc.)
 * @param {string} endpoint - API endpoint path
 * @param {number} statusCode - Response status code
 * @param {Object} headers - Response headers
 * @param {Object} body - Response body
 */
export async function logAllureResponse(
  method,
  endpoint,
  statusCode,
  headers,
  body = null
) {
  if (globalThis.testConfig.isAdditionalLoggingEnabled) {
    await globalThis.allure.step(
      `${method} Response from ${endpoint}`,
      async () => {
        globalThis.allure.attachment(
          'Response Status',
          `${statusCode}`,
          'text/plain'
        )
        globalThis.allure.attachment(
          'Response Headers',
          JSON.stringify(headers, null, 2),
          'application/json'
        )
        globalThis.allure.attachment(
          'Response Info',
          `Response received with content-type: ${headers['content-type'] || 'unknown'}`,
          'text/plain'
        )
        if (body) {
          globalThis.allure.attachment(
            'Response Body',
            JSON.stringify(body, null, 2),
            'application/json'
          )
        }
      }
    )
  }
}

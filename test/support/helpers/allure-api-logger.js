/**
 * Allure API Logging Helper
 *
 * Provides Allure reporting functionality for API requests and responses
 */

const REDACTED = '[REDACTED]'

/**
 * Whether Allure attachments should redact sensitive values (prod-smoke runs).
 * @returns {boolean}
 */
function shouldRedactSensitiveAllureData() {
  return process.env.REDACT_SENSITIVE_ALLURE_HEADERS === 'true'
}

/**
 * Whether a header name should be redacted in Allure attachments.
 * @param {string} headerName - Header name
 * @returns {boolean}
 */
function isSensitiveHeaderName(headerName) {
  const lowerName = headerName.toLowerCase()
  return lowerName.includes('authorization') || lowerName === 'x-dwt-client-id'
}

/**
 * Return a copy of headers with sensitive values redacted for Allure.
 * Does not mutate the original headers object.
 * @param {Object} headers - Request or response headers
 * @returns {Object}
 */
function sanitizeHeadersForAllure(headers) {
  if (!shouldRedactSensitiveAllureData()) {
    return headers
  }

  const sanitized = {}
  for (const [key, value] of Object.entries(headers ?? {})) {
    sanitized[key] = isSensitiveHeaderName(key) ? REDACTED : value
  }
  return sanitized
}

/**
 * Recursively redact access_token properties on a cloned value
 * (e.g. Cognito OAuth response bodies).
 * @param {any} value - JSON-like value
 * @returns {any}
 */
function redactAccessTokenDeep(value) {
  if (Array.isArray(value)) {
    return value.map((item) => redactAccessTokenDeep(item))
  }

  if (value !== null && typeof value === 'object') {
    const sanitized = {}
    for (const [key, nestedValue] of Object.entries(value)) {
      sanitized[key] =
        key.toLowerCase() === 'access_token'
          ? REDACTED
          : redactAccessTokenDeep(nestedValue)
    }
    return sanitized
  }

  return value
}

/**
 * Return a copy of a body with access_token redacted for Allure.
 * Does not mutate the original body.
 * @param {string|Object|null} body - Request or response body
 * @returns {string|Object|null}
 */
function sanitizeBodyForAllure(body) {
  if (!shouldRedactSensitiveAllureData() || body == null) {
    return body
  }

  if (typeof body === 'string') {
    try {
      return redactAccessTokenDeep(JSON.parse(body))
    } catch {
      return body
    }
  }

  return redactAccessTokenDeep(body)
}

/**
 * Log API request details to Allure report
 * @param {string} method - HTTP method (GET, POST, PUT, etc.)
 * @param {string} endpoint - API endpoint path
 * @param {string} url - Full request URL
 * @param {Object} headers - Request headers
 * @param {boolean} usingProxy - Whether the request is using a proxy
 * @param {string|Object} [data] - Request body data
 */
export async function logAllureRequest(
  method,
  endpoint,
  url,
  headers,
  usingProxy,
  data = null
) {
  if (globalThis.testConfig.isAdditionalLoggingEnabled && globalThis.allure) {
    await globalThis.allure.step(
      `${method} Request to ${endpoint}`,
      async () => {
        const sanitizedHeaders = sanitizeHeadersForAllure(headers)

        // Attach request details to Allure report
        globalThis.allure.attachment('Request URL', url, 'text/plain')
        globalThis.allure.attachment(
          'Request Headers',
          JSON.stringify(sanitizedHeaders, null, 2),
          'application/json'
        )
        if (usingProxy) {
          globalThis.allure.attachment(
            'Using Proxy URL',
            globalThis.testConfig.httpProxy,
            'text/plain'
          )
        }
        if (data) {
          try {
            // Try to parse as JSON for better formatting
            const jsonData = typeof data === 'string' ? JSON.parse(data) : data
            const sanitizedBody = sanitizeBodyForAllure(jsonData)
            globalThis.allure.attachment(
              'Request Body',
              JSON.stringify(sanitizedBody, null, 2),
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
  if (globalThis.testConfig.isAdditionalLoggingEnabled && globalThis.allure) {
    await globalThis.allure.step(
      `${method} Response from ${endpoint}`,
      async () => {
        const sanitizedHeaders = sanitizeHeadersForAllure(headers)
        const sanitizedBody = sanitizeBodyForAllure(body)

        globalThis.allure.attachment(
          'Response Status',
          `${statusCode}`,
          'text/plain'
        )
        globalThis.allure.attachment(
          'Response Headers',
          JSON.stringify(sanitizedHeaders, null, 2),
          'application/json'
        )
        globalThis.allure.attachment(
          'Response Info',
          `Response received with content-type: ${headers['content-type'] || 'unknown'}`,
          'text/plain'
        )
        if (sanitizedBody) {
          globalThis.allure.attachment(
            'Response Body',
            JSON.stringify(sanitizedBody, null, 2),
            'application/json'
          )
        }
      }
    )
  }
}

/**
 * Add Allure links (issues, test management links, etc.) to test reports
 * @param {string} url - The URL of the link
 * @param {string} name - The name/title for the link
 * @param {string} [type='link'] - The type of link ('issue', 'tms', 'link', 'jira', etc.)
 */
export async function addAllureLink(url, name, type = 'link') {
  if (!globalThis.allure) {
    return
  }

  if (type === 'issue') {
    await globalThis.allure.issue(globalThis.testConfig.jiraBaseUrl + url, name)
  } else {
    await globalThis.allure.link(
      globalThis.testConfig.jiraBaseUrl + url,
      name,
      type
    )
  }
}

import { GetWebIdentityTokenCommand, STSClient } from '@aws-sdk/client-sts'

// Long enough for a run's calls to share a token
const tokenDurationSeconds = 900

// Renews a token a minute before it expires, so a call doesn't arrive with one
// that has just run out
const earlyRefreshMs = 60_000

/** @type {Map<string, { token: string, expiresAt: number }>} */
const cachedByAudience = new Map()

/**
 * An AWS STS web identity token for the given audience (CDP's
 * service-to-service auth), cached and renewed before it expires. On CDP it
 * names this test suite's role; locally, the aws-sts-stub in the shared compose
 * names AWS_ACCESS_KEY_ID instead.
 * @param {string} audience - The service the token is for, e.g. dwt-client-sync
 * @returns {Promise<string>} The token
 */
export async function stsToken(audience) {
  const cached = cachedByAudience.get(audience)
  if (cached && cached.expiresAt - Date.now() > earlyRefreshMs) {
    return cached.token
  }

  const { WebIdentityToken, Expiration } = await new STSClient({}).send(
    new GetWebIdentityTokenCommand({
      Audience: [audience],
      SigningAlgorithm: 'RS256',
      DurationSeconds: tokenDurationSeconds
    })
  )
  cachedByAudience.set(audience, {
    token: WebIdentityToken,
    expiresAt: new Date(Expiration).getTime()
  })
  return WebIdentityToken
}

// A service rather than test code, so it logs to its container's output
/* eslint-disable no-console */
// A fake of CDP's credentials API for the shared stack, so client sync's
// create, rotate, purge and delete can be tested locally and in GitHub
// Actions. Like CDP, it's a layer over Cognito: here Floci's user pool, which
// the external API also trusts, so a secret it returns can be used to sign in.
//
// It follows CDP's documented behaviour:
// https://github.com/DEFRA/cdp-documentation/blob/main/how-to/managing_cognito_credentials.md
// It doesn't check request signatures.
import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'

// The user pool behind each service, created by floci/start.d
export const userPools = {
  'waste-movement-external-api': 'eu-west-2_LOCAL'
}

// What a CDP client is allowed to do: get tokens for the service's API
const scopeServer = 'waste-movement-external-api-resource-srv'
const clientSettings = {
  AllowedOAuthFlows: ['client_credentials'],
  AllowedOAuthScopes: [`${scopeServer}/access`],
  AllowedOAuthFlowsUserPoolClient: true
}

// Names that make CDP behave as it does in cases that are hard to set up:
// skipping a name as if it already exists, or refusing the request
const skippedName = 'Skipped_By_Cdp'
const refusedName = 'Refused_By_Cdp'

const routePattern = /^\/tenants\/services\/([^/]+)\/user-pool\/([a-z-]+)$/

class CdpError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

const randomId = () =>
  [...randomBytes(26)]
    .map((byte) => 'abcdefghijklmnopqrstuvwxyz0123456789'[byte % 36])
    .join('')

// Floci only accepts a supplied secret of 24 to 64 word characters
const randomSecret = () => randomBytes(24).toString('hex')

// CDP's format for a creation date: microseconds and +00:00, e.g.
// 2026-10-16T06:25:07.342000+00:00
const toCdpDate = (date) => date.toISOString().replace('Z', '000+00:00')

// The list is paginated: at most 60 clients a page, with an opaque token for
// the next page. Here the token is the position of the next client
const maxPageSize = 60
const toToken = (offset) => Buffer.from(`offset:${offset}`).toString('base64')
const fromToken = (token) => {
  const [, offset] =
    Buffer.from(token, 'base64')
      .toString()
      .match(/^offset:(\d+)$/) ?? []
  if (offset === undefined) {
    throw new CdpError(400, 'Invalid next_token')
  }
  return Number(offset)
}

/**
 * @param {Object} [options]
 * @param {string} [options.flociUrl] - Floci's Cognito endpoint
 * @param {Object} [options.pools] - The user pool behind each service
 * @returns {import('node:http').Server} The fake, not yet listening
 */
export function createFakeCdp({
  flociUrl = process.env.FLOCI_URL ?? 'http://floci:4566',
  pools = userPools
} = {}) {
  // Floci accepts unsigned requests in Cognito's JSON protocol
  const cognito = async (action, body) => {
    const response = await fetch(flociUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': `AWSCognitoIdentityProviderService.${action}`
      },
      body: JSON.stringify(body)
    })
    const result = await response.json()
    if (!response.ok) {
      throw new Error(
        `Floci ${action} failed: ${result.__type ?? response.status} ${result.message ?? result.Message ?? ''}`
      )
    }
    return result
  }

  const listClients = async (poolId) => {
    const clients = []
    let token
    do {
      const page = await cognito('ListUserPoolClients', {
        UserPoolId: poolId,
        MaxResults: 60,
        ...(token && { NextToken: token })
      })
      clients.push(
        ...page.UserPoolClients.map(({ ClientId, ClientName }) => ({
          id: ClientId,
          name: ClientName
        }))
      )
      token = page.NextToken
    } while (token)
    return clients
  }

  // A secret's id ends with its creation time in milliseconds, as CDP's do.
  // Floci's creation dates are whole seconds, which can't order two secrets
  // made in the same second, so the id is used for both
  const listSecrets = async (poolId, clientId) => {
    const { ClientSecrets } = await cognito('ListUserPoolClientSecrets', {
      UserPoolId: poolId,
      ClientId: clientId
    })
    return ClientSecrets.map(({ ClientSecretId }) => ({
      id: ClientSecretId,
      createdAt: new Date(Number(ClientSecretId.split('--').at(-1)))
    })).sort((a, b) => a.createdAt - b.createdAt)
  }

  const deleteSecret = (poolId, clientId, secretId) =>
    cognito('DeleteUserPoolClientSecret', {
      UserPoolId: poolId,
      ClientId: clientId,
      ClientSecretId: secretId
    })

  // Adds a random secret. The fake chooses its own, as Floci's pool gives
  // every new client the secret "local" (so the seeded clients have a known
  // one), and Floci would otherwise generate one we couldn't return
  const addSecret = async (poolId, clientId) => {
    const value = randomSecret()
    const { ClientSecretDescriptor } = await cognito(
      'AddUserPoolClientSecret',
      { UserPoolId: poolId, ClientId: clientId, ClientSecret: value }
    )
    return { id: ClientSecretDescriptor.ClientSecretId, value }
  }

  // Requests run one at a time per pool, as each is several calls to Floci:
  // two creates of one name would otherwise both pass the check, and a list
  // could see a new client before it's renamed
  const queues = new Map()
  const oneAtATime = (poolId, work) => {
    const result = (queues.get(poolId) ?? Promise.resolve()).then(work)
    queues.set(
      poolId,
      result.catch(() => {})
    )
    return result
  }

  const named = (clients, names) =>
    clients.filter((client) => names.includes(client.name))

  const response = (service, poolId, clientDetails) => ({
    cognito_user_pool_id: poolId,
    request_id: randomBytes(16).toString('hex'),
    tenant_service_name: service,
    client_details: clientDetails
  })

  const details = (client, secret = null) => ({
    client_name: client.name,
    client_id: client.id,
    client_secret: secret
  })

  const actions = {
    // A page of clients, each with its secrets' ids and creation dates but
    // never their values
    'fetch-details': async (service, poolId, _body, query) => {
      const pageSize = Number(query.get('page_size') ?? maxPageSize)
      if (
        !Number.isInteger(pageSize) ||
        pageSize < 1 ||
        pageSize > maxPageSize
      ) {
        throw new CdpError(400, `page_size must be from 1 to ${maxPageSize}`)
      }

      const token = query.get('next_token')
      const offset = token ? fromToken(token) : 0
      const end = offset + pageSize
      const clients = await listClients(poolId)

      const page = await Promise.all(
        clients.slice(offset, end).map(async (client) => ({
          ...details(client),
          client_secrets: (await listSecrets(poolId, client.id)).map(
            ({ id, createdAt }) => ({ id, created_at: toCdpDate(createdAt) })
          )
        }))
      )

      return {
        ...response(service, poolId, page),
        next_token: end < clients.length ? toToken(end) : null
      }
    },

    // Existing names are skipped, and only new clients are returned
    'create-clients': async (service, poolId, { client_names: names }) => {
      if (names.includes(refusedName)) {
        throw new CdpError(403, 'Forbidden')
      }

      const existing = new Set((await listClients(poolId)).map((c) => c.name))
      const created = []
      for (const name of new Set(names)) {
        if (name === skippedName || existing.has(name)) {
          continue
        }

        // Floci's pool uses a new client's name as its id, so it's created
        // under a CDP-style id and then renamed. Settings are sent again, as
        // an update resets any it omits
        const { UserPoolClient } = await cognito('CreateUserPoolClient', {
          UserPoolId: poolId,
          ClientName: randomId(),
          GenerateSecret: true,
          ...clientSettings
        })
        const id = UserPoolClient.ClientId

        // Removes the client if a later step fails, so a half-made client,
        // still named by its id or with the secret "local", isn't left behind
        let secret
        try {
          await cognito('UpdateUserPoolClient', {
            UserPoolId: poolId,
            ClientId: id,
            ClientName: name,
            ...clientSettings
          })

          const [poolSecret] = await listSecrets(poolId, id)
          secret = await addSecret(poolId, id)
          await deleteSecret(poolId, id, poolSecret.id)
        } catch (err) {
          await cognito('DeleteUserPoolClient', {
            UserPoolId: poolId,
            ClientId: id
          }).catch(() => {})
          throw err
        }

        created.push(details({ id, name }, secret.value))
      }

      return response(service, poolId, created)
    },

    // The existing secret is kept, but a client holds at most two
    'rotate-client-credentials': async (
      service,
      poolId,
      { client_names: names }
    ) => {
      const rotated = []
      for (const client of named(await listClients(poolId), names)) {
        const secrets = await listSecrets(poolId, client.id)
        if (secrets.length >= 2) {
          await deleteSecret(poolId, client.id, secrets[0].id)
        }
        const secret = await addSecret(poolId, client.id)
        rotated.push(details(client, secret.value))
      }

      return response(service, poolId, rotated)
    },

    // Every secret but the newest goes, or only those older than the cutoff
    'purge-old-client-credentials': async (
      service,
      poolId,
      { client_names: names, creation_cutoff: cutoffText }
    ) => {
      const cutoff = cutoffText === undefined ? null : new Date(cutoffText)

      if (cutoff && Number.isNaN(cutoff.getTime())) {
        throw new CdpError(400, 'creation_cutoff must be an ISO 8601 date-time')
      }

      const purged = named(await listClients(poolId), names)
      for (const client of purged) {
        const secrets = await listSecrets(poolId, client.id)
        for (const secret of secrets.slice(0, -1)) {
          if (!cutoff || secret.createdAt < cutoff) {
            await deleteSecret(poolId, client.id, secret.id)
          }
        }
      }

      return response(
        service,
        poolId,
        purged.map((client) => details(client))
      )
    },

    // Always returns no clients, however many were deleted
    'delete-clients': async (service, poolId, { client_names: names }) => {
      for (const client of named(await listClients(poolId), names)) {
        await cognito('DeleteUserPoolClient', {
          UserPoolId: poolId,
          ClientId: client.id
        })
      }

      return response(service, poolId, [])
    }
  }

  return createServer(async (req, res) => {
    const send = (statusCode, body) => {
      // Never log bodies: they can hold client secrets. Health checks run
      // every few seconds, so they aren't logged
      if (!req.url.startsWith('/health')) {
        console.log(`${req.method} ${req.url} ${statusCode}`)
      }
      res.writeHead(statusCode, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(body))
    }

    try {
      // Inside the try, so a malformed URL is an error response, not a crash
      let url
      try {
        url = new URL(req.url, 'http://fake-cdp')
      } catch {
        throw new CdpError(400, 'Invalid URL')
      }

      if (req.method === 'GET' && url.pathname === '/health') {
        return send(200, { message: 'success' })
      }

      const [, service, action] = url.pathname.match(routePattern) ?? []
      const isFetch = action === 'fetch-details'

      if (!actions[action] || req.method !== (isFetch ? 'GET' : 'POST')) {
        throw new CdpError(404, 'Not Found')
      }

      // CDP only accepts signed requests. The signature isn't checked here
      if (!req.headers.authorization) {
        throw new CdpError(403, 'Missing Authentication Token')
      }

      // CDP doesn't validate the service name up front, so a wrong one fails
      const serviceName = decodeURIComponent(service)
      const poolId = Object.hasOwn(pools, serviceName)
        ? pools[serviceName]
        : undefined
      if (!poolId) {
        throw new CdpError(400, `Unknown service ${service}`)
      }

      if (isFetch) {
        return send(
          200,
          await oneAtATime(poolId, () =>
            actions[action](service, poolId, null, url.searchParams)
          )
        )
      }

      if (!req.headers['content-type']?.startsWith('application/json')) {
        throw new CdpError(415, 'Unsupported Media Type')
      }

      let body
      try {
        let text = ''
        for await (const chunk of req) {
          text += chunk
        }
        body = JSON.parse(text)
      } catch {
        throw new CdpError(400, 'Invalid JSON')
      }

      const names = body?.client_names
      if (
        !Array.isArray(names) ||
        !names.every((name) => typeof name === 'string')
      ) {
        throw new CdpError(400, 'client_names must be an array of strings')
      }

      return send(
        200,
        await oneAtATime(poolId, () => actions[action](service, poolId, body))
      )
    } catch (err) {
      if (err instanceof CdpError) {
        return send(err.statusCode, { message: err.message })
      }

      console.error(err)
      return send(500, { message: 'Internal Server Error' })
    }
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 1080)
  createFakeCdp().listen(port, () =>
    console.log(`Fake CDP credentials API listening on ${port}`)
  )
}

// A service rather than test code, so it logs to its container's output
/* eslint-disable no-console */

// A fake of CDP's credentials API for the shared stack, so client sync's
// create, rotate and delete can be tested locally and in GitHub Actions. It
// keeps clients and secrets in memory, so they're reset when it restarts.
//
// It follows CDP's documented behaviour:
// https://github.com/DEFRA/cdp-documentation/blob/main/how-to/managing_cognito_credentials.md
// It doesn't check request signatures, and its secrets don't work with any
// Cognito, so tests that sign in with them need a real CDP environment.

import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'

const userPoolId = 'eu-west-2_LOCAL'

// What CDP's pool holds when the stack starts: the clients the tests and the
// admin UI expect, including the seeded test clients Floci signs in
export const seedClients = {
  'waste-movement-external-api': [
    { name: 'Acme Waste Software', id: '1a2b3c4d5e6f7g8h9i0j009988' },
    { name: 'Beta Tracking Ltd', id: '9z8y7x6w5v4u3t2s1r0q5rt43e' },
    { name: 'Test Client 1', id: '1234567890abcdef1234567890' },
    { name: 'Test Client 2', id: '0987654321fedcba0987654321' },
    { name: 'Test Client 3', id: 'abcdefghijklmnopqrstuvwxyz' }
  ]
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

// Secret ids are the client id and creation time, as CDP's are
let secretCount = 0
const newSecret = (clientId) => ({
  id: `${clientId}--${Date.now() + secretCount++}`,
  value: randomBytes(32).toString('base64url'),
  createdAt: new Date()
})

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
 * @param {Object} [seed] - The clients each service starts with
 * @returns {import('node:http').Server} The fake, not yet listening
 */
export function createFakeCdp(seed = seedClients) {
  // Clients by service name: { name, id, secrets: [{ value, createdAt }] },
  // with secrets oldest first
  const pools = new Map(
    Object.entries(seed).map(([service, clients]) => [
      service,
      clients.map(({ name, id }) => ({ name, id, secrets: [newSecret(id)] }))
    ])
  )

  const response = (service, clientDetails) => ({
    cognito_user_pool_id: userPoolId,
    request_id: randomBytes(16).toString('hex'),
    tenant_service_name: service,
    client_details: clientDetails
  })

  const details = (client, secret = null) => ({
    client_name: client.name,
    client_id: client.id,
    client_secret: secret
  })

  const named = (pool, names) =>
    pool.filter((client) => names.includes(client.name))

  const actions = {
    // A page of clients, each with its secrets' ids and creation dates but
    // never their values
    'fetch-details': (service, pool, _body, query) => {
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

      return {
        ...response(
          service,
          pool.slice(offset, end).map((client) => ({
            ...details(client),
            client_secrets: client.secrets.map(({ id, createdAt }) => ({
              id,
              created_at: createdAt.toISOString()
            }))
          }))
        ),
        next_token: end < pool.length ? toToken(end) : null
      }
    },

    // Existing names are skipped, and only new clients are returned
    'create-clients': (service, pool, { client_names: names }) => {
      if (names.includes(refusedName)) {
        throw new CdpError(403, 'Forbidden')
      }

      const created = names
        .filter(
          (name) =>
            name !== skippedName && !pool.some((client) => client.name === name)
        )
        .map((name) => {
          const id = randomId()
          return { name, id, secrets: [newSecret(id)] }
        })

      pool.push(...created)

      return response(
        service,
        created.map((client) => details(client, client.secrets[0].value))
      )
    },

    // The existing secret is kept, but a client holds at most two
    'rotate-client-credentials': (service, pool, { client_names: names }) =>
      response(
        service,
        named(pool, names).map((client) => {
          const secret = newSecret(client.id)
          client.secrets = [...client.secrets, secret].slice(-2)
          return details(client, secret.value)
        })
      ),

    // Every secret but the newest goes, or only those older than the cutoff
    'purge-old-client-credentials': (
      service,
      pool,
      { client_names: names, creation_cutoff: cutoffText }
    ) => {
      const cutoff = cutoffText === undefined ? null : new Date(cutoffText)

      if (cutoff && Number.isNaN(cutoff.getTime())) {
        throw new CdpError(400, 'creation_cutoff must be an ISO 8601 date-time')
      }

      const purged = named(pool, names)
      for (const client of purged) {
        const newest = client.secrets.at(-1)
        client.secrets = client.secrets.filter(
          (secret) =>
            secret === newest || (cutoff && secret.createdAt >= cutoff)
        )
      }

      return response(
        service,
        purged.map((client) => details(client))
      )
    },

    // Always returns no clients, however many were deleted
    'delete-clients': (service, pool, { client_names: names }) => {
      const remaining = pool.filter((client) => !names.includes(client.name))
      pool.splice(0, pool.length, ...remaining)

      return response(service, [])
    }
  }

  return createServer(async (req, res) => {
    const send = (statusCode, body) => {
      // Never log bodies: they can hold client secrets. Health checks run
      // every few seconds, so they aren't logged
      if (url.pathname !== '/health') {
        console.log(`${req.method} ${req.url} ${statusCode}`)
      }
      res.writeHead(statusCode, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(body))
    }

    const url = new URL(req.url, 'http://fake-cdp')

    try {
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
      const pool = pools.get(decodeURIComponent(service))
      if (!pool) {
        throw new CdpError(400, `Unknown service ${service}`)
      }

      if (isFetch) {
        return send(200, actions[action](service, pool, null, url.searchParams))
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

      return send(200, actions[action](service, pool, body))
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

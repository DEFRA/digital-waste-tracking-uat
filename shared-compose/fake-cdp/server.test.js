import { after, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { connect } from 'node:net'

import { createFakeCdp } from './server.js'

// The fake manages clients in Floci, so these tests start their own Floci
// (which needs Docker) with a pool set up like the shared stack's
const flociImage = 'floci/floci:2.1.0-compat'
const flociContainer = `fake-cdp-test-floci-${process.pid}`
const service = 'waste-movement-external-api'
const poolId = 'eu-west-2_LOCAL'
const scopeServer = 'waste-movement-external-api-resource-srv'
const seededId = 'seededclientid0000000000000'

describe('Fake CDP credentials API', () => {
  let flociUrl
  let server
  let baseUrl

  const cognito = async (action, body) => {
    const response = await fetch(flociUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': `AWSCognitoIdentityProviderService.${action}`
      },
      body: JSON.stringify(body)
    })
    return response.json()
  }

  // Whether a client id and secret get a token from Floci, as the external
  // API's callers do
  const signsIn = async (clientId, clientSecret) => {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64'
    )
    const response = await fetch(`${flociUrl}/cognito-idp/oauth2/token`, {
      method: 'POST',
      headers: {
        authorization: `Basic ${credentials}`,
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=client_credentials&scope=${scopeServer}/access`
    })
    return response.status === 200
  }

  async function call(action, body, { headers = {}, method } = {}) {
    const response = await fetch(
      `${baseUrl}/tenants/services/${service}/user-pool/${action}`,
      {
        method: method ?? (body === undefined ? 'GET' : 'POST'),
        headers: {
          authorization: 'AWS4-HMAC-SHA256 signed',
          ...(body !== undefined && { 'content-type': 'application/json' }),
          ...headers
        },
        body: body === undefined ? undefined : JSON.stringify(body)
      }
    )

    return { status: response.status, body: await response.json() }
  }

  // The single-client fetch-details differs from the all-clients one in URL
  // (a `clients/${client_id}` segment), so it has its own helper
  const callSingleClientFetchDetails = async (clientId) =>
    call(
      `clients/${clientId}/fetch-details`,
      undefined,
      { method: 'GET' }
    )

  const list = async () =>
    (await call('fetch-details')).body.client_details
      .map(({ client_name: name }) => name)
      .sort()

  const create = async (name) =>
    (await call('create-clients', { client_names: [name] })).body
      .client_details[0]

  const rotate = async (name) =>
    (await call('rotate-client-credentials', { client_names: [name] })).body
      .client_details

  const purge = (name) =>
    call('purge-old-client-credentials', { client_names: [name] })

  before(async () => {
    execFileSync('docker', [
      'run',
      '-d',
      '--rm',
      '--name',
      flociContainer,
      '-p',
      '127.0.0.1::4566',
      '-e',
      'FLOCI_DEFAULT_REGION=eu-west-2',
      flociImage
    ])
    const port = execFileSync('docker', ['port', flociContainer, '4566'])
      .toString()
      .trim()
      .split(':')
      .at(-1)
    flociUrl = `http://127.0.0.1:${port}`

    for (let attempt = 0; ; attempt++) {
      try {
        await fetch(flociUrl)
        break
      } catch (err) {
        if (attempt > 60) throw err
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    // As in floci/start.d: a pinned id, client names used as ids, and the
    // secret "local" for every new client
    await cognito('CreateUserPool', {
      PoolName: 'fake-cdp-test',
      UserPoolTags: {
        'floci:override-id': poolId,
        'floci:override-cognito-client-id': 'use-name',
        'floci:override-cognito-client-secret': 'local'
      }
    })
    await cognito('CreateResourceServer', {
      UserPoolId: poolId,
      Identifier: scopeServer,
      Name: scopeServer,
      Scopes: [{ ScopeName: 'access', ScopeDescription: 'access' }]
    })
  })

  // Each test starts with only the seeded client, as floci/start.d seeds it
  beforeEach(async () => {
    const { UserPoolClients } = await cognito('ListUserPoolClients', {
      UserPoolId: poolId,
      MaxResults: 60
    })
    for (const { ClientId } of UserPoolClients) {
      await cognito('DeleteUserPoolClient', { UserPoolId: poolId, ClientId })
    }
    await cognito('CreateUserPoolClient', {
      UserPoolId: poolId,
      ClientName: seededId,
      GenerateSecret: true
    })
    await cognito('UpdateUserPoolClient', {
      UserPoolId: poolId,
      ClientId: seededId,
      ClientName: 'Seeded Client',
      AllowedOAuthFlows: ['client_credentials'],
      AllowedOAuthScopes: [`${scopeServer}/access`],
      AllowedOAuthFlowsUserPoolClient: true
    })

    server?.close()
    server = createFakeCdp({ flociUrl })
    await new Promise((resolve) => server.listen(0, resolve))
    baseUrl = `http://localhost:${server.address().port}`
  })

  after(() => {
    server?.close()
    try {
      execFileSync('docker', ['stop', flociContainer], { stdio: 'ignore' })
    } catch {
      // It never started, or has already gone
    }
  })

  describe('fetch-details (single client)', () => {
    // Fetches from `${baseUrl}/tenants/services/${service}/user-pool/clients/${client_id}/fetch-details`,
    test("lists a single client with secrets' ids and dates, but not their values", async () => {
      const { status, body } = await callSingleClientFetchDetails(seededId)

      assert.equal(status, 200)
      assert.equal(body.cognito_user_pool_id, poolId)
      assert.equal(body.tenant_service_name, service)
      assert.deepEqual(Object.keys(body.client_details), [
        'client_name',
        'client_id',
        'created_at',
        'last_modified_at',
        'allowed_oauth_flows',
        'allowed_oauth_scopes',
        'allowed_oauth_flows_user_pool_client',
        'explicit_auth_flows',
        'access_token_validity',
        'id_token_validity',
        'refresh_token_validity',
        'token_validity_units',
        'client_secrets'
      ])
      assert.equal(body.client_details.client_name, 'Seeded Client')
      assert.equal(body.client_details.client_id, seededId)
      assert.equal(body.client_details.client_secret, undefined)
      assert.equal(body.client_details.client_secrets.length, 1)
      assert.match(
        body.client_details.client_secrets[0].id,
        new RegExp(`^${seededId}--\\d+$`)
      )
      assert.deepEqual(Object.keys(body.client_details.client_secrets[0]), [
        'id',
        'created_at'
      ])
    })

    test('lists a rotated client with both secrets', async () => {
      await rotate('Seeded Client')

      const { body } = await callSingleClientFetchDetails(seededId)

      assert.equal(body.client_details.client_secrets.length, 2)
    })

    test("gives each secret an id ending in its creation time, and CDP's date format", async () => {
      await rotate('Seeded Client')

      const { body } = await callSingleClientFetchDetails(seededId)

      for (const secret of body.client_details.client_secrets) {
        assert.match(
          secret.created_at,
          /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{6}\+00:00$/
        )
        assert.equal(
          Number(secret.id.split('--')[1]),
          Date.parse(secret.created_at)
        )
      }
    })
  })

  describe('fetch-details (all clients)', () => {
    test("lists the clients with their secrets' ids and dates, but not their values", async () => {
      const { status, body } = await call('fetch-details')
      const [client] = body.client_details

      assert.equal(status, 200)
      assert.equal(body.cognito_user_pool_id, poolId)
      assert.equal(body.tenant_service_name, service)
      assert.equal(body.next_token, null)
      assert.equal(client.client_name, 'Seeded Client')
      assert.equal(client.client_id, seededId)
      assert.equal(client.client_secret, null)
      assert.equal(client.client_secrets.length, 1)
      assert.match(
        client.client_secrets[0].id,
        new RegExp(`^${seededId}--\\d+$`)
      )
      assert.deepEqual(Object.keys(client.client_secrets[0]), [
        'id',
        'created_at'
      ])
    })

    test('lists a rotated client with both secrets', async () => {
      await rotate('Seeded Client')

      const { body } = await call('fetch-details')

      assert.equal(body.client_details[0].client_secrets.length, 2)
    })

    test('pages through the clients, following next_token', async () => {
      for (const name of ['B', 'C', 'D', 'E']) {
        await create(name)
      }

      const names = []
      let token = null
      let pages = 0
      do {
        const query = new URLSearchParams({
          page_size: '2',
          ...(token && { next_token: token })
        })
        const { body } = await call(`fetch-details?${query}`)
        names.push(...body.client_details.map(({ client_name: n }) => n))
        token = body.next_token
        pages++
      } while (token)

      assert.deepEqual(names.sort(), ['B', 'C', 'D', 'E', 'Seeded Client'])
      assert.equal(pages, 3)
    })

    test("gives each secret an id ending in its creation time, and CDP's date format", async () => {
      await rotate('Seeded Client')

      const { body } = await call('fetch-details')

      for (const secret of body.client_details[0].client_secrets) {
        assert.match(
          secret.created_at,
          /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{6}\+00:00$/
        )
        assert.equal(
          Number(secret.id.split('--')[1]),
          Date.parse(secret.created_at)
        )
      }
    })

    for (const [description, query] of [
      ['a page size over 60', 'page_size=61'],
      ['a page size of 0', 'page_size=0'],
      ['an invalid token', 'next_token=not-a-token'],
      ['a page size that is not a number', 'page_size=abc'],
      ['a page size that is not whole', 'page_size=1.5']
    ]) {
      test(`rejects ${description}`, async () => {
        const { status } = await call(`fetch-details?${query}`)

        assert.equal(status, 400)
      })
    }
  })

  describe('create-clients', () => {
    test('creates a client in Floci with a CDP-style id, which is then listed', async () => {
      const created = await create('New_Client')

      assert.equal(created.client_name, 'New_Client')
      assert.match(created.client_id, /^[a-z0-9]{26}$/)
      assert.ok(created.client_secret)
      assert.deepEqual(await list(), ['New_Client', 'Seeded Client'])
    })

    test('returns a secret that signs in, not the pool-wide "local"', async () => {
      const created = await create('New_Client')

      assert.notEqual(created.client_secret, 'local')
      assert.equal(
        await signsIn(created.client_id, created.client_secret),
        true
      )
      assert.equal(await signsIn(created.client_id, 'local'), false)
    })

    test('skips a name that already exists', async () => {
      const { body } = await call('create-clients', {
        client_names: ['Seeded Client']
      })

      assert.deepEqual(body.client_details, [])
      assert.deepEqual(await list(), ['Seeded Client'])
    })

    test('skips Skipped_By_Cdp as if it already exists', async () => {
      assert.equal(await create('Skipped_By_Cdp'), undefined)
    })

    test('creates a name requested twice at once only once', async () => {
      await Promise.all([create('New_Client'), create('New_Client')])

      assert.deepEqual(await list(), ['New_Client', 'Seeded Client'])
    })

    test("removes a client it couldn't finish creating", async () => {
      // A proxy in front of Floci that rejects the rename, as Cognito would
      // a name it doesn't allow
      const proxy = createServer(async (req, res) => {
        let body = ''
        for await (const chunk of req) body += chunk
        if (req.headers['x-amz-target']?.endsWith('.UpdateUserPoolClient')) {
          res.writeHead(400, { 'content-type': 'application/json' })
          return res.end(
            JSON.stringify({
              __type: 'InvalidParameterException',
              message: 'Invalid client name'
            })
          )
        }
        const forwarded = await fetch(flociUrl, {
          method: 'POST',
          headers: {
            'content-type': req.headers['content-type'],
            'x-amz-target': req.headers['x-amz-target']
          },
          body
        })
        res.writeHead(forwarded.status, {
          'content-type': 'application/json'
        })
        res.end(await forwarded.text())
      })
      await new Promise((resolve) => proxy.listen(0, resolve))
      server.close()
      server = createFakeCdp({
        flociUrl: `http://localhost:${proxy.address().port}`
      })
      await new Promise((resolve) => server.listen(0, resolve))
      baseUrl = `http://localhost:${server.address().port}`

      try {
        const { status } = await call('create-clients', {
          client_names: ['New_Client']
        })

        assert.equal(status, 500)
        assert.deepEqual(await list(), ['Seeded Client'])
      } finally {
        proxy.close()
      }
    })

    test('refuses Refused_By_Cdp', async () => {
      const { status } = await call('create-clients', {
        client_names: ['Refused_By_Cdp']
      })

      assert.equal(status, 403)
    })
  })

  describe('rotate-client-credentials', () => {
    test('returns a new secret, and both secrets sign in', async () => {
      const created = await create('New_Client')

      const [rotated] = await rotate('New_Client')

      assert.equal(rotated.client_name, 'New_Client')
      assert.notEqual(rotated.client_secret, created.client_secret)
      assert.equal(
        await signsIn(created.client_id, created.client_secret),
        true
      )
      assert.equal(
        await signsIn(created.client_id, rotated.client_secret),
        true
      )
    })

    test('removes the oldest secret when there are already two', async () => {
      const created = await create('New_Client')

      await rotate('New_Client')
      const [second] = await rotate('New_Client')

      assert.equal(
        await signsIn(created.client_id, created.client_secret),
        false
      )
      assert.equal(await signsIn(created.client_id, second.client_secret), true)
    })

    test('skips a client that does not exist', async () => {
      assert.deepEqual(await rotate('Nobody'), [])
    })
  })

  describe('purge-old-client-credentials', () => {
    test('removes all but the newest secret', async () => {
      const created = await create('New_Client')
      const [rotated] = await rotate('New_Client')

      await purge('New_Client')

      assert.equal(
        await signsIn(created.client_id, created.client_secret),
        false
      )
      assert.equal(
        await signsIn(created.client_id, rotated.client_secret),
        true
      )
    })

    test('leaves a client with only one secret as it is', async () => {
      const created = await create('New_Client')

      await purge('New_Client')

      assert.equal(
        await signsIn(created.client_id, created.client_secret),
        true
      )
    })

    test('rejects a malformed cutoff', async () => {
      const { status } = await call('purge-old-client-credentials', {
        client_names: ['Seeded Client'],
        creation_cutoff: 'yesterday'
      })

      assert.equal(status, 400)
    })

    test('lists the clients processed, without secrets', async () => {
      await rotate('Seeded Client')

      const { body } = await purge('Seeded Client')

      assert.deepEqual(body.client_details, [
        {
          client_name: 'Seeded Client',
          client_id: seededId,
          client_secret: null
        }
      ])
    })
  })

  describe('delete-clients', () => {
    test('deletes the client, so its secret stops working, and returns no clients', async () => {
      const created = await create('New_Client')

      const { body } = await call('delete-clients', {
        client_names: ['New_Client']
      })

      assert.deepEqual(body.client_details, [])
      assert.deepEqual(await list(), ['Seeded Client'])
      assert.equal(
        await signsIn(created.client_id, created.client_secret),
        false
      )
    })
  })

  describe('requests CDP rejects', () => {
    test('an unsigned request', async () => {
      const { status } = await call('fetch-details', undefined, {
        headers: { authorization: '' }
      })

      assert.equal(status, 403)
    })

    for (const unknown of ['unknown-service', 'constructor']) {
      test(`an unknown service (${unknown})`, async () => {
        const response = await fetch(
          `${baseUrl}/tenants/services/${unknown}/user-pool/fetch-details`,
          { headers: { authorization: 'signed' } }
        )

        assert.equal(response.status, 400)
      })
    }

    test('a POST that is not JSON', async () => {
      const { status } = await call(
        'create-clients',
        { client_names: ['New_Client'] },
        { headers: { 'content-type': 'text/plain' } }
      )

      assert.equal(status, 415)
    })

    test('a body without client_names', async () => {
      const { status } = await call('create-clients', {})

      assert.equal(status, 400)
    })

    test('a malformed URL, without crashing', async () => {
      const raw = await new Promise((resolve, reject) => {
        const socket = connect(server.address().port, 'localhost', () =>
          socket.write(
            'GET //[ HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n'
          )
        )
        let text = ''
        socket.on('data', (chunk) => (text += chunk))
        socket.on('end', () => resolve(text))
        socket.on('error', reject)
      })

      assert.match(raw, /^HTTP\/1\.1 400/)
      assert.equal((await call('fetch-details')).status, 200)
    })

    test('an unknown route', async () => {
      const { status } = await call('nope', undefined)

      assert.equal(status, 404)
    })
  })
})

import { after, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { connect } from 'node:net'

import { createFakeCdp } from './server.js'

const service = 'waste-movement-external-api'
const seed = {
  [service]: [{ name: 'Seeded Client', id: 'seededclientid0000000000000' }]
}

describe('Fake CDP credentials API', () => {
  let server
  let baseUrl

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

  const list = async () =>
    (await call('fetch-details')).body.client_details.map(
      ({ client_name: name }) => name
    )

  const create = async (name) =>
    (await call('create-clients', { client_names: [name] })).body
      .client_details[0]

  const rotate = async (name) =>
    (await call('rotate-client-credentials', { client_names: [name] })).body
      .client_details

  beforeEach(async () => {
    server?.close()
    server = createFakeCdp(seed)
    await new Promise((resolve) => server.listen(0, resolve))
    baseUrl = `http://localhost:${server.address().port}`
  })

  after(() => server.close())

  describe('fetch-details', () => {
    test("lists the clients with their secrets' ids and dates, but not their values", async () => {
      const { status, body } = await call('fetch-details')
      const [client] = body.client_details

      assert.equal(status, 200)
      assert.equal(body.tenant_service_name, service)
      assert.equal(body.next_token, null)
      assert.equal(client.client_name, 'Seeded Client')
      assert.equal(client.client_id, 'seededclientid0000000000000')
      assert.equal(client.client_secret, null)
      assert.equal(client.client_secrets.length, 1)
      assert.match(
        client.client_secrets[0].id,
        /^seededclientid0000000000000--\d+$/
      )
      assert.ok(!Number.isNaN(Date.parse(client.client_secrets[0].created_at)))
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

      assert.deepEqual(names, ['Seeded Client', 'B', 'C', 'D', 'E'])
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
    test('creates a client with a secret, which is then listed', async () => {
      const created = await create('New_Client')

      assert.equal(created.client_name, 'New_Client')
      assert.match(created.client_id, /^[a-z0-9]{26}$/)
      assert.ok(created.client_secret)
      assert.deepEqual(await list(), ['Seeded Client', 'New_Client'])
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

    test('refuses Refused_By_Cdp', async () => {
      const { status } = await call('create-clients', {
        client_names: ['Refused_By_Cdp']
      })

      assert.equal(status, 403)
    })
  })

  describe('rotate-client-credentials', () => {
    test('returns a new secret for the client', async () => {
      const { client_secret: original } = await create('New_Client')

      const [rotated] = await rotate('New_Client')

      assert.equal(rotated.client_name, 'New_Client')
      assert.ok(rotated.client_secret)
      assert.notEqual(rotated.client_secret, original)
    })

    test('skips a client that does not exist', async () => {
      assert.deepEqual(await rotate('Nobody'), [])
    })
  })

  describe('purge-old-client-credentials', () => {
    test('rejects a malformed cutoff', async () => {
      const { status } = await call('purge-old-client-credentials', {
        client_names: ['Seeded Client'],
        creation_cutoff: 'yesterday'
      })

      assert.equal(status, 400)
    })

    test('lists the clients processed, without secrets', async () => {
      await rotate('Seeded Client')

      const { body } = await call('purge-old-client-credentials', {
        client_names: ['Seeded Client']
      })

      assert.deepEqual(body.client_details, [
        {
          client_name: 'Seeded Client',
          client_id: 'seededclientid0000000000000',
          client_secret: null
        }
      ])
    })
  })

  describe('delete-clients', () => {
    test('deletes the client and returns no clients', async () => {
      const { body } = await call('delete-clients', {
        client_names: ['Seeded Client']
      })

      assert.deepEqual(body.client_details, [])
      assert.deepEqual(await list(), [])
    })
  })

  describe('requests CDP rejects', () => {
    test('an unsigned request', async () => {
      const { status } = await call('fetch-details', undefined, {
        headers: { authorization: '' }
      })

      assert.equal(status, 403)
    })

    test('an unknown service', async () => {
      const response = await fetch(
        `${baseUrl}/tenants/services/unknown-service/user-pool/fetch-details`,
        { headers: { authorization: 'signed' } }
      )

      assert.equal(response.status, 400)
    })

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

  test('starts each time with only the seeded clients', async () => {
    await create('New_Client')
    server.close()
    server = createFakeCdp(seed)
    await new Promise((resolve) => server.listen(0, resolve))
    baseUrl = `http://localhost:${server.address().port}`

    assert.deepEqual(await list(), ['Seeded Client'])
  })
})

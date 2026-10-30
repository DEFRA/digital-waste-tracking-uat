import { execFileSync } from 'node:child_process'
import { createFakeCdp } from './server.js'

const flociImage = 'floci/floci:2.1.0-compat'
const flociContainer = `fake-cdp-dbg-${process.pid}`
const poolId = 'eu-west-2_LOCAL'
const scopeServer = 'waste-movement-external-api-resource-srv'
const seededId = 'seededclientid0000000000000'

execFileSync('docker', ['run', '-d', '--rm', '--name', flociContainer, '-p', '127.0.0.1::4566', '-e', 'FLOCI_DEFAULT_REGION=eu-west-2', flociImage])
const port = execFileSync('docker', ['port', flociContainer, '4566']).toString().trim().split(':').at(-1)
const flociUrl = `http://127.0.0.1:${port}`

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

for (let attempt = 0; ; attempt++) {
  try { await fetch(flociUrl); break } catch { if (attempt > 60) throw new Error('floci not ready'); await new Promise((r) => setTimeout(r, 500)) }
}

await cognito('CreateUserPool', {
  PoolName: 'dbg',
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

console.log('RAW Floci DescribeUserPoolClient:')
console.log(JSON.stringify(await cognito('DescribeUserPoolClient', { UserPoolId: poolId, ClientId: seededId }), null, 2))

const server = createFakeCdp({ flociUrl })
await new Promise((resolve) => server.listen(0, resolve))
const baseUrl = `http://localhost:${server.address().port}`

const res = await fetch(`${baseUrl}/tenants/services/waste-movement-external-api/user-pool/clients/${seededId}/fetch-details`, {
  method: 'GET',
  headers: { authorization: 'AWS4-HMAC-SHA256 signed' }
})
console.log('status:', res.status)
const parsed = await res.json()
console.log('keys:', Object.keys(parsed.client_details))

try { execFileSync('docker', ['stop', flociContainer], { stdio: 'ignore' }) } catch {}
server.close()

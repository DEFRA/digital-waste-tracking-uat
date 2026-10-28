#!/bin/sh
# Creates the local Cognito user pool that the external API trusts, and the
# clients the stack starts with: the seeded "Test Client"s from
# mongo_setup.sh and the fake CDP's other sample clients. The fake CDP
# (fake-cdp/server.js) manages clients in this pool, as CDP does in Cognito.
# Floci keeps the pool (and its signing key) on the floci-data volume, so the
# pool is only created on the first start, but the clients are checked every
# time.
set -e

POOL_ID=eu-west-2_LOCAL
SCOPE_SERVER=waste-movement-external-api-resource-srv

if aws cognito-idp describe-user-pool --user-pool-id "$POOL_ID" >/dev/null 2>&1; then
  echo "Cognito user pool $POOL_ID already exists"
else
  # floci:* tags pin the pool id, use each client's name as its id and give
  # every client the secret "local"
  aws cognito-idp create-user-pool \
    --pool-name waste-movement-local \
    --user-pool-tags "{\"floci:override-id\":\"$POOL_ID\",\"floci:override-cognito-client-id\":\"use-name\",\"floci:override-cognito-client-secret\":\"local\"}"

  aws cognito-idp create-resource-server \
    --user-pool-id "$POOL_ID" \
    --identifier "$SCOPE_SERVER" \
    --name "$SCOPE_SERVER" \
    --scopes ScopeName=access,ScopeDescription=access

  echo "Created Cognito user pool $POOL_ID"
fi

# What each client may do: get tokens for the external API
oauth_settings() {
  aws cognito-idp "$@" \
    --allowed-o-auth-flows client_credentials \
    --allowed-o-auth-scopes "$SCOPE_SERVER/access" \
    --allowed-o-auth-flows-user-pool-client >/dev/null
}

# Each client is created under its id (the pool uses a new client's name as
# its id) and then given its real name. The settings are sent with the
# rename too, as an update resets any it omits. A client that a local run
# rotated or purged keeps its secrets: `docker compose down -v` restores
# "local"
seed_client() {
  client_id=$1
  client_name=$2

  if ! aws cognito-idp describe-user-pool-client \
    --user-pool-id "$POOL_ID" --client-id "$client_id" >/dev/null 2>&1; then
    oauth_settings create-user-pool-client \
      --user-pool-id "$POOL_ID" \
      --client-name "$client_id" \
      --generate-secret
  fi

  oauth_settings update-user-pool-client \
    --user-pool-id "$POOL_ID" \
    --client-id "$client_id" \
    --client-name "$client_name"
}

seed_client 1a2b3c4d5e6f7g8h9i0j009988 'Acme Waste Software'
seed_client 9z8y7x6w5v4u3t2s1r0q5rt43e 'Beta Tracking Ltd'
seed_client 1234567890abcdef1234567890 'Test Client 1'
seed_client 0987654321fedcba0987654321 'Test Client 2'
seed_client abcdefghijklmnopqrstuvwxyz 'Test Client 3'

# Floci's health check waits for this
touch /tmp/cognito-seeded
echo "Seeded the Cognito user pool's clients"

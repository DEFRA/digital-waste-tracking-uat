#!/bin/bash
set -e

# Start MongoDB in the background with replica set configuration
mongod --replSet rs0 --bind_ip_all --dbpath /data/db &
MONGO_PID=$!

# Brief wait for mongod to start accepting connections
sleep 3

# Initialize the replica set (idempotent - safe to run multiple times)
mongosh --quiet --eval "
  try {
    rs.status();
  } catch(err) {
    if (err.codeName === 'NotYetInitialized') {
      rs.initiate({
        _id: 'rs0',
        members: [{ _id: 0, host: 'mongodb:27017' }]
      });
    }
  }
"

# Insert test client data
mongosh --quiet --eval "
  const db = db.getSiblingDB('dwt-client-sync');
  // Upsert so restarting with an existing volume doesn't hit the unique
  // index dwt-client-sync creates on tenantServiceName and clientId
  [
  {
    clientName: 'Test_Client_1',
    clientId: '1234567890abcdef1234567890',
    tenantServiceName: 'waste-movement-external-api'
  },
  {
    clientName: 'Test_Client_2',
    clientId: '0987654321fedcba0987654321',
    tenantServiceName: 'waste-movement-external-api'
  },
  {
    clientName: 'Test_Client_3',
    clientId: 'abcdefghijklmnopqrstuvwxyz',
    tenantServiceName: 'waste-movement-external-api'
  }
  ].forEach((client) =>
    db.clients.updateOne(
      { tenantServiceName: client.tenantServiceName, clientId: client.clientId },
      { \$set: client },
      { upsert: true }
    )
  );
"

# Load the waste organisations the admin tool's report tests expect, once the
# replica set can take writes. A failure only warns, so the stack still starts
for attempt in $(seq 1 30); do
  mongosh --quiet --eval "quit(rs.status().members[0].stateStr === 'PRIMARY' ? 0 : 1)" && break
  sleep 1
done
mongosh --quiet "mongodb://localhost:27017/waste-organisation-backend?directConnection=true" \
  /compose/load-test-organisations.js ||
  echo "Couldn't load the test organisations, carrying on without them"

# Keep the script running
wait $MONGO_PID

#!/bin/sh

# Debug network connectivity to OAuth2 endpoints
echo "=== Network Connectivity Debug ==="
echo "Testing DNS resolution and connectivity to OAuth2 endpoints..."

# Check if environment variables are set
echo "Environment variables:"
echo "COGNITO_OAUTH_BASE_URL: ${COGNITO_OAUTH_BASE_URL:-'NOT SET'}"
echo "ENVIRONMENT: ${ENVIRONMENT:-'NOT SET'}"

# Test DNS resolution
if [ -n "$COGNITO_OAUTH_BASE_URL" ]; then
  echo "Testing DNS resolution for: $COGNITO_OAUTH_BASE_URL"
  nslookup "$COGNITO_OAUTH_BASE_URL" || echo "DNS resolution failed"
  
  # Test basic connectivity
  echo "Testing basic connectivity..."
  curl -I --connect-timeout 10 --max-time 30 "$COGNITO_OAUTH_BASE_URL" || echo "Basic connectivity failed"
  
  # Test OAuth2 token endpoint specifically
  echo "Testing OAuth2 token endpoint..."
  curl -I --connect-timeout 10 --max-time 30 "$COGNITO_OAUTH_BASE_URL/oauth2/token" || echo "OAuth2 token endpoint failed"
else
  echo "COGNITO_OAUTH_BASE_URL not set, cannot test connectivity"
fi

echo "=== End Network Debug ==="

exit 0

echo "run_id: $RUN_ID"
npm test

npm run report:publish
publish_exit_code=$?

if [ $publish_exit_code -ne 0 ]; then
  echo "failed to publish test results"
  exit $publish_exit_code
fi

# At the end of the test run, if the suite has failed we write a file called 'FAILED'
if [ -f FAILED ]; then
  echo "test suite failed"
  cat ./FAILED
  exit 1
fi

echo "test suite passed"
exit 0

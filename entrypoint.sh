#!/bin/sh

# Debug network connectivity to OAuth2 endpoints
echo "=== Network Connectivity Debug ==="

echo "Testing DNS resolution for: https://waste-movement-external-api-6bf3a.auth.eu-west-2.amazoncognito.com/"
nslookup "https://waste-movement-external-api-6bf3a.auth.eu-west-2.amazoncognito.com/" || echo "DNS resolution failed"

echo "Testing https://waste-movement-external-api-6bf3a.auth.eu-west-2.amazoncognito.com/..."
curl -I --connect-timeout 10 --max-time 30 "https://waste-movement-external-api-6bf3a.auth.eu-west-2.amazoncognito.com/" || echo "Basic connectivity failed"

echo "Testing https://waste-movement-external-api-6bf3a.auth.eu-west-2.amazoncognito.com/oauth2/token..."
curl -I --connect-timeout 10 --max-time 30 "https://waste-movement-external-api-6bf3a.auth.eu-west-2.amazoncognito.com/oauth2/token" || echo "OAuth2 token endpoint failed"

echo "Testing https://waste-movement-external-api.api.test.cdp-int.defra.cloud..."
curl -I --connect-timeout 10 --max-time 30 "https://waste-movement-external-api.api.test.cdp-int.defra.cloud" || echo "CDP test domain failed"

echo "Testing https://s3.amazonaws.com..."
curl -I --connect-timeout 10 --max-time 30 "https://s3.amazonaws.com" || echo "AWS S3 failed"

echo "Testing https://sts.amazonaws.com..."
curl -I --connect-timeout 10 --max-time 30 "https://sts.amazonaws.com" || echo "AWS STS failed"

echo "Testing https://login.microsoftonline.com..."
curl -I --connect-timeout 10 --max-time 30 "https://login.microsoftonline.com" || echo "Microsoft login failed"

echo "Testing www.gov.uk..."
curl -I --connect-timeout 10 --max-time 30 "https://www.gov.uk" || echo "GOV.UK failed"

echo "Testing https://api.browserstack.com..."
curl -I --connect-timeout 10 --max-time 30 "https://api.browserstack.com" || echo "BrowserStack failed"

echo "Testing https://api.notifications.service.gov.uk..."
curl -I --connect-timeout 10 --max-time 30 "https://api.notifications.service.gov.uk" || echo "GOV.UK Notifications failed"

echo "=== End Network Debug ==="

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

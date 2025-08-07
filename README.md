digital-waste-tracking-uat

The template to create a service that runs Cucumber tests against an environment.

- [Local](#local)
  - [Requirements](#requirements)
    - [Node.js](#nodejs)
  - [Setup](#setup)
  - [Running local tests](#running-local-tests)
  - [Debugging local tests](#debugging-local-tests)
- [Production](#production)
  - [Debugging tests](#debugging-tests)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Local Development

### Requirements

#### Node.js

Please install [Node.js](http://nodejs.org/) `>= v22.13.1` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
nvm use
```

### Setup

Install application dependencies:

```bash
npm install
```

#### Environment Configuration

For OAuth authentication tests, you need to set up environment variables. Use the provided template:

```bash
# Copy the template and fill in your credentials
cp env.sh.template env.sh

# Edit env.sh with your actual credentials
# Then source it before running tests
source ./env.sh
```

**Note:** The `env.sh` file is gitignored to prevent committing sensitive credentials. Each developer should create their own copy from the template.

See `test/CONFIGURATION.md` for detailed setup instructions.

### Running local tests

Start application you are testing on the url specified in your test configuration.

```bash
npm test
```

**Note:** The default `npm test` command runs only regression tests (scenarios tagged with `@regression-tests`). To run all tests, use `cucumber-js` directly.

### Available NPM Scripts

```bash
# Run tests with reporting
npm test

# Code formatting and linting
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues

# Test reporting
npm run report:generate # Generate Allure report
npm run report:open     # Open Allure report in browser
npm run report:clean    # Clean test results
npm run report:publish  # Publish results to S3

# Development setup
npm run setup:husky     # Setup Git hooks
```

### Debugging local tests

```bash
# Debug specific Cucumber scenarios using tags
cucumber-js --tags "@debug"

# Debug a specific feature file
cucumber-js test/features/waste-movement.feature

# Debug the full test suite
cucumber-js

# Run only regression tests
cucumber-js --tags "@regression-tests"

# Run all tests except regression tests
cucumber-js --tags "not @regression-tests"
```

**Note:** When debugging, run `cucumber-js` directly instead of `npm test` to avoid the report generation step that runs after the tests.

### Test Reporting

The test suite uses Allure for generating detailed test reports. Available reporting commands:

```bash
# Generate and open test report (cleans previous results first)
npm run source:clean:test:open

# Generate test report only
npm run report:generate

# Open existing report
npm run report:open

# Clean test results
npm run report:clean

# Publish results to S3 (used in CI/CD)
npm run report:publish
```

## Production

### Running the tests

Tests are run from the CDP-Portal under the Test Suites section. Before any changes can be run, a new docker image must be built, this will happen automatically when a pull request is merged into the `main` branch.
You can check the progress of the build under the actions section of this repository. Builds typically take around 1-2 minutes.

The results of the test run are made available in the portal.

## Requirements of CDP Environment Tests

1. Your service builds as a docker container using the `.github/workflows/publish.yml`
   The workflow tags the docker images allowing the CDP Portal to identify how the container should be run on the platform.
   It also ensures its published to the correct docker repository.

2. The Dockerfile's entrypoint script should return exit code of 0 if the test suite passes or 1/>0 if it fails

3. Test reports should be published to S3 using the script in `./bin/publish-tests.sh`

## Running on GitHub

Alternatively you can run the test suite as a GitHub workflow.
Test runs on GitHub are not able to connect to the CDP Test environments. Instead, they run the tests against a version of the services running in docker.

### GitHub Workflows

The repository includes several GitHub workflows:

- **`.github/workflows/publish.yml`**: Automatically builds and publishes Docker images when changes are pushed to the `main` branch
- **`.github/workflows/journey-tests.yml`**: Runs the test suite against Docker containers (can be triggered manually or by other workflows)
- **`.github/workflows/check-pull-request.yml`**: Runs checks on pull requests

### Local Docker Testing

A docker compose `compose.yml` is included for local testing, which includes:

- **MongoDB**: Database for the application with initialization scripts
- **Redis**: Caching layer
- **LocalStack**: AWS service emulation (S3, SQS, SNS, DynamoDB) with bucket setup
- **Selenium Chrome**: Headless browser for UI testing

The compose file includes initialization scripts in `docker/scripts/` for setting up databases and AWS resources:

- `docker/scripts/mongodb/10-database-setup.js` - MongoDB database initialization
- `docker/scripts/localstack/10-setup-buckets.sh` - S3 bucket setup for LocalStack

To start the local environment:

```bash
docker compose up -d
```

Steps for local Docker testing:

1. Edit the `compose.yml` to include your services
2. Modify the scripts in `docker/scripts/` to pre-populate the database and create LocalStack resources
3. Test the setup locally with `docker compose up` and `npm test`
4. Set up the workflow trigger in `.github/workflows/journey-tests.yml`

By default, the provided workflow will run when triggered manually from GitHub or when triggered by another workflow.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

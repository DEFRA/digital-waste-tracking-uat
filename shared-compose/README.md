# Shared compose stack

The full stack the waste movement services' integration tests run against: the
external API, backend, tracking ID backend, organisation backend and client sync,
plus Mongo, Floci (Cognito), mockserver (the CDP API), LocalStack and ZAP.

It lives here so the service repos don't each keep a copy of it. A change to the
shared parts (another service's config, the Mongo seeding, the Floci user pool)
is made once, in this folder.

This is separate from this repo's own `compose.yml` and `docker/` folder, which
are for running the test suite itself.

## Using it from a service repo

A service repo's compose file includes this one, along with an override file
that changes its own service to build from the repo's code. Every other service
runs from its published image.

```yaml
# compose.yml
include:
  - path:
      - ${SHARED_COMPOSE:-https://github.com/DEFRA/digital-waste-tracking-uat.git#main:shared-compose/compose.yml}
      - compose.override-shared.yml
```

```yaml
# compose.override-shared.yml
services:
  dwt-client-sync:
    # A local name, so the build doesn't replace your pulled published image
    image: dwt-client-sync:local
    build:
      # Paths here resolve against the shared file's folder, so build from
      # where compose is run: the repo's root
      context: ${PWD}
      target: production
```

The override has to be in the `include` list, not under `services:` in the
including file: Compose before v5 (including GitHub's runners) rejects
redefining an included service.

Anything else under the service's name (such as a new environment variable) is
merged over the shared definition, so config for the repo's own service can
change in the same PR as its code. If other repos need it too, add it to
`compose.yml` here as well.

Its PR workflow then calls the shared integration test job:

```yaml
integration-tests:
  name: Run Integration Tests
  uses: DEFRA/digital-waste-tracking-uat/.github/workflows/integration-tests.yml@main
  with:
    compose-file: compose.yml
    test-script: test:uat:client-sync # optional, defaults to the full suite
```

## Running it locally

`docker compose up` in the service repo works as usual. Compose fetches this file
from GitHub on each run, so it needs network access.

- To tweak the stack just for yourself, add a `compose.override.yml` to the
  service repo. Compose loads it automatically and it can override any service.
- To change this file, point `SHARED_COMPOSE` at your local checkout and edit it
  there:

  ```sh
  SHARED_COMPOSE=../digital-waste-tracking-uat/shared-compose/compose.yml docker compose up
  ```

## Credentials

Every credential in `compose.yml` is a made-up value for this throwaway stack,
so none of them are secrets. Each password must match the `ACCESS_CRED_*` that
accepts it (base64 of `<service>=<password>`), and the values
`.github/workflows/integration-tests.yml` passes to the tests.

## Trying out a change

PRs that change this folder or the shared workflow run the full suite against
it (`.github/workflows/check-shared-compose.yml`). To try a change from a
service repo before it's merged, point the include at your branch
(`#<branch>:shared-compose/compose.yml`) and call the workflow with
`@<branch>` and `uat-ref: <branch>`.

---
name: adding-rest-apis
description: >-
  Adds a Cognite REST API (resource) to the cognite-sdk-js SDK: hand-written
  types from the OpenAPI document, a BaseResourceAPI class, client wiring,
  nock unit tests, and a PR that follows the repo conventions. Use when the
  user asks to add, implement, or expose a CDF API, endpoint, or resource
  (for example "add the transformations API" or "support /workflows in
  alpha") in packages/stable, packages/beta, or packages/alpha.
---

# Adding REST APIs to the SDK

The reference implementation is
[PR #1548](https://github.com/cognitedata/cognite-sdk-js/pull/1548), which
added `client.transformations`. When a template below is not enough, read
its files on `master`:

- `packages/stable/src/api/transformations/types.ts`
- `packages/stable/src/api/transformations/transformationsApi.ts`
- `packages/stable/src/__tests__/api/transformations.unit.spec.ts`

For code templates, see [reference.md](reference.md).

## Workflow

Copy this checklist and track progress:

```
- [ ] 1. Pick the package and read the spec
- [ ] 2. Agree the scope with the user
- [ ] 3. Write types.ts
- [ ] 4. Write the API class
- [ ] 5. Wire it into the client and exports
- [ ] 6. Write unit tests
- [ ] 7. Validate
- [ ] 8. Commit and open the PR
```

### 1. Pick the package and read the spec

| Endpoint status | Package | Spec version | `cdf-version` header |
|---|---|---|---|
| Stable (GA) | `packages/stable` (`@cognite/sdk`) | `20230101` | none |
| Beta | `packages/beta` | `20230101-beta` | `beta` |
| Alpha | `packages/alpha` | `20230101-alpha` | `20230101-alpha` |

Beta and alpha extend the stable client, so a stable API appears in all
three. Only put an API in beta or alpha if it is not GA.

Print the endpoints and schemas of the API's tag (the tag is in the
api-docs URL, for example `.../20230101/tag/Transformations`):

```bash
uv run .cursor/skills/adding-rest-apis/scripts/openapi_tag.py Transformations
uv run .cursor/skills/adding-rest-apis/scripts/openapi_tag.py Transformations --descriptions
uv run .cursor/skills/adding-rest-apis/scripts/openapi_tag.py --list-tags --version 20230101-alpha
```

The output marks optional fields with `?`, and flags `DEPRECATED`,
`readOnly`, defaults and limits. The spec is cached for a day in the temp
directory; pass `--refresh` to download it again.

### 2. Agree the scope with the user

List the endpoints and the proposed method names, and say which related
tags you leave out. PR #1548 covered the `Transformations` tag only, and
left schedules, notifications, jobs and query for later PRs. Ask before
dropping fields that the spec lists but the API docs call deprecated.

### 3. Write `types.ts`

Create `packages/<pkg>/src/api/<resource>/types.ts`. These rules come from
the review of PR #1548:

- **The spec decides required versus optional.** Copy `required` exactly,
  even when it looks odd. In PR #1548 a review bot claimed `query`,
  `destination` and `conflictMode` must be required on create; the spec says
  otherwise and the author rejected the comment. Check the script output
  before acting on such comments.
- **Prefix every name with the resource** (`Transformation`,
  `TransformationCreate`, `TransformationJob`), because
  `packages/<pkg>/src/types.ts` re-exports all modules flat. Before adding a
  name, check it is free:
  `rg "export (interface|type) <Name>\b" packages/<pkg>/src`.
- **Rename the spec's schema names to SDK names.** For example,
  `TransformationRead` becomes `Transformation`, `JobRead` becomes
  `TransformationJob`, and `AssetCentricDataSource` becomes
  `TransformationAssetCentricDestination`. Use these suffixes:

  | Purpose | Name |
  |---|---|
  | Read model | `<Resource>` |
  | Create body item | `<Resource>Create` |
  | Update patch | `<Resource>Patch` |
  | Update item | `<Resource>Change = IdEither & { update: <Resource>Patch }` |
  | `GET` list query | `<Resource>ListQuery extends FilterQuery` |
  | `POST /filter` body | `<Resource>FilterQuery extends FilterQuery { filter: <Resource>Filter }` |
  | Extra `byids` flags | `<Resource>RetrieveParams extends IgnoreUnknownIds` |

- **Reuse the shared types** instead of writing `number` or `string`:
  - From `@cognite/sdk-core`: `IdEither`, `CogniteInternalId`,
    `CogniteExternalId`, `FilterQuery`, `CursorResponse`.
  - From `../../types`: `SetField`, `SinglePatchRequiredString`,
    `NullableSinglePatchLong`, `ArrayPatchString`, `Range`,
    `IgnoreUnknownIds`.
  - `EpochTimestamp` from `../../types.gen`.
- **Name IDs that belong to another API in that API's module.** PR #1548
  added `export type SessionId = number;` to `api/sessions/types.ts` and
  used it for `sessionId`.
- **Timestamps are `EpochTimestamp` numbers, not `Date`.** Do not override
  `getDateProps`; only older APIs convert to `Date`.
- **Leave out deprecated fields.** The spec does not always mark them. For
  example, `sourceOidcCredentials` has no `deprecated` flag, but sessions
  (`sourceNonce`) replaced it, so PR #1548 dropped it.
- Model discriminated unions with a literal `type` field (see
  `TransformationDestination`), and export `XType = X['type']` when filters
  take the discriminator.
- Add JSDoc only where the name doesn't say enough: units, allowed values,
  `@default`, and behaviour such as "Between 1 and 5 tags".
- Start the file with `// Copyright <current year> Cognite AS`.

### 4. Write the API class

Create `packages/<pkg>/src/api/<resource>/<resource>Api.ts` with a class
`<Resource>sAPI extends BaseResourceAPI<<Resource>>`. Map endpoints to the
`BaseResourceAPI` helpers:

| Endpoint | Method | Implementation |
|---|---|---|
| `POST /x` | `create(items)` | `this.createEndpoint(items)` |
| `GET /x` | `list(query?)` | `this.listEndpoint(this.callListEndpointWithGet, query)` |
| `GET /x` with `?a=1&a=2` arrays | `list(query?)` | `this.listEndpoint(this.callListGetEndpointWithRepeatedQueryParams, query)` |
| `POST /x/list` | `list(query?)` | `this.listEndpoint(this.callListEndpointWithPost, query)` |
| `POST /x/search` | `search(query)` | `this.searchEndpoint(query)` |
| `POST /x/filter` | `filter(query)` | `this.listEndpoint((data) => this.post<CursorResponse<X[]>>(this.url('filter'), { data }), query)` |
| `POST /x/byids` | `retrieve(ids, params?)` | `this.retrieveEndpoint(ids, params)` |
| `POST /x/update` | `update(changes)` | `this.updateEndpoint(changes)` |
| `POST /x/delete` | `delete(ids, params?)` | `this.deleteEndpoint(ids, params)` |
| `POST /x/upsert` | `upsert(items)` | `this.upsertEndpoint(items)` |
| `POST /x/aggregate` | `aggregate(query)` | `this.aggregateEndpoint(query)` |
| `POST /x/<action>` with one item | `<action>(request)` | `this.post(this.url('<action>'), { data })`, then `this.addToMapAndReturn(response.data, response)` |

- Declare methods as arrow-function properties
  (`public create = (...) => ...`), like the existing APIs.
- Give every public method a JSDoc block. Start it with
  `[Title](https://api-docs.cognite.com/20230101/tag/<Tag>/operation/<operationId>)`,
  where the title is the spec summary and the `operationId` comes from the
  script output, then add a short `js` example that calls
  `client.<resource>`.
- When the spec requires a flag the SDK wants to default, use `??` so an
  explicit `undefined` still sends it. For example, `retrieve` sends
  `withJobDetails: params.withJobDetails ?? true`. Spreading defaults first
  does not work, because a later `undefined` overwrites them.
- If an endpoint accepts exactly one item, the method takes one item
  (`run(request)`, `cancel(id)`), not an array.
- The helpers split requests into batches of 1000 items, the API's usual
  maximum.
- For sub-resources (`/dataproducts/{externalId}/versions`), create the
  child API in the parent's constructor and expose it with a getter. Pass
  the sub-path as the helpers' optional `path` argument. See
  `api/dataProducts/dataProductsApi.ts` and `dataProductVersionsApi.ts`.

### 5. Wire it into the client and exports

Make these four edits; [reference.md](reference.md) shows each one:

1. In `cogniteClient.ts`, add the import, a public getter that returns
   `accessApi(this.xApi)`, a private optional field, and
   `this.xApi = this.apiFactory(XAPI, '<resource path>')` in `initAPIs()`.
   Keep the order of the existing entries.
2. In `index.ts`, add `export { XAPI } from './api/<resource>/<resource>Api';`
   in alphabetical order.
3. In `types.ts`, add `export * from './api/<resource>/types';` next to the
   other module re-exports.
4. If you added a shared ID type to another module, check that module is
   already re-exported.

### 6. Write unit tests

Create `packages/<pkg>/src/__tests__/api/<resource>.unit.spec.ts` with one
test per method. Each test mocks the exact path and body with `nock`, and
asserts the parsed result. Also test SDK defaults: the default value, an
explicit `undefined`, and an override. Build fixtures with
`satisfies <Type>` or `: <Type>`, so the compiler checks them against the
types. Integration tests (`*.int.spec.ts`) need CDF credentials. Only add
them if the user asks.

### 7. Validate

From `packages/<pkg>`. The mocked client reads `COGNITE_PROJECT`, so unit
tests fail with "options.project is required" unless it is set. Any value
works:

```bash
export COGNITE_PROJECT=unit-test   # PowerShell: $env:COGNITE_PROJECT = 'unit-test'
yarn test src/__tests__/api/<resource>.unit.spec.ts
yarn test                        # all tests; integration tests need COGNITE_* env vars
yarn g:tsc -p ./tsconfig.json --noEmit
yarn test-snippets               # checks JSDoc examples compile
```

From the repo root, run `yarn lint` (`biome ci`). If it fails, run
`yarn lint:fix` and check the diff. Beta and alpha tests use stable's
`dist`, so run `yarn workspace @cognite/sdk build` after changing stable.

On Windows, package scripts call `rm -rf` and `cp -r`. Put Git for Windows'
`usr\bin` on `PATH` first (PowerShell):

```powershell
$env:PATH = "$(Split-Path (Split-Path (Get-Command git).Source))\usr\bin;$env:PATH"
```

### 8. Commit and open the PR

- Branch from `master` as `feat/<topic>`. A Jira-prefixed name like
  `feat/HELIOS-28-transformations` is fine.
- Use conventional commits with the resource as scope:
  `feat(transformations): add transformations API`. A commit-msg hook runs
  commitlint, which rejects body lines over 100 characters. Put a Jira key
  only in a `Refs: HELIOS-28` footer.
- Do not use `<type>!:`; this repo doesn't support it. For a breaking
  change, add a `BREAKING CHANGE: ...` footer.
- The PR title is a conventional commit with no Jira key; CI rejects
  `[A-Z]{2,}-[0-9]+`. Use the PR body template in
  [reference.md](reference.md).

## Additional resources

- [reference.md](reference.md): templates for the types, API class, client
  wiring, unit test and PR body.
- `scripts/openapi_tag.py`: prints a tag's endpoints and schemas from the
  OpenAPI document. Run it with `uv run`; it needs only the standard library.

# Cognite Javascript SDK

The package `@cognite/sdk` provides convenient access to the stable [Cognite API](https://doc.cognitedata.com/dev/)
from applications written in client- or server-side javascript.

The SDK supports authentication through bearer tokens.
See [Authentication Guide](https://github.com/cognitedata/cognite-sdk-js/blob/v1/guides/authentication.md).

## Installation

Install the package with yarn:

```
$ yarn add @cognite/sdk
```

or npm

```
$ npm install @cognite/sdk --save
```

## Usage

```js
const { CogniteClient } = require('@cognite/sdk');
```

### Using ES modules

```js
import { CogniteClient } from '@cognite/sdk';
```

### Using typescript

The SDK is written in native typescript, so no extra types need to be defined.

## Quickstart

### Web

```js
import { CogniteClient } from '@cognite/sdk';

async function quickstart() {
  const project = 'publicdata';
  const oidcTokenProvider = async () => {
    return 'YOUR_OIDC_ACCESS_TOKEN';
  };

  const client = new CogniteClient({
    appId: 'YOUR APPLICATION NAME',
    project,
    oidcTokenProvider,
  });

  const assets = await client.assets.list().autoPagingToArray({ limit: 100 });
}
quickstart();
```

> For more details about SDK authentication see this [document](https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/authentication.md).
> Also, more comprehensive intro guide can be found [here](https://docs.cognite.com/dev/guides/sdk/js/)

### Backend

```js
const { CogniteClient } = require('@cognite/sdk');

async function quickstart() {
  const client = new CogniteClient({
    appId: 'YOUR APPLICATION NAME',
    oidcTokenProvider: () => Promise.resolve('YOUR_OIDC_ACCESS_TOKEN'),
  });

  const assets = await client.assets.list().autoPagingToArray({ limit: 100 });
}
quickstart();
```

## Documentation

- [API reference documentation](https://doc.cognitedata.com/api/v1)
- [JS SDK reference documentation](https://cognitedata.github.io/cognite-sdk-js/classes/cogniteclient.html)

## Concurrency

Concurrency limits control how many HTTP requests the SDK can have in flight at
the same time, not how many requests it sends per second. Limits are applied per
client and operation category. Requests that reach a category's limit wait in a
queue; other categories and separate clients have independent limits.

The SDK uses semaphores to manage these queues. Each HTTP attempt acquires a slot
and holds it until the response body has been read or the attempt fails. Slots
are released during retry backoff, allowing queued requests to proceed. A retry
must acquire a slot again; backoff pauses only that request, not the category.

Queued attempts are admitted in FIFO (first-in, first-out) order, but calls are
**not guaranteed to complete in invocation order**. Continue to await dependent
mutations explicitly.

The SDK imposes **no request timeout**. A request that never settles, including a
stalled response body, retains its slot indefinitely. Timing out an outer promise,
for example with `Promise.race`, does not cancel the underlying request or release
its slot.

Currently, the SDK applies concurrency limits only to Data Modeling requests.
Other API requests are not limited by this mechanism.

> **Note:** CDF is a shared backend service. Excessive concurrency can degrade
> performance for other workloads in your organization. Start with the default
> limits and increase them cautiously, monitoring latency and throttling responses
> (HTTP 429). Higher concurrency does not necessarily mean higher throughput.

### Data Modeling concurrency

Data Modeling requests are concurrency-limited by default. Each client has
independent budgets shared across all endpoints in the Data Modeling `/models`
namespace and Data Modeling GraphQL routes, including raw client HTTP calls:

| Category | Default | Operations |
| --- | --- | --- |
| `read` | 1 | Instance list, retrieve, query, sync, inspect, and DM user GraphQL queries and mutations |
| `search` | 2 | Instance search and aggregate |
| `write` | 1 | Instance upsert/apply |
| `delete` | 1 | Instance deletes |
| `readSchema` | 2 | Reads of spaces, containers, views, and data models; statistics |
| `writeSchema` | 1 | Schema upserts and deletes, container index/constraint/property retries, and GraphQL DML writes |

Data Modeling GraphQL queries and mutations under
`/userapis/spaces/{space}/datamodels/{model}/versions/{version}/graphql` all use
`read`. Classification is based on the endpoint, not the GraphQL request body, so
these mutations do not acquire the REST `write` or `delete` budgets. Increasing
`read` also increases the allowed concurrency for these mutations.
GraphQL DML writes to `/dml/graphql` use `writeSchema`.

Unknown operations within known schema namespaces use `readSchema`; other unknown
operations within the Data Modeling `/models` namespace use `read`.
Project routes remain limited behind proxy path prefixes, for example
`https://proxy.example/cdf/api/v1/projects/my-project/models/instances/query`.
Categories have independent budgets, so requests in different categories can run
at the same time. If every category is saturated, the defaults allow at most 8
requests in flight per client (1 + 2 + 1 + 1 + 2 + 1).

To set specific limits:

```js
const client = new CogniteClient({
  appId: 'YOUR APPLICATION NAME',
  project: 'YOUR PROJECT',
  oidcTokenProvider: async () => 'YOUR_OIDC_ACCESS_TOKEN',
  concurrency: {
    dataModeling: { read: 2, write: 2 },
  },
});
```

Omitted or `undefined` category values retain their defaults. Limits must be
positive integers or `Infinity`; invalid values throw during client construction.
`Infinity` disables a category's limit (i.e. no concurrency control).

With the default `read: 1`, a stalled instance read blocks other non-schema Data
Modeling reads on the same client. Schema reads and other categories remain
independent.

## Best practices

### No submodule imports

We highly recommend avoiding importing anything from internal SDK modules.

All interfaces and functions should only be imported from the top level, otherwise you might face compatibility issues when our internal structure changes.

**Bad:**

```
import { CogniteAsyncIterator } from '@cognite/sdk/dist/src/autoPagination'; // ❌
import { AssetsAPI } from '@cognite/sdk/dist/src/resources/assets/assetsApi'; // ❌

let assetsApi: AssetsAPI; // ❌
```

**Good:**

```
import { CogniteAsyncIterator } from '@cognite/sdk'; // ✅

let assetsApi: CogniteClient['assets']; // ✅
```

We recommend the usage of [eslint](https://eslint.org/docs/rules/no-restricted-imports) to ensure this best practice is enforced without having to memorize the patterns:

**.eslintrc.json:**

```
"rules": {
  "no-restricted-imports": ["error", { "patterns": ["@cognite/sdk/**"] }]
}
```

The API reference documentation contains snippets for each endpoint,
giving examples of SDK use. See also the [samples section](https://github.com/cognitedata/cognite-sdk-js#samples) in this repo.

## Guides

- [Migration guide](https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/MIGRATION_GUIDE_1xx_2xx.md)
  on how to migrate from version `1.x.x` to version `2.x.x`.
- [Migration guide](https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/MIGRATION_GUIDE_2xx_3xx.md) from version `2.x.x` to version `3.x.x`.

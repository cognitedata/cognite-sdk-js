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

## Data Modeling concurrency

Data Modeling requests are concurrency-limited by default. Each client has
independent budgets shared across all endpoints in the Data Modeling `/models`
namespace and Data Modeling GraphQL routes, including raw client HTTP calls:

| Category | Default | Operations |
| --- | --- | --- |
| `read` | 1 | Instance list, retrieve, query, sync, inspect, and GraphQL instance queries |
| `search` | 2 | Instance search and aggregate |
| `write` | 1 | Instance upsert/apply |
| `delete` | 1 | Instance deletes |
| `readSchema` | 2 | Reads of spaces, containers, views, and data models; statistics |
| `writeSchema` | 1 | Schema upserts and deletes, container index/constraint/property retries, and GraphQL DML writes |

`readSchema` and `writeSchema` correspond to the Python SDK's `read_schema` and
`write_schema`. Schema deletes use `writeSchema`, not the instance `delete` budget.
Data Modeling GraphQL instance queries under
`/userapis/spaces/{space}/datamodels/{model}/versions/{version}/graphql` use `read`;
`/dml/graphql` writes use `writeSchema`.

Unknown operations within known schema namespaces use `readSchema`; other unknown
operations within the Data Modeling `/models` namespace use `read`.
Other APIs, including 3D models and simulator models, are unaffected.
Project routes remain limited behind proxy path prefixes, for example
`https://proxy.example/cdf/api/v1/projects/my-project/models/instances/query`.
The category budgets are separate: up to eight HTTP attempts can be in flight
across categories with the defaults. Separate clients do not share budgets.

To raise specific limits:

```js
const client = new CogniteClient({
  appId: 'YOUR APPLICATION NAME',
  project: 'YOUR PROJECT',
  oidcTokenProvider: async () => 'YOUR_OIDC_ACCESS_TOKEN',
  dataModelingConcurrency: {
    read: 4,
    search: 4,
    write: 2,
    readSchema: 4,
    writeSchema: 2,
  },
});
```

Omitted or `undefined` category values retain their defaults. Limits must be
positive integers or `Infinity`; invalid values throw during client construction.
Set a category to `Infinity` to disable its limit. To restore unlimited
concurrency for all Data Modeling operations, set all six:

```js
const dataModelingConcurrency = {
  read: Infinity,
  search: Infinity,
  write: Infinity,
  delete: Infinity,
  readSchema: Infinity,
  writeSchema: Infinity,
};
```

Slots cover individual HTTP attempts through response-body consumption, but are
released during retry backoff. Queued attempts are admitted in FIFO order;
logical calls, including concurrent writes and deletes, are **not guaranteed to
complete in invocation order**. Continue to await dependent mutations explicitly.

The SDK imposes **no request timeout**. A request that never settles, including a
stalled response body, retains its slot indefinitely. With the default `read: 1`,
this blocks other non-schema Data Modeling reads on the same client. Schema reads,
other categories, and separate clients remain independent. Timing out an outer promise, for example
with `Promise.race`, does not cancel the underlying request or release its slot.

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

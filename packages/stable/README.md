# Cognite Javascript SDK

The package `@cognite/sdk` provides convenient access to the stable [Cognite API](https://doc.cognitedata.com/dev/)
from applications written in client- or server-side javascript.

The SDK supports authentication through api-keys (_for server-side applications_) and bearer tokens (for web applications).
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
import { CogniteClient, CogniteAuthentication } from '@cognite/sdk';

async function quickstart() {
  const project = 'publicdata';
  const legacyInstance = new CogniteAuthentication({
    project,
  });

  const getToken = async () => {
    await legacyInstance.handleLoginRedirect();
    let token = await legacyInstance.getCDFToken();
    if (token) {
      return token.accessToken;
    }
    token = await legacyInstance.login({ onAuthenticate: 'REDIRECT' });
    if (token) {
      return token.accessToken;
    }
    throw new Error('error');
  };

  const client = new CogniteClient({
    appId: 'YOUR APPLICATION NAME',
    project,
    getToken,
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
    apiKeyMode: true,
    getToken: () => Promise.resolve('YOUR_SECRET_API_KEY'),
  });

  const assets = await client.assets.list().autoPagingToArray({ limit: 100 });
}
quickstart();
```

## Documentation

- [API reference documentation](https://doc.cognitedata.com/api/v1)
- [JS SDK reference documentation](https://cognitedata.github.io/cognite-sdk-js/classes/cogniteclient.html)

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

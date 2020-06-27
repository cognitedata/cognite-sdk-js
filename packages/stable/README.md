Cognite Javascript SDK
======================
The package `@cognite/sdk` provides convenient access to the stable [Cognite API](https://doc.cognitedata.com/dev/)
from applications written in client- or server-side javascript.

The SDK supports authentication through api-keys (_for server-side applications_) and bearer tokens (for web applications).

## Installation

<p align="right">
  <a href="https://youtu.be/29Cuv6OhBmA">
    Video quickstart<br />
    <img src="https://img.youtube.com/vi/29Cuv6OhBmA/3.jpg" alt="Cognite JS SDK video guide" title="Watch our video guide" align="right" />
  </a>
</p>

Install the package with yarn:
```
$ yarn add @haved/cogsdk
```
or npm
```
$ npm install @haved/cogsdk --save
```
## Usage

```js
const { CogniteClient } = require('@haved/cogsdk');
```

### Using ES modules

```js
import { CogniteClient } from '@haved/cogsdk';
```

### Using typescript

The SDK is written in native typescript, so no extra types need to be defined.

## Quickstart

### Web
```js
import { CogniteClient } from '@haved/cogsdk';

async function quickstart() {
  const client = new CogniteClient({ appId: 'YOUR APPLICATION NAME' });
  client.loginWithOAuth({
    project: 'publicdata',
  });

  const assets = await client.assets
    .list()
    .autoPagingToArray({ limit: 100 });
}
quickstart();
```

> For more details about SDK authentication see this [document](https://github.com/haved/cognite-sdk-js/blob/v1/guides/authentication.md).
> Also, more comprehensive intro guide with a demo app can be found [here](https://github.com/cognitedata/javascript-getting-started/tree/master/sdk-auth-and-fetch-data)

### Backend
```js
const { CogniteClient } = require('@haved/cogsdk');

async function quickstart() {
  const client = new CogniteClient({ appId: 'YOUR APPLICATION NAME' });
  client.loginWithApiKey({
    project: 'publicdata',
    apiKey: 'YOUR_SECRET_API_KEY',
  });

  const assets = await client.assets
    .list()
    .autoPagingToArray({ limit: 100 });
}
quickstart();
```

## Documentation

 - [API documentation](https://doc.cognitedata.com)
 - [API reference documentation](https://doc.cognitedata.com/api/v1)
 - [CogniteClient typedoc](https://haved.github.io/cognite-sdk-js/classes/cogniteclient.html)

The API reference documentation contains snippets for each endpoint,
giving examples of SDK use. See also the [samples section](https://github.com/haved/cognite-sdk-js#samples) in this repo.

## Guides

 - [Migration guide](https://github.com/cognitedata/cognite-sdk-js/blob/v1/guides/MIGRATION_GUIDE_1xx_2xx.md)
on how to migrate from version `1.x.x` to version `2.x.x`.

<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

Cognite Javascript SDK
==========================
[![Build Status](https://travis-ci.org/cognitedata/cognite-sdk-js.svg?branch=master)](https://travis-ci.org/cognitedata/cognite-sdk-js)
[![codecov](https://codecov.io/gh/cognitedata/cognite-sdk-js/branch/master/graph/badge.svg)](https://codecov.io/gh/cognitedata/cognite-sdk-js)

The Cognite js library provides convenient access to the [Cognite API](https://doc.cognitedata.com/dev/) from
applications written in client- or server-side JavaScript.

The SDK supports authentication through api-keys (_for server-side applications_) and bearer tokens (for web applications).

## Installation

<p align="right">
  <a href="https://youtu.be/29Cuv6OhBmA">
    Video quickstart<br />
    <img src="https://img.youtube.com/vi/29Cuv6OhBmA/3.jpg" alt="Cognite JS SDK video guide" title="Watch our video guide" align="right" />
  </a>
</p>

Install the package with yarn:

    $ yarn add @cognite/sdk

or npm

    $ npm install @cognite/sdk --save

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

> For more details about SDK authentication see this [document](./guides/authentication.md).  
> Also, more comprehensive intro guide with a demo app can be found [here](https://github.com/cognitedata/javascript-getting-started/tree/master/sdk-auth-and-fetch-data) 

### Backend
```js
const { CogniteClient } = require('@cognite/sdk');

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

## Samples

Samples are in the [samples/](./samples) directory. The samples' [README.md](./samples/README.md) has instructions for running the samples.

## Documentation

- [SDK documentation](https://cognitedata.github.io/cognite-sdk-js)
- [API documentation](https://doc.cognitedata.com)
- [API reference documentation](https://doc.cognitedata.com/api/v1)

## Migration

See [this guide](./guides/MIGRATION_GUIDE_1xx_2xx.md) on how to migrate from version `1.x.x` to version `2.x.x`.

## License

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Development

The sdk is implemented as a package in a monorepo, together with core logic, beta versions and samples.
See [this](./guides/monorepo.md) file for details.

### Testing

There is one integration test that requires a api key. In order to run this, you need an api key for the `cognitesdk-js` tenant. Talk to any of the contributors or leave an issue and it'll get sorted. Travis will run the test and has its own api key.
Set the environment variable `COGNITE_PROJECT` to `cognitesdk-js` and `COGNITE_CREDENTIALS` to your api-key.

Run all tests:

```bash
$ yarn
$ yarn build
$ yarn test
```

Set the environment variable `REVISION_3D_INTEGRATION_TEST=true` to run 3D revision integration tests.

We use `jest` to run tests, see [their documentation](https://github.com/facebook/jest) for more information.

### Versioning

The library follow [Semantic Versioning](https://semver.org/).
Package versions are updated automatically based on commit messages.

### Contributing

Contributions welcome! See the [code of conduct](./CODE_OF_CONDUCT.md).

### Release

Our releases are fully [automated](https://github.com/semantic-release/semantic-release).
Only basic steps are needed:

1. Create a new branch
2. Commit changes (if any) and remember about [proper commit messages](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)
6. Create a new pull request
7. A new version will be published when the PR is merged

### CHANGELOG

Each package in the monorepo has its own changelog.
- [@cognite/sdk](./packages/stable/CHANGELOG.md)
- [@cognite/sdk-beta](./packages/beta/CHANGELOG.md)
- [@cognite/sdk-core](./packages/core/CHANGELOG.md)
You can find the changelog from before the monorepo [here](./CHANGELOG.md).

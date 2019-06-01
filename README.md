<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

Cognite Javascript SDK
==========================
[![Build Status](https://travis-ci.org/cognitedata/cognitesdk-js.svg?branch=master)](https://travis-ci.org/cognitedata/cognitesdk-js)
[![codecov](https://codecov.io/gh/cognitedata/cognitesdk-js/branch/master/graph/badge.svg)](https://codecov.io/gh/cognitedata/cognitesdk-js)

The Cognite js library provides convenient access to the Cognite API from
applications written in client- or server-side JavaScript.

The SDK supports authentication through api-keys (_for server-side applications_) and bearer tokens (for web applications).

## Installation

Install the package with yarn:

    $ yarn add @cognite/sdk

or npm

    $ npm install @cognite/sdk --save

## Usage

```js
const sdk = require('@cognite/sdk');
```

### Using ES modules

```js
import * as sdk from '@cognite/sdk';
```

### Using typescript

The SDK is written in native typescript, so no extra types needs to be defined.

## Quickstart

### Web
```js
import * as sdk from '@cognite/sdk';

async function quickstart() {
  const client = sdk.createClientWithOAuth({
    project: 'publicdata',
  });

  const assets = await client.assets
    .list()
    .autoPagingToArray({ limit: 100 });
}
quickstart();
```

> For more details see this [document](./guides/authentication.md).

### Backend
```js
const sdk = require('@cognite/sdk');

async function quickstart() {
  const client = sdk.createClientWithApiKey({
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

- [SDK documentation](https://cognitedata.github.io/cognitesdk-js)
- [API documentation](https://doc.cognitedata.com)
- [API reference documentation](https://doc.cognitedata.com/api/v1)

## License

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Development

There is one integration test that requires a api key. In order to run this, you need an api key for the `cognitesdk-js` tenant. Talk to any of the contributors or leave an issue and it'll get sorted. Jenkins will run the test and has its own api key.
Set the environment variable `COGNITE_CREDENTIALS` to your api-key.

Run all tests:

```bash
$ yarn
$ yarn test
```

Set the environment variable `REVISION_3D_INTEGRATION_TEST=true` to run 3D revision integration tests.

We use `jest` to run tests, see [their documentation](https://github.com/facebook/jest) for more information.

## Versioning

The library follow [Semantic Versioning](https://semver.org/).

## Contributing

Contributions welcome! See the [code of conduct](./CODE_OF_CONDUCT.md).

## Release

How to release a new version:

1. Create a new branch
2. Commit changes (if any)
3. Run
    ```bash
    $ npm version [patch/minor/major]
    # example: $ npm version patch
    ```
4. Update the SDK-version in ./samples/package.json
5. Push branch and push tags (`git push --tags`)
6. Create a new pull requests
7. A new version will be published when the PR is merged

<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

# Cognite Javascript SDK

[![CD status](https://github.com/cognitedata/cognite-sdk-js/actions/workflows/release.yaml/badge.svg)](https://github.com/cognitedata/cognite-sdk-js/actions/workflows/release.yaml)
[![codecov](https://codecov.io/gh/cognitedata/cognite-sdk-js/branch/master/graph/badge.svg)](https://codecov.io/gh/cognitedata/cognite-sdk-js)

The Cognite js library provides convenient access to the [Cognite API](https://doc.cognitedata.com/dev/) from
applications written in client- or server-side JavaScript.

## Getting Started

This repository contains several packages for different API versions.

To get started with the stable API, see the README [here](./packages/stable/README.md).

There is also a [beta API](./packages/beta/README.md).

## Samples

There are small bare-bones javascript (and typescript) projects in the `samples/` directory.
They show how to include the cognite SDK in various project setups.
The samples' [README.md](./samples/README.md) has instructions for running the samples.

## Authentication

We offer two ways to sign in to our SDK. The first and recommended approach is using [@cognite/auth-wrapper](./guides/auth-wrapper.md)
and the second is using [Microsoft MSAL Library](./guides/auth-wrapper.md)

## Response header & http status

Methods are design to only return the response body. For fetching the http response status and/or header you must utilize client.getMetadata:

```ts
const createdAsset = await client.assets.create([{ name: 'My first asset' }]);
const metadata = client.getMetadata(createdAsset);

console.log(metadata.header['Access-Control-Allow-Origin']);
console.log(metadata.status);
```

## License

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Development

The SDK is implemented as a package in a monorepo, together with core logic, beta versions and samples.

### Contributing

Contributions welcome!
For details about commiting changes, type generation, automated versioning and releases, see [Contributing](./CONTRIBUTING.md).

### Testing

This repo contains some integration tests that require a CDF API key for [cognitesdk-js](https://cognite.fusion.cognite.com/cognitesdk-js/) project.
Talk to any of the contributors or leave an issue and it'll get sorted.
GitHub Action will run the test and has its own API key.

Run tests:

```bash
yarn
yarn build
yarn test --since master
```

To run integration tests, you would have to pass the following environment variables:

- **COGNITE_PROJECT**: the CDF project to test against, typically [cognitesdk-js](https://cognite.fusion.cognite.com/cognitesdk-js/).
- **COGNITE_CREDENTIALS**: an API key for the CDF project.

Set the environment variable `REVISION_3D_INTEGRATION_TEST=true` to run 3D revision integration tests.

We use `jest` to run tests, see [their documentation](https://github.com/facebook/jest) for more information.

We can use any project & token to run tests locally.
Just remove `apiKeyMode` usage from setupClient & add stripped token to `COGNITE_CREDENTIALS`.

### Versioning

The libraries follow [Semantic Versioning](https://semver.org/).
Package versions are updated automatically and individually based on commit messages.

### CHANGELOG

Each package in the monorepo has its own changelog.

- [@cognite/sdk](./packages/stable/CHANGELOG.md)
- [@cognite/sdk-beta](./packages/beta/CHANGELOG.md)
- [@cognite/sdk-core](./packages/core/CHANGELOG.md)
- [@cognite/sdk-alpha](./packages/alpha/CHANGELOG.md)
- [@cognite/sdk-playground](./packages/playground/CHANGELOG.md)

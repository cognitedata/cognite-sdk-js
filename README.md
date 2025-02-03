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

This section provides guidance on how to integrate and use the authentication feature for our SDK, leveraging OpenID Connect (OIDC) as the primary authentication protocol. The OIDC implementation ensures a secure and reliable user authentication process, enhancing the security of your application.

### Prerequisites
Before you begin, ensure that you have the following:

- Access to an OpenID Connect (OIDC) compatible Identity Provider (IdP) for authentication (e.g., MSAL, Auth0).
- A valid client ID and client secret provided by your OIDC IdP.
- The redirect_uri registered with your OIDC IdP for your application.
- Our SDK installed and integrated into your application.

### Setting up OIDC Authentication

- Initialize the SDK: Import and initialize the SDK in your application, providing the necessary configuration options such as the client ID, client secret, and redirect URI obtained from your OIDC IdP.
- Setup a token provider using the `oidcTokenProvider` property of SDK. Here you can provide a valid access token for the CDF API.

For code example you can check [quickstart.ts](https://github.com/cognitedata/cognite-sdk-js/blob/master/samples/nodejs/oidc-typescript/quickstart.ts#L1)

### Browser authentication

Please see [this guide](./guides/authentication.md) for a detailed guide.

## Response header & http status

Methods are designed to only return the response body. For fetching the http response status and/or header you must utilize client.getMetadata:

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

This repo contains some integration tests that relies on OIDC specifically `msal-node` library. 

**Important to know**: 
- Some of the integration tests could be eventually consistent 
- Some of test cases are skipped due to expensive and heavy API calls which only need to run once
- `packages/stable/src/__tests__/api/groups.int.spec.ts` test relies on specific `testDataSetId`

Talk to any of the contributors or leave an issue and it'll get sorted.
GitHub Action will run the test and has its own secrets set.

Run tests:

```bash
yarn
yarn build
yarn test --since master
```

To run integration tests, you would have to pass the following environment variables:

- **COGNITE_PROJECT**
- **COGNITE_BASE_URL**
- **COGNITE_CLIENT_SECRET**
- **COGNITE_CLIENT_ID**
- **COGNITE_AZURE_DOMAIN**

Set the environment variable `REVISION_3D_INTEGRATION_TEST=true` to run 3D revision integration tests.

We use `vitest` to run tests, see [their documentation](https://vitest.dev/) for more information.

### Versioning

The libraries follow [Semantic Versioning](https://semver.org/).
Package versions are updated automatically and individually based on commit messages.

### CHANGELOG

Each package in the monorepo has its own changelog.

- [@cognite/sdk](./packages/stable/CHANGELOG.md)
- [@cognite/sdk-beta](./packages/beta/CHANGELOG.md)
- [@cognite/sdk-core](./packages/core/CHANGELOG.md)
- [@cognite/sdk-alpha](./packages/alpha/CHANGELOG.md)

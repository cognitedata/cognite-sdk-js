<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

Cognite Javascript SDK
======================
[![Build Status](https://travis-ci.org/cognitedata/cognite-sdk-js.svg?branch=master)](https://travis-ci.org/cognitedata/cognite-sdk-js)
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

## License

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Development

The sdk is implemented as a package in a monorepo, together with core logic, beta versions and samples.

### Contributing

Contributions welcome!
For details about commiting changes, automated versioning and releases, see [Contributing](./CONTRIBUTING.md).

### Testing

This repo contains some integration tests that require a CDF api key for `cognitesdk-js` tenant.
Talk to any of the contributors or leave an issue and it'll get sorted.
Travis will run the test and has its own api key.

Run all tests:

```bash
yarn
yarn build
yarn test
```

Run tests for updated package only:
> for changes to the core package, it might be required to run tests for all packages to verify integrity.

```bash
yarn
yarn build
yarn test --since master
```

Set the environment variable `REVISION_3D_INTEGRATION_TEST=true` to run 3D revision integration tests.

We use `jest` to run tests, see [their documentation](https://github.com/facebook/jest) for more information.

### Versioning

The libraries follow [Semantic Versioning](https://semver.org/).
Package versions are updated automatically and individually based on commit messages.

### CHANGELOG

Each package in the monorepo has its own changelog.
- [@cognite/sdk](./packages/stable/CHANGELOG.md)
- [@cognite/sdk-beta](./packages/beta/CHANGELOG.md)
- [@cognite/sdk-core](./packages/core/CHANGELOG.md)

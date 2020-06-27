<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

Cognite Javascript SDK
======================
[![Build Status](https://travis-ci.org/haved/cognite-sdk-js.svg?branch=v1)](https://travis-ci.org/haved/cognite-sdk-js)
[![codecov](https://codecov.io/gh/haved/cognite-sdk-js/branch/v1/graph/badge.svg)](https://codecov.io/gh/haved/cognite-sdk-js)

The Cognite js library provides convenient access to the [Cognite API](https://doc.cognitedata.com/dev/) from
applications written in client- or server-side JavaScript.

## Getting Started

This repository contains several packages for different API versions.
To get started with the stable API, see the README [here](./packages/stable/README.md).

There is also a [beta API](./packages/beta/README.md).

## Samples

Samples are in the [samples/](./samples) directory. The samples' [README.md](./samples/README.md) has instructions for running the samples.

## License

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Development

The sdk is implemented as a package in a monorepo, together with core logic, beta versions and samples.
See [monorepo.md](./guides/monorepo.md) for details.

### Testing

There is one integration test that requires an api key. In order to run this, you need an api key for the `cognitesdk-js` tenant. Talk to any of the contributors or leave an issue and it'll get sorted. Travis will run the test and has its own api key.
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
Package versions are updated automatically and individually based on commit messages.

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
- [@haved/cogsdk](./packages/stable/CHANGELOG.md)
- [@haved/cogsdk-beta](./packages/beta/CHANGELOG.md)
- [@haved/cogsdk-core](./packages/core/CHANGELOG.md)

You can find the changelog from before the monorepo [here](./CHANGELOG.md).

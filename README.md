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

    yarn add @cognite/sdk

or npm

    npm install @cognite/sdk --save

## Usage

```js
const sdk = require('@cognite/sdk');

sdk.configure({
  project,
  apiKey,
});
```

### Using ES modules

```js
import * as sdk from '@cognite/sdk';
```

### Using typescript

The SDK is written in native typescript, so no extra types needs to be defined.

## Authentication

### Server-side - API key

> Authenticating with an api key should only happen when building server-side applications.

```js
const sdk = require('@cognite/sdk');
sdk.configure({
  project: 'yourProject',
  apiKey: 'yourApiKey',
});
```

It is generally a good idea store the api key as an environment variable, so it's not directly part of your code.

See [the nodejs example](./examples/nodejs/index.js)

### Web application - tokens

```js
import * as sdk from '@cognite/sdk';

// the next line can throw exception if it fails to log in
const authResult = await sdk.Login.authorize({
  project: 'YOUR-PROJECT-NAME', // project you want to login to (can be skipped if you have configured the project with 'configure')
  redirectUrl: window.location.href, // where you want the user to end up after successful login
  errorRedirectUrl: window.location.href, // where you want the user to end up after failed login
});

// at this point you are logged in and you can do calls with the SDK.

authResult = {
  accessToken: string,
  idToken: string,
  project: string,
  projectId: number,
  user: string,
}
```

See [the react example](./examples/react/src/App.js)

## Examples

See [examples](./examples).

## Documentation

- [SDK documentation](https://js-sdk-docs.cogniteapp.com/)
- [API documentation](https://doc.cognitedata.com)

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

We use `jest` to run tests, see [their documentation](https://github.com/facebook/jest) for more information.

## Release

How to release a new version:

1. Create a new branch
2. Run `yarn docs` to update the documentation
3. Commit changes (if any)
4. Run
    ```bash
    $ npm version [patch/minor/major]
    ```
5. Push branch and push tags (`git push --tags`)
6. Create a new pull requests
7. A new version will be published when PR is merged

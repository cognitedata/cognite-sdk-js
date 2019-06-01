Authentication in browsers
==========================

To utilize authentication in browsers using the SDK you need to use the `createClientWithOAuth` function from the SDK.

`createClientWithOAuth` will automatically handle authentication of the user and respond when the client get a `401`-response (not logged in) response from the API.

# Table of Contents
- [Authentication in browsers](#authentication-in-browsers)
- [Table of Contents](#table-of-contents)
  - [Why not using api keys?](#why-not-using-api-keys)
  - [Access tokens](#access-tokens)
  - [Authentication flow](#authentication-flow)
  - [How to authenticate with the SDK?](#how-to-authenticate-with-the-sdk)
    - [Authentication with redirects](#authentication-with-redirects)
      - [Simple example](#simple-example)
      - [Customize redirect URL](#customize-redirect-url)
    - [Authentication with popups](#authentication-with-popups)
      - [Simple example](#simple-example-1)
      - [Customize redirect URL](#customize-redirect-url-1)
  - [Advance](#advance)
    - [Manually trigger authentication](#manually-trigger-authentication)
    - [Skip authentication](#skip-authentication)
    - [Combine different authentication methods](#combine-different-authentication-methods)
    - [Tokens](#tokens)
  - [More](#more)

## Why not using api keys?

It is **strongly recommended** to not use api keys in web applications since the api key is easily readable by everyone that have access to the application. Another restriction is that all users of your app share the same api-key. This means that all users have the same access level.

## Access tokens

The solution to avoid using api keys is to use access tokens. This is short living tokens which grants the user access to CDF. The application get an access token by asking the user to login to the IdP-provier (Google, Active Directory etc) of a CDF project.

## Authentication flow

This describes the flow for the user using your application:
1. The user is using your app on this url: `https://my-app.com/some/path?someQuery=someValue`
2. The SDK redirect the user to the project's IdP provider
3. After a successful log in the browser will redirect the user back to the url `https://my-app.com/some/path?someQuery=someValue&access_token=someToken&id_token=someToken`
4. The app will initialize again and `createClientWithOAuth` will be called again
5. The SDK now sees the query parameters `access_token` and `id_token` in the URL. It will parse them and remove them from the URL
6. The SDK is now authenticated (using the access token from the URL)

The access token will expire after some time and result in the user get `401` from CDF again. A new authentication process will be triggered by the SDK.

## How to authenticate with the SDK?

There are two ways to authenticate using the SDK:

- [With redirect](#authentication-with-redirects)
- [With popups](#authentication-with-popups)

### Authentication with redirects

When doing authentication with redirects the currect browser window will be redirected to the IdP-provider for the user to log in. After login the same browser window will be redirect back to your application.

> You can find a running example application using redirects [here](../samples/react/authentication/src/App.js).

#### Simple example

```js
import * as sdk from '@cognite/sdk';
const client = sdk.createClientWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  // default is redirect
  // but can be explicitly specified:
  onAuthenticate: sdk.REDIRECT,
});

// then use the SDK:
const assets = await client.assets.retrive({ id: 23232789217132 });
```

The first time this will run the user will get a `401`-response from CDF in the first call to `client.assets`. This will trigger the SDK to perform a redirect of the browser window to authenticate.

The second time `client.assets` is called the SDK will be authenticated and the call will succeed.

#### Customize redirect URL

If you want a different redirect url back to your app after a successful / unsuccessful login you can implement this:

```js
import * as sdk from '@cognite/sdk';
const client = sdk.createClientWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: login => {
    login.redirect({
      redirectUrl: 'https://my-app.com/successful-login',
      errorRedirectUrl: 'https://my-app.com/unsuccessful-login', // this one is optional. Will default to redirectUrl
    });
  },
});
```

### Authentication with popups

When doing authentication with popups the currect browser window of your application will remain the same but a new window will pop-up asking the user to login into the IdP-provider. After a sucessful login the popup-window will automatically close itself.

> You can find a running example application using popups [here](../samples/react/authentication-with-popup/src/App.js).

#### Simple example

```js
import * as sdk from '@cognite/sdk';

if (sdk.isLoginPopupWindow()) {
  sdk.loginPopupHandler();
  return;
}
const client = sdk.createClientWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: sdk.POPUP,
});

// then use the SDK:
const assets = await client.assets.retrive({ id: 23232789217132 });
```

The first time this will run the user will get a `401`-response from CDF in the first call to `client.assets`. This will trigger the SDK to perform authentication of the user using a popup-window. A new window will popup showing the login screen of the IdP-provider. After a successful login the popup-window will be redirected back to your app (the same URL as the main browser window) where `sdk.loginPopupHandler` will be executed and handle the tokens in the URL and close the window. **Therefore it is important** that `sdk.loginPopupHandler` will run when the popup window gets redirected back to your app (otherwise the authentication process will fail).

After a successful authentication process the SDK will automatically retry the `client.assets` request and will eventually resolve and return the correct result.

#### Customize redirect URL

If you want a different redirect url back to your application after a successful / unsuccessful login you can do this:

```js
import * as sdk from '@cognite/sdk';
const client = sdk.createClientWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: login => {
    login.popup({
      redirectUrl: 'https://my-app.com/popup-handler',
      errorRedirectUrl: 'https://my-app.com/unsuccessful-login', // this one is optional. Will default to redirectUrl
    });
  },
});
```

This only affect the popup-window.

## Advance

### Manually trigger authentication

To avoid waiting for the first `401`-response to occour you can trigger the authentication flow manually like this:
```js
import * as sdk from '@cognite/sdk';
const client = sdk.createClientWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
});
await client.authenticate(); // this will also return a boolean based on if the user successfully authenticated or not.
```

### Skip authentication

It is possible to skip the authentication like this:
```js
import * as sdk from '@cognite/sdk';
const client = sdk.createClientWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: login => {
    login.skip();
  },
});
```

### Combine different authentication methods

If you want to use redirect-method in the initialization of your app and use the popup-method later (to not loose the state of your app) you can implement something like this:

```js
import * as sdk from '@cognite/sdk';
const client = sdk.createClientWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: login => {
    // some check:
    if (itShouldRedirect) {
      login.redirect({ ... });
    } else {
      login.popup({ ... });
    }
  },
});
```

### Tokens

If you need access to the tokens (access token, id token) from the login flow you can add a callback like this:

```js
import * as sdk from '@cognite/sdk';
const client = sdk.createClientWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  onTokens: tokens => {
    // where tokens will be an object on this format:
    // {
    //   accessToken: string;
    //   idToken: string;
    // }
  },
});
```

## More

Here is an article describing more in detail about the authentication process:
https://doc.cognitedata.com/dev/guides/iam/external-application.html#tokens
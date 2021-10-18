Authentication in browsers
==========================

To utilize authentication in browsers using the SDK you need to use the `client.loginWithOAuth(...)` from `CogniteClient` instance of the SDK.

`loginWithOAuth(...)` will automatically handle authentication of the user and respond when the client get a `401`-response (not logged in) response from the API.

# Table of Contents
- [Authentication in browsers](#authentication-in-browsers)
- [Table of Contents](#table-of-contents)
  - [Why not using api keys?](#why-not-using-api-keys)
  - [Access tokens](#access-tokens)
  - [Authentication flow](#authentication-flow)
  - [How to authenticate with the SDK?](#how-to-authenticate-with-the-sdk)
    - [CDF auth flow](#cdf-auth-flow)
      - [Authentication with redirects](#authentication-with-redirects)
        - [Simple example](#simple-example)
        - [Customize redirect URL](#customize-redirect-url)
      - [Authentication with pop-up](#authentication-with-pop-up)
        - [Simple example](#simple-example-1)
        - [Customize redirect URL](#customize-redirect-url-1)
      - [Advance](#advance)
        - [Manually trigger authentication](#manually-trigger-authentication)
        - [Cache access tokens](#cache-access-tokens)
        - [Skip authentication](#skip-authentication)
        - [Combine different authentication methods](#combine-different-authentication-methods)
        - [Tokens](#tokens)
      - [More](#more)
    - [Azure AD auth flow](#azure-ad-auth-flow)
      - [Requirenments](#requirements)
      - [Authentication via redirect](#authentication-via-redirect)
        - [Redirect sign in type example](#redirect-sign-in-type-example)
      - [Authentication via pop-up](#authentication-via-pop-up)
        - [Pop-up sign in type example](#pop-up-sign-in-type-example)
      - [Get cdf token](#get-cdf-token)

## Why not using api keys?

It is **strongly recommended** to not use api keys in web applications since the api key is easily readable by everyone that have access to the application. Another restriction is that all users of your app share the same api-key. This means that all users have the same access level, you lose tracing/auditing per user, keys are not time limited etc.

## Access tokens

The solution to avoid using api keys is to use access tokens. This is short living tokens which grants the user access to CDF. The application get an access token by asking the user to sign in to the identity provider (Google, Active Directory etc) of a CDF project.

## Authentication flow

This describes the flow for the user using your application:
1. The user is using your app on this url: `https://my-app.com/some/path?someQuery=someValue`
2. The SDK redirect the user to the project's identity provider
3. After a successful log in the browser will redirect the user back to the url `https://my-app.com/some/path?someQuery=someValue&access_token=someToken&id_token=someToken`
4. The app will initialize again and `createClientWithOAuth` will be called again
5. The SDK now sees the query parameters `access_token` and `id_token` in the URL. It will parse them and remove them from the URL
6. The SDK is now authenticated (using the access token from the URL)

The access token will expire after some time and result in the user get `401` from CDF again. A new authentication process will be triggered by the SDK.

## How to authenticate with the SDK?

SDK supports the following authentication flows:
 - [CDF auth flow](#cdf-auth-flow)
 - [Azure AD auth flow](#azure-ad-auth-flow)

## CDF auth flow

There are two ways to authenticate using the CDF auth flow:

- [With redirect](#authentication-with-redirects)
- [With pop-up](#authentication-with-pop-up)

### Authentication with redirects

When doing authentication with redirects the browser window will be redirected to the identity provider for the user to sign in.
After signing in, the browser window will be redirected back to your application.

> You can find a running example *application using legacy authentication w. redirects*
> [here](../samples/react/legacy-auth/src/App.tsx) and an *application using the MSAL.js library to
> integrate with Azure Active Directory* [here](../samples/react/msal-browser-react/src).

#### Simple example

```js
import { CogniteClient, REDIRECT, CogniteAuthentication } from '@cognite/sdk';

const project = 'YOUR PROJECT NAME HERE';
const legacyInstance = new CogniteAuthentication({
  project,
});

const getToken = async () => {
  await legacyInstance.handleLoginRedirect();
  let token = await legacyInstance.getCDFToken();
  if (token) {
    return token.accessToken;
  }
  token = await legacyInstance.login({ onAuthenticate: "REDIRECT" });
  if (token) {
    return token.accessToken;
  }
  throw new Error("error");
};



const client = new CogniteClient({
  project,
  getToken,
  ...
});

// then use the SDK:
const assets = await client.assets.retrieve({ id: 23232789217132 });
```

The first time this will run the user will get a `401`-response from CDF in the first call to `client.assets`. This will trigger the SDK to perform a redirect of the browser window to authenticate.

The second time `client.assets` is called the SDK will be authenticated and the call will succeed.


The first time this will run the user will get a `401`-response from CDF in the first call to `client.assets`.
This will trigger the SDK to perform authentication of the user using a pop-up window. A new pop-up window will show the sign in screen of the identity provider.
After a successful sign in the pop-up window will be redirected back to your app (the same URL as the main browser window) where `sdk.loginPopupHandler`
will be executed and handle the tokens in the URL and close the window. **Therefore it is important** that `sdk.loginPopupHandler` will run when the pop-up window gets redirected back to your app
(otherwise the authentication process will fail).

After a successful authentication process the SDK will automatically retry the `client.assets` request and will eventually resolve and return the correct result.


### Advance

#### Manually trigger authentication

To avoid waiting for the first `401`-response to occur you can trigger the authentication flow manually like this:
```js

const client = new CogniteClient({ ... });
await client.authenticate(); // this will also return a boolean based on if the user successfully authenticated or not.
```

#### Cache access tokens

If you already have a access token you can use it to skip the authentication flow (see this [section](#tokens) on how to get hold of the token). If the token is invalid or timed out the SDK will trigger a standard auth-flow on the first 401-response from CDF.
```js
const client  = new CogniteClient({
  project: 'YOUR PROJECT NAME HERE',
  getToken: Promise.resolve('ACCESS TOKEN FOR THE PROJECT HERE')
});

```

### More

Read more about the authentication process:
https://doc.cognitedata.com/dev/guides/iam/external-application.html#tokens

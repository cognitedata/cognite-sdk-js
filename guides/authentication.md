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
    - [Authentication with redirects](#authentication-with-redirects)
      - [Simple example](#simple-example)
      - [Customize redirect URL](#customize-redirect-url)
    - [Authentication with popups](#authentication-with-popups)
      - [Simple example](#simple-example-1)
      - [Customize redirect URL](#customize-redirect-url-1)
  - [Advance](#advance)
    - [Manually trigger authentication](#manually-trigger-authentication)
    - [Cache access tokens](#cache-access-tokens)
    - [Skip authentication](#skip-authentication)
    - [Combine different authentication methods](#combine-different-authentication-methods)
    - [Tokens](#tokens)
  - [More](#more)

## Why not using api keys?

It is **strongly recommended** to not use api keys in web applications since the api key is easily readable by everyone that have access to the application. Another restriction is that all users of your app share the same api-key. This means that all users have the same access level, you lose tracing/auditing per user, keys are not time limited etc.

## Access tokens

The solution to avoid using api keys is to use access tokens. This is short living tokens which grants the user access to CDF. The application get an access token by asking the user to login to the identity provider (Google, Active Directory etc) of a CDF project.

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

SDK supports few authentication flows:
 - [CDF auth flow](#cdf-auth-flow)
 - [Azure AD auth flow](#azure-ad-auth-flow)

## CDF auth flow

There are two ways to authenticate using the CDF auth flow:

- [With redirect](#authentication-with-redirects)
- [With popups](#authentication-with-popups)

### Authentication with redirects

When doing authentication with redirects the current browser window will be redirected to the identity provider for the user to log in.
After the login, the same browser window will be redirected back to your application.

> You can find a running example application using redirects [here](../samples/react/authentication/src/App.js).

#### Simple example

```js
import { CogniteClient, REDIRECT } from '@cognite/sdk';
const client = new CogniteClient({ ... });
client.loginWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  // default is redirect
  // but can be explicitly specified:
  onAuthenticate: REDIRECT,
});

// then use the SDK:
const assets = await client.assets.retrieve({ id: 23232789217132 });
```

The first time this will run the user will get a `401`-response from CDF in the first call to `client.assets`. This will trigger the SDK to perform a redirect of the browser window to authenticate.

The second time `client.assets` is called the SDK will be authenticated and the call will succeed.

#### Customize redirect URL

If you want a different redirect url back to your app after a successful / unsuccessful login you can implement this:

```js
import { CogniteClient, REDIRECT } from '@cognite/sdk';
const client = new CogniteClient({ ... });
client.loginWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: login => {
    login.redirect({
      redirectUrl: 'https://my-app.com/successful-login',
      errorRedirectUrl: 'https://my-app.com/unsuccessful-login', // We encourage you to use this property as well. If not specified it will default to redirectUrl
    });
  },
});
```

### Authentication with popups

When doing authentication with popups the currect browser window of your application will remain the same but a new window will pop-up asking the user to login into the identity provider. After a sucessful login the popup-window will automatically close itself.

> You can find a running example application using popups [here](../samples/react/authentication-with-popup/src/App.js).

#### Simple example

```js
import { CogniteClient, POPUP, isLoginPopupWindow, loginPopupHandler } from '@cognite/sdk';

if (isLoginPopupWindow()) {
  loginPopupHandler();
  return;
}
const client = new CogniteClient({ ... });
client.loginWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: POPUP,
});

// then use the SDK:
const assets = await client.assets.retrieve({ id: 23232789217132 });
```

The first time this will run the user will get a `401`-response from CDF in the first call to `client.assets`. This will trigger the SDK to perform authentication of the user using a popup-window. A new window will popup showing the login screen of the identity provider. After a successful login the popup-window will be redirected back to your app (the same URL as the main browser window) where `sdk.loginPopupHandler` will be executed and handle the tokens in the URL and close the window. **Therefore it is important** that `sdk.loginPopupHandler` will run when the popup window gets redirected back to your app (otherwise the authentication process will fail).

After a successful authentication process the SDK will automatically retry the `client.assets` request and will eventually resolve and return the correct result.

#### Customize redirect URL

If you want a different redirect url back to your application after a successful / unsuccessful login you can do this:

```js
import { CogniteClient, POPUP } from '@cognite/sdk';
const client = new CogniteClient({ ... });
client.loginWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: login => {
    login.popup({
      redirectUrl: 'https://my-app.com/popup-handler',
      errorRedirectUrl: 'https://my-app.com/unsuccessful-login', // We encourage you to use this property as well. If not specified it will default to redirectUrl
    });
  },
});
```

This only affect the popup-window.

## Advance

### Manually trigger authentication

To avoid waiting for the first `401`-response to occur you can trigger the authentication flow manually like this:
```js
client.loginWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
});
await client.authenticate(); // this will also return a boolean based on if the user successfully authenticated or not.
```

### Cache access tokens

If you already have a access token you can use it to skip the authentication flow (see this [section](#tokens) on how to get hold of the token). If the token is invalid or timed out the SDK will trigger a standard auth-flow on the first 401-response from CDF.
```js
client.loginWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  accessToken: 'ACCESS TOKEN FOR THE PROJECT HERE',
});
```
> `client.authenticate()` will still override this and trigger a new authentication flow.

### Skip authentication

It is possible to skip the authentication like this:
```js
client.loginWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: login => {
    login.skip();
  },
});
```

### Combine different authentication methods

If you want to use redirect-method in the initialization of your app and use the popup-method later (to not lose the state of your app) you can implement something like this:

```js
client.loginWithOAuth({
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
client.loginWithOAuth({
  project: 'YOUR PROJECT NAME HERE',
  onTokens: ({accessToken, idToken}) => {
    // your logic here
  },
});
```

### More

Here is an article describing more in detail about the authentication process:
https://doc.cognitedata.com/dev/guides/iam/external-application.html#tokens

## Azure AD auth flow

Azure AD auth flow can be used via the same `loginWithOAuth` method of `CogniteClient`,
but different `options` structure has to be passed. You'll find what options structure has to be provided in examples below.
Besides, here list of pre-requirements, that need to be in place to use Azure AD authentication flow:

 - CDF project, which you're trying to log in, has to be configured to accept tokens issued by Azure AD (to be related to the cluster, that accepts Azure AD tokens, `bluefield` for instance)
 - You should have the `clientId` of your Azure AD application token will be issued for
 - Cluster your CDF project related to (`bluefield` for instance)

Azure AD authentication flow supports two login types:

 - [With redirect](#authentication-via-redirect)
 - [With popup](#authentication-via-popup)

### Authentication via redirect

When you authenticate using redirect, auth flow remains quite similar that we have in CDF auth flow.
But the IdP in this is Azure where user has to log in to prove identity.

> You might find useful example application using redirect Azure AD auth flow [here](../samples/react/authentication-aad/src/App.js).
> And don't forget to provde required environment variables via `.env` file.
 
#### Redirect sign in type example

```js
import { CogniteClient } from '@cognite/sdk';
const client = new CogniteClient({ ... });

// tenantId can be also undefined,
// microsoft /common endpoint will be used to define tenant instead
client.loginWithOAuth({
  cluster: 'cdf-cluster-name',
  clientId: 'azure-application-client-id',
  tenantId: 'azure-tenant-id'
});

// authenticate to the provided cluster
await client.authenticate();

// set project name to make requsts to
client.setProject('cdf-project-name');

// then use the SDK:
const assets = await client.assets.retrive({ id: 23232789217132 });
```

With the call `await client.authenticate()` you'll be redirected to the IdP for log in.
After a successful login, you'll be redirected back and `await client.authenticate()` call
will return you `true` as a result of the successful login. An important thing here is
to set project for the `CogniteClient` instance via `client.setProject('project-name')` 

### Authentication via popup

Popup can be also used to provide user ability to log in Azure.

```js
import { CogniteClient, AZURE_AUTH_POPUP } from '@cognite/sdk';
const client = new CogniteClient({ ... });

client.loginWithOAuth({
  cluster: 'cdf-cluster-name',
  clientId: 'azure-application-client-id',
  signInType: AZURE_AUTH_POPUP,
});

// authenticate to the provided cluster
await client.authenticate();

// set project name to make requsts to
client.setProject('cdf-project-name');

// then use the SDK:
const assets = await client.assets.retrive({ id: 23232789217132 });
```

After `client.authenticate()` call application waits for the message from the just popped up window about
successful or unsuccessful log in inside it. In case of `client.authenticate()` returns `true`
you good to set cdf project name and make requests.

### Get cdf token

After user has been successfully authenticated, CDF token can be acquired via `await client.getCDFToken()`.
This method works only for Azure AD authentication flow. Here is also ability to check which flow has been used with `loginWithOAuth`:

```js
import { CogniteClient, AZURE_AUTH_POPUP, AAD_OAUTH } from '@cognite/sdk';
const client = new CogniteClient({ ... });

client.loginWithOAuth({
  cluster: 'cdf-cluster-name',
  clientId: 'azure-application-client-id',
  signInType: AZURE_AUTH_POPUP,
});

// authenticate to the provided cluster
await client.authenticate();

// set project name to make requsts to
client.setProject('cdf-project-name');

if (client.getOAuthFlowType() === AAD_OAUTH) {
  const cdfToken = await client.getCDFToken()
}
```

Authentication in browsers
==========================

# Table of Contents
- [Table of Contents](#table-of-contents)
  - [Why not using API keys?](#why-not-using-api-keys)
  - [Access tokens](#access-tokens)
  - [Accessing different clusters](#accessing-different-clusters)
  - [How to authenticate with the SDK?](#how-to-authenticate-with-the-sdk)
  - [OIDC](#oidc)
    - [OIDC authentication using code authorization w pkce.](#oidc-authentication-using-code-authorization-w-pkce)
    - [OIDC authentication using client credentials](#oidc-authentication-using-client-credentials)
  - [CDF auth flow](#cdf-auth-flow)
    - [Legacy Authentication with redirects](#legacy-authentication-with-redirects)
    - [Legacy Authentication with pop-up](#legacy-authentication-with-pop-up)
  - [API Keys](#api-keys)
  - [Manually trigger authentication](#manually-trigger-authentication)
  - [Cache access tokens](#cache-access-tokens)


## Why not using API keys?

It is **strongly recommended** to not use API keys in web applications since the API key is easily
readable by everyone that have access to the application. Another restriction is that all users of
your app share the same API-key. This means that all users have the same access level, you lose
tracing/auditing per user, keys are not time limited etc.

## Access tokens

The solution to avoid using API keys is to use access tokens. This is short living tokens which
grants the user access to CDF. The application get an access token by asking the user (or client
credential) to sign in to the identity provider (Google, Active Directory etc) of a CDF project.

The access token will expire after some time and result in the user get `401` from CDF again. A new
authentication process will be triggered by the SDK.

## Accessing different clusters

Cognite operates multiple different clusters. The default one is `api.cognitedata.com` and will be
used if you do not override it. If you are accessing projects on a different cluster you have to
specify that with the
[baseUrl](https://cognitedata.github.io/cognite-sdk-js/interfaces/clientoptions.html#baseurl)
parameter in the SDK constructor.

```js
// Specify the cluster `bluefueld`
const client = new CogniteClient({
  appId: 'sample-app',
  baseUrl: 'https://bluefield.cognitedata.com',
  project: 'demo-project',
  getToken: ...
});
```

## How to authenticate with the SDK?

Shortly summarized, the application pass a `getToken` callback to the SDK and this will be used to
get and renew tokens as they are needed. The SDK comes with an implementation of the Cognite legacy
authentication flow, _but it does not come with an implementation for all IDPs_!. If you need to
integrate your application and the SDK with e.g Azure Active Directory, use the appropriate library
from Microsoft. If you need to integrate with Auth0, use their libraries and integrate with the SDK
via `getToken`.

## OpenID Connect (OIDC)

See
[this](https://docs.cognite.com/cdf/access/concepts/best_practices_oidc.html#design-principles-openid-connect-and-cdf)
for details about OIDC and Cognite.

### OIDC authentication using code authorization w pkce.

This examples shows how to use the Microsoft library
[msal](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser)
to get a token from Azure Active directory on behalf of a user using [authorization code
flow](https://oauth.net/2/grant-types/authorization-code/) with [pkce](https://oauth.net/2/pkce/);

```js
import { Configuration, PublicClientApplication } from "@azure/msal-browser";
import { CogniteClient } from "@cognite/sdk";

const cluster = process.env.REACT_APP_CLUSTER || 'api'
const baseUrl = `https://${cluster}.cognitedata.com`;

const scopes = [
  `${baseUrl}/DATA.VIEW`,
  `${baseUrl}/IDENTITY`
];

// MSAL configuration
const configuration: Configuration = {
  auth: {
    clientId: "$AZURE_APP_ID",
    authority: "https://login.microsoftonline.com/$AZURE_TENANT_ID",
  },
};

const pca = new PublicClientApplication(configuration);
const getToken = async () => {
  const accountId = "some-id";
  const account = pca.getAccountByLocalId(accountId)!;
  const token = await pca.acquireTokenSilent({
    account,
    scopes,
  }).catch(e => {
    return pca.acquireTokenPopup({
    account,
    scopes,
    });
  });
  return token.accessToken;
};


const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  getToken
});

```

A full sample application can be found [here](../samples/react/msal-browser-react/) and
[here](../samples/react/msal-advanced-browser-react).

### OIDC authentication using client credentials

This flow is to get a token on behalf of a [client
credential](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow).
This is typically a non-human entity with some access to a system and are the appropriate choice for
background operations like extractors. Client credentials have a similar use case as API keys for
legacy authenticated projects.

#### Example
```js
async function quickstart() {
  const pca = new ConfidentialClientApplication({
    auth: {
      clientId,
      clientSecret,
      authority: `https://login.microsoftonline.com/${azureTenant}`,
    },
  });

  const client = new CogniteClient({
    appId: 'Cognite SDK samples',
    project,
    getToken: () =>
      pca
        .acquireTokenByClientCredential({
          scopes: ['https://api.cognitedata.com/.default'],
          skipCache: true,
        })
        .then((response) => response?.accessToken! as string),
  });

  await client.authenticate();

  const info = (await client.get('/api/v1/token/inspect')).data;

  console.log('tokenInfo', JSON.stringify(info, null, 2));

  try {
    const assets = await client.assets.list();
    console.log(assets);
  } catch (e) {
    console.log('asset error');
    console.log(e);
  } //
}

quickstart()
```
[Demo project](../samples/nodejs/oidc-typescript/)


## CDF auth flow

CDF auth flow, also called _legacy auth flow_ is a deprecated method of getting access to
CDF-projects. It is the predecessor of _OIDC_, OpenId Connect.

This describes the legacy flow for the user using your application:
1. The user is using your app on this URL: `https://my-app.com/some/path?someQuery=someValue`
2. The SDK redirect the user to the project's identity provider
3. After a successful log in the browser will redirect the user back to the URL `https://my-app.com/some/path?someQuery=someValue&access_token=someToken&id_token=someToken`
4. The app will initialize again and `createClientWithOAuth` will be called again
5. The SDK now sees the query parameters `access_token` and `id_token` in the URL. It will parse them and remove them from the URL
6. The SDK is now authenticated (using the access token from the URL)

There are two ways to authenticate using the CDF auth flow:

- [With redirect](#legacy-authentication-with-redirects)
- [With pop-up](#legacy-authentication-with-pop-up)

### Legacy Authentication with redirects

When doing authentication with redirects the browser window will be redirected to the identity
provider for the user to sign in. After signing in, the browser window will be redirected back to
your application.

#### Example

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
  token = await legacyInstance.login({ onAuthenticate: REDIRECT });
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
const assets = await client.assets.retrieve([{ id: 23232789217132 }]);
```

A full example of an application can be found [here](../samples/react/legacy-auth-redirect/src/App.tsx).

The first time this will run the user will get a `401`-response from CDF in the first call to
`client.assets`. This will trigger the SDK to perform a redirect of the browser window to
authenticate.

The second time `client.assets` is called the SDK will be authenticated and the call will succeed.


The first time this will run the user will get a `401`-response from CDF in the first call to
`client.assets`. This will trigger the SDK to perform authentication of the user using a pop-up
window. A new pop-up window will show the sign in screen of the identity provider. After a
successful sign in the pop-up window will be redirected back to your app (the same URL as the main
browser window) where `sdk.loginPopupHandler` will be executed and handle the tokens in the URL and
close the window. **Therefore it is important** that `sdk.loginPopupHandler` will run when the
pop-up window gets redirected back to your app (otherwise the authentication process will fail).

After a successful authentication process the SDK will automatically retry the `client.assets`
request and will eventually resolve and return the correct result.


### Legacy Authentication with pop-up

When doing authentication with redirects the browser window will be redirected to the identity
provider for the user to sign in. After signing in, the browser window will be redirected back to
your application.

#### Example

```js
import {
  CogniteClient,
  POPUP,
  CogniteAuthentication,
  loginPopupHandler,
  isLoginPopupWindow,
} from "@cognite/sdk";

const project = "some-project";
const baseUrl = "https://greenfield.cognitedata.com";

const legacyInstance = new CogniteAuthentication({
  project,
  baseUrl
});

if (isLoginPopupWindow()) {
  loginPopupHandler();
}

const getToken = async () => {
  await legacyInstance.handleLoginRedirect();
  let token = await legacyInstance.getCDFToken();
  if (token) {
    return token.accessToken;
  }
  token = await legacyInstance.login({ onAuthenticate: POPUP });
  if (token) {
    return token.accessToken;
  }
  throw new Error("error");
};

const client = new CogniteClient({
  appId: "masl-demo",
  project,
  getToken,
});

const assets = await client.assets.retrieve([{ id: 23232789217132 }]);
```

A full example of an application can be found [here](../samples/react/legacy-auth-popup/src/App.tsx).

## API Keys

API keys use the same API in the SDK, `getToken`, but needs an additional flag `apiKeyMode` set to
true to handle headers appropriately.

```js
const client = new CogniteClient({
  appId: 'api-key-app',
  project: 'demo-project',
  apiKeyMode: true,
  getToken: Promise.resolve('API_KEY_HERE')
});
```

## Manually trigger authentication

To avoid waiting for the first `401`-response to occur you can trigger the authentication flow manually like this:
```js

const client = new CogniteClient({ ... });
await client.authenticate(); // this will also return the token received
```

## Cache access tokens

If you already have a access token you can use it to skip the authentication flow (see this [section](#tokens) on how to get hold of the token). If the token is invalid or timed out the SDK will trigger a standard auth-flow on the first 401-response from CDF.
```js
const client  = new CogniteClient({
  project: 'YOUR PROJECT NAME HERE',
  getToken: Promise.resolve('ACCESS TOKEN FOR THE PROJECT HERE')
});

```

## More

Read more about the authentication process:
https://doc.cognitedata.com/dev/guides/iam/external-application.html#tokens

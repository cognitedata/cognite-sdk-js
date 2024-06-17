# Authentication in browsers

- [Authentication in browsers](#authentication-in-browsers)
  - [Use access tokens instead of API keys](#use-access-tokens-instead-of-api-keys)
  - [Accessing different clusters](#accessing-different-clusters)
  - [How to authenticate with the SDK?](#how-to-authenticate-with-the-sdk)
  - [OpenID Connect (OIDC)](#openid-connect-oidc)
    - [OIDC authentication using code authorization w pkce](#oidc-authentication-using-code-authorization-w-pkce)
    - [OIDC authentication using client credentials](#oidc-authentication-using-client-credentials)
      - [Example](#example)
  - [Manually trigger authentication](#manually-trigger-authentication)
  - [Cache access tokens](#cache-access-tokens)
  - [More](#more)

## Use access tokens instead of API keys

We **strongly recommend** that you don't use API keys in web applications since the API key is easily readable by everyone with access to the application. Another restriction is that all users of your app share the same API key. All users will have the same access level, you lose tracing/auditing per user, keys are not time-limited, etc.

Instead of API keys, use **access tokens**. These are short-lived tokens that grant the user access to CDF. The application gets an access token by asking the user (or client credential) to sign in to a CDF project's identity provider (Google, Active Directory, etc.).

The access token expires after a time, and as a result, the user will get `401` from CDF again, and the SDK triggers a new authentication process.

## Accessing different clusters

Cognite operates multiple clusters. The default cluster `api.cognitedata.com` will be
used unless you override it. To access projects on a different cluster, use the [baseUrl](https://cognitedata.github.io/cognite-sdk-js/interfaces/clientoptions.html#baseurl) parameter in the SDK constructor.

```js
// Specify the cluster `bluefield`
const client = new CogniteClient({
  appId: 'sample-app',
  baseUrl: 'https://bluefield.cognitedata.com',
  project: 'demo-project',
  getToken: ...
});
```

## How to authenticate with the SDK?

Quickly summarized, the application passes a `getToken` callback to the SDK and uses it to
get and renew tokens as needed. **Note** that the SDK comes with an implementation of the Cognite legacy
authentication flow, **but it does not come with an implementation for all IDPs**. If you need to
integrate your application and the SDK with, for example, Azure Active Directory, use the appropriate library
from Microsoft. If you need to integrate with Auth0, use their libraries and integrate with the SDK
via `getToken`.

## OpenID Connect (OIDC)

See
[this article](https://docs.cognite.com/cdf/access/concepts/best_practices_oidc#design-principles-openid-connect-and-cdf)
for details about OIDC and Cognite.

### OIDC authentication using code authorization w pkce

This example shows how to use the Microsoft [msal](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser) library to get a token from Azure Active directory on behalf of a user using the [authorization code
flow](https://oauth.net/2/grant-types/authorization-code/) with [pkce](https://oauth.net/2/pkce/):

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
  const accountId = sessionStorage.getItem("account");
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

You can find a full sample application [here](https://github.com/cognitedata/cognite-sdk-js/tree/master/samples/react/msal-browser-react/) and
[here](https://github.com/cognitedata/cognite-sdk-js/tree/master/samples/react/msal-advanced-browser-react).

### OIDC authentication using client credentials

This flow gets a token on behalf of a [client
credential](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow).
This is typically a non-human entity with some access to a system and is appropriate for
background operations like extractors. Client credentials have a similar use case as API keys have for
legacy authenticated projects.

#### Example

```js
import { ConfidentialClientApplication } from "@azure/msal-node";

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
    baseUrl: "https://api.cognitedata.com",
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

[Demo project](https://github.com/cognitedata/cognite-sdk-js/tree/master/samples/nodejs/oidc-typescript)

## Manually trigger authentication

Instead of waiting for the first `401` response, you can trigger the authentication flow manually like this:

```js

const client = new CogniteClient({ ... });
await client.authenticate(); // this also returns the token received
```

## Cache access tokens

If you already have an access token, you can use it to skip the authentication flow.

<!-- (See this [section](#tokens) on how to get hold of the token). -->

If the token is invalid or timed out, the SDK triggers a standard auth-flow on the first 401-response from CDF.

```js
const client = new CogniteClient({
  project: 'YOUR PROJECT NAME HERE',
  getToken: () => Promise.resolve('ACCESS TOKEN FOR THE PROJECT HERE'),
});
```

## More

Read more about the [authentication process](https://developer.cognite.com/dev/guides/iam/external-application#tokens).

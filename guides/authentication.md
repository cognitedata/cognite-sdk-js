# Authentication in browsers

- [Authentication in browsers](#authentication-in-browsers)
  - [Use of access tokens](#use-of-access-tokens)
  - [Accessing different clusters](#accessing-different-clusters)
  - [How to authenticate with the SDK?](#how-to-authenticate-with-the-sdk)
    - [Example using Entra ID through MSAL](#example-using-entra-id-through-msal)
    - [OIDC authentication using client credentials](#oidc-authentication-using-client-credentials)
      - [Example](#example)
  - [Manually trigger authentication](#manually-trigger-authentication)
  - [Cache access tokens](#cache-access-tokens)
  - [More](#more)

## Use of access tokens

The Cognite Data Fusion API only supports [access tokens](https://datatracker.ietf.org/doc/html/rfc6749#section-1.4), which are short-lived tokens (typically a [JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519)). Therefore, the SDK must attach such a token to each request. The SDK doesn't itself generate an access token but provides a mechanism to ask for a valid access token when the SDK needs one. This is done through the `oidcTokenProvider` field in the CogniteClient constructor:

```ts
const client = new CogniteClient({
  appId: 'sample-app',
  baseUrl: 'https://api.cognitedata.com',
  project: 'demo-project',
  oidcTokenProvider: async () => { ... },
});
```

`oidcTokenProvider` is a function that must be provided and has the return type `Promise<string>`. The return value should be a promise resolving into a valid access token. It's the developer's responsibility to get hold of such a token. How to get the token depends on the Identity Provider (IdP) that is configured to be used for the Cognite Data Fusion project/organization. The most common is to use Entra ID (former Azure AD), and there is an example below on how to authenticate with Entra ID.

The first invocation of `oidcTokenProvider` will happen after one of these actions:
1. `client.authenticate()` is called.
2. The SDK gets a [HTTP 401 status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) response from the Cognite Data Fusion API.

`oidcTokenProvider` may be invoked several times as the access token is short-lived. Whenever the SDK receives a 401, the SDK will call `oidcTokenProvider` to get an updated token. If the new token differs from the token used in the 401 request, then the request will be retried with the new token.

## Accessing different clusters

Cognite operates multiple clusters. The default cluster `api.cognitedata.com` will be
used unless you override it. To access projects on a different cluster, use the [baseUrl](https://cognitedata.github.io/cognite-sdk-js/interfaces/clientoptions.html#baseurl) parameter in the SDK constructor.

```js
// Specify the cluster `bluefield`
const client = new CogniteClient({
  appId: 'sample-app',
  baseUrl: 'https://bluefield.cognitedata.com',
  project: 'demo-project',
  oidcTokenProvider: ...
});
```

## How to authenticate with the SDK?

Quickly summarized, the application passes a `oidcTokenProvider` callback to the SDK and uses it to get and renew tokens as needed. If you need to integrate your application and the SDK with, for example, Entra ID (Microsoft), use the appropriate library
from Microsoft ([msal](https://www.npmjs.com/package/@azure/msal-browser)). If you need to integrate with Auth0, use their libraries and integrate with the SDK via `oidcTokenProvider`.

### Example using Entra ID through MSAL

This example shows how to use the Microsoft [msal](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser) library to get a token from Microsoft on behalf of a user using the [authorization code flow](https://oauth.net/2/grant-types/authorization-code/) with [PKCE](https://oauth.net/2/pkce/):

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
const oidcTokenProvider = async () => {
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
  oidcTokenProvider
});

```

You can find a full sample application [here](https://github.com/cognitedata/cognite-sdk-js/tree/master/samples/react/msal-browser-react/) and [here](https://github.com/cognitedata/cognite-sdk-js/tree/master/samples/react/msal-advanced-browser-react).

### OIDC authentication using client credentials

This flow gets a token on behalf of a [client credential](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow). This is typically a non-human entity with some access to a system and is appropriate for
background operations like extractors.

#### Example

```ts
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
    oidcTokenProvider: () =>
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

```ts

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
  oidcTokenProvider: () => Promise.resolve('ACCESS TOKEN FOR THE PROJECT HERE'),
});
```

## More

Read more about the [authentication process](https://developer.cognite.com/dev/guides/iam/external-application#tokens).

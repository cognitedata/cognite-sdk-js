# Authentication
​
- [Use access tokens instead of API keys](#use-access-tokens-instead-of-api-keys)
- [Access different clusters](#access-different-clusters)
- [How to authenticate with the SDK?](#how-to-authenticate-with-the-sdk)
- [OpenID Connect (OIDC) w getToken](#openid-connect-oidc-w-gettoken)
  - [Client Credentials Flow](#oidc-authentication-using-gettoken-w-client-credentials-flow)
  - [Device Code Flow](#oidc-authentication-using-gettoken-w-device-code-flow)
  - [Device Code Flow w Refresh Token](#oidc-authentication-using-gettoken-w-device-code-flow-w-refresh-token)
  - [Implicit Flow](#oidc-authentication-using-gettoken-w-implicit-flow)
  - [PKCE Flow](#oidc-authentication-using-gettoken-w-pkce-flow)
  - [PKCE Flow w Refresh Token](#oidc-authentication-using-gettoken-w-pkce-flow-w-refresh-token)
- [OpenID Connect (OIDC) w credentials](#openid-connect-oidc-w-credentials)
  - [Client Credentials Flow](#oidc-authentication-using-gettoken-w-client-credentials-flow)
  - [Device Code Flow](#oidc-authentication-using-credentials-w-device-code-flow)
  - [PKCE Flow](#oidc-authentication-using-credentials-w-pkce-flow)
- [API keys](#api-keys)
  - [getToken metod](#gettoken-metod)
  - [credentials method](#credentials-method)
- [Manually trigger authentication](#manually-trigger-authentication)
​
## Use access tokens instead of API keys
​
Instead of API keys, we strongly recommend you use **access tokens**. These are short-lived tokens that grant the user access to CDF. The application gets an access token by asking the user (or client credential) to sign in to a CDF project's identity provider (Google, Active Directory, etc.).

The access token expires after a time, and as a result, the user will get `401` from CDF again, and the SDK triggers a new authentication process.

We do not recommend the use API keys of in web applications since the API key is easily readable by everyone with access to the application. Another restriction is that all app users share the same API key. All users will have the same access level, and you lose tracing/auditing per user, keys are not time-limited, etc.

## Access different clusters
​
The default cluster for Cognite is `api.cognitedata.com`. To override this cluster and to access projects on a different cluster, use the [baseUrl](https://cognitedata.github.io/cognite-sdk-js/interfaces/clientoptions.html#baseurl) parameter in the SDK constructor.
​
```js
// Specify the cluster `bluefield`
const client = new CogniteClient({
  appId: 'sample-app',
  baseUrl: 'https://bluefield.cognitedata.com',
  project: 'demo-project',
  getToken: Promise.resolve(...)
});
```
​
## How to authenticate with the SDK?
​
There are two ways to authenticate with the SDK.
​
1. Using the `getToken` method: You can use the `getToken` method as a parameter on CogniteClient. This will act as a callback to the SDK and uses it to retrieve and renew tokens whenever required. `getToken` method can be used to authenticate with api keys or OIDC directly by making use of identity providers like Azure Active Directory, Auth0, etc. 
You can use the appropriate library [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper). 
​
> NOTE: The SDK comes with an implementation of the Cognite legacy authentication flow, _but it does not come with an implementation for all IDPs_. This method will be deprecated soon.
​
2. Using the `credentials` field: You can use the `credentials` field as a parameter since the SDK uses [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) internally to manage the authentication life cycle from the beginning until token refresh.
​
## OpenID Connect (OIDC) w `getToken`
​
### OIDC authentication using getToken w Client Credentials Flow
​
The example below shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active Directory on behalf of a user using the [Client credentials flow](https://oauth.net/2/grant-types/client-credentials/):
​
```js
import { ISettings, ClientCredentialsAuth } from "@cognite/auth-wrapper";
import { CogniteClient } from "@cognite/sdk";
​
const settings: ISettings = {
    authority: 'your_authority',
    client_id: 'your_client_id',
    grant_type: 'your_grant_type',
    client_secret: 'your_client_secret',
    scope: 'your_scope'
};
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  getToken: () => Promise.resolve(await ClientCredentialsAuth.load(settings).login()),
});
​
```
​
You can find a full sample application [here]()
​
### OIDC authentication using getToken w Device Code Flow
​
The example below shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active Directory on behalf of a user using the [Device code flow](https://oauth.net/2/grant-types/device-code/):
​
```js
import { ISettings, DeviceAuth } from "@cognite/auth-wrapper";
import { CogniteClient } from "@cognite/sdk";
​
const settings: ISettings = {
    authority: 'your_authority',
    client_id: 'your_client_id',
    grant_type: 'your_grant_type',
    client_secret: 'your_client_secret',
    scope: 'your_scope'
};
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  getToken: () => Promise.resolve(await DeviceAuth.load(settings).login()),
});
​
```
​
You can find a full sample application [here]()
​
### OIDC authentication using getToken w Device Code Flow w Refresh Token
​
The example below shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active Directory on behalf of a user using the [Device code flow](https://oauth.net/2/grant-types/device-code/):
​
```js
import { ISettings, DeviceAuth } from "@cognite/auth-wrapper";
import { CogniteClient } from "@cognite/sdk";
​
const settings: ISettings = {
    authority: 'your_authority',
    client_id: 'your_client_id',
    client_secret: 'your_client_secret',
    scope: 'your_scope'
};
​
// Retrieving access_token.
const tokenResponse = await DeviceAuth.load(this.settings).login();
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  getToken: () => Promise.resolve(await DeviceAuth.load(
    settings
  ).login(tokenResponse?.refresh_token)),
});
​
```
​
You can find a full sample application [here]()
​
### OIDC authentication using getToken w Implicit Flow
​
The example below shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active Directory on behalf of a user using the [Implicit flow](https://oauth.net/2/grant-types/implicit/):
​
```js
import { ISettings, ImplicitAuth } from "@cognite/auth-wrapper";
import { CogniteClient } from "@cognite/sdk";
​
const settings: ISettings = {
    authority: 'your_authority',
    client_id: 'your_client_id',
    grant_type: 'your_grant_type',
    client_secret: 'your_client_secret',
    scope: 'your_scope'
};
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  getToken: () => Promise.resolve(await ImplicitAuth.load(settings).login()),
});
​
```
​
You can find a full sample application [here]()
​
### OIDC authentication using getToken w PKCE Flow
​
The example below shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active Directory on behalf of a user using the [Authorization code flow](https://oauth.net/2/grant-types/authorization-code/) with [PKCE](https://oauth.net/2/pkce/):
​
```js
import { ISettings, PkceAuth } from "@cognite/auth-wrapper";
import { CogniteClient } from "@cognite/sdk";
​
const settings: ISettings = {
    authority: 'your_authority',
    client_id: 'your_client_id',
    client_secret: 'your_client_secret',
    scope: 'your_scope'
};
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  getToken: () => Promise.resolve(await PkceAuth.load(settings).login()),
});
​
```
​
You can find a full sample application [here]()
​
### OIDC authentication using getToken w PKCE Flow w Refresh Token
​
The example below shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active Directory on behalf of a user using the [Authorization code flow](https://oauth.net/2/grant-types/authorization-code/) with [PKCE](https://oauth.net/2/pkce/):
​
```js
import { ISettings, PkceAuth } from "@cognite/auth-wrapper";
import { CogniteClient } from "@cognite/sdk";
​
const settings: ISettings = {
    authority: 'your_authority',
    client_id: 'your_client_id',
    client_secret: 'your_client_secret',
    scope: 'your_scope'
};
​
// Retrieving access_token.
const tokenResponse: AuthResponse = await PkceAuth.load(
   settings
).login();
​
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  getToken: () => Promise.resolve(await PkceAuth.load(settings)
    .login(tokenResponse?.refresh_token)),
});
​
```
​
You can find a full sample application [here]()
​
## OpenID Connect (OIDC) w `credentials`
​
### OIDC authentication using `credentials` w Client Credentials Flow
​
The example below shows how to use only an SDK to get a token from Azure Active Directory on behalf of a user using the [Client credentials flow](https://oauth.net/2/grant-types/client-credentials/):
​
```js
import { CogniteClient } from "@cognite/sdk";
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  credentials: {
  	method: 'client_credentials',
    authority: 'your_authority',
    client_id: 'your_client_id',
    grant_type: 'your_grant_type',
    client_secret: 'your_client_secret',
    scope: 'your_scope'
});
​
```
​
You can find a full sample application [here]()
​
### OIDC authentication using `credentials` w Device Code Flow
​
The example below shows how to use only an SDK to get a token from Azure Active Directory on behalf of a user using the [Device code flow](https://oauth.net/2/grant-types/device-code/):
​
```js
import { CogniteClient } from "@cognite/sdk";
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  credentials: {
  	method: 'device',
    authority: 'your_authority',
    client_id: 'your_client_id',
    client_secret: 'your_client_secret',
    scope: 'your_scope'
});
​
```
​
You can find a full sample application [here]()
​
### OIDC authentication using `credentials` w PKCE Flow
​
The example below shows how to use only an SDK to get a token from Azure Active Directory on behalf of a user using the [PKCE flow](https://oauth.net/2/pkce/):
​
```js
import { CogniteClient } from "@cognite/sdk";
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  credentials: {
  	method: 'pkce',
    authority: 'your_authority',
    client_id: 'your_client_id',
    client_id: 'your_client_id',
    client_secret: 'your_client_secret',
    scope: 'your_scope'
});
​
```
​
You can find a full sample application [here]()
​
## API keys
​
### getToken metod
​
API keys use the same API in the SDK, using `getToken` you will need to set the additional flag `apiKeyMode` to
true to handle headers appropriately.
​
```js
const client = new CogniteClient({
  appId: 'api-key-app',
  project: 'demo-project',
  apiKeyMode: true,
  getToken: () => Promise.resolve('API_KEY_HERE'),
});
```
​
> NOTE: This method will be deprecated soon.
​
### credentials metod
​
API keys use the same API in the SDK, using `credentials` you will need to set the following object to handle headers appropriately.
​
```js
const client = new CogniteClient({
  appId: 'api-key-app',
  project: 'demo-project',
  credentials: {
  	method: 'api',
    apiKey: 'API_KEY_HERE'
  },
});
```
​
## Manually trigger authentication
​
Instead of waiting for the first `401` response, you can trigger the authentication flow manually like this:
​
```js
​
const client = new CogniteClient({ ... });
await client.authenticate(); // this also returns the token received
```
​
## More
​
To read more about the authentication, see [authentication process](https://doc.cognitedata.com/dev/guides/iam/external-application.html#tokens).

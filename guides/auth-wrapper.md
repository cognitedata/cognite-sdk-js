# Authentication
​
- [Use access tokens instead of API keys](#use-access-tokens-instead-of-api-keys)
- [Accessing different clusters](#accessing-different-clusters)
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
We **strongly recommend** that you don't use API keys in web applications since the API key is easily readable by everyone with access to the application. Another restriction is that all users of your app share the same API key. All users will have the same access level, you lose tracing/auditing per user, keys are not time-limited, etc.
​
Instead of API keys, use **access tokens**. These are short-lived tokens that grant the user access to CDF. The application gets an access token by asking the user (or client credential) to sign in to a CDF project's identity provider (Google, Active Directory, etc.).
​
The access token expires after a time, and as a result, the user will get `401` from CDF again, and the SDK triggers a new authentication process.
​
## Accessing different clusters
​
Cognite operates multiple clusters. The default cluster `api.cognitedata.com` will be
used unless you override it. To access projects on a different cluster, use the [baseUrl](https://cognitedata.github.io/cognite-sdk-js/interfaces/clientoptions.html#baseurl) parameter in the SDK constructor.
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
Actually we have two ways to authenticate.
​
1. Usign `getToken` method as parameter on CogniteClient that will be a calback to the SDK and uses it to get and renew tokens as needed. Can be used to authenticate with api keys directly or with OIDC making use of some IdP's like azure Active Directory, Auth0, etc. use the appropriate library [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper). 
​
> **_NOTE:_**  the SDK comes with an implementation of the Cognite legacy
authentication flow, **but it does not come with an implementation for all IDPs** and this method will be deprecated soon.
​
2. The sdk does use [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) internally to manage the authentication life cycle since the beginning until the token refresh, for this you need to use `credentials` field as parameter.
​
## OpenID Connect (OIDC) w `getToken`
​
### OIDC authentication using getToken w Client Credentials Flow
​
This example shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active directory on behalf of a user using the [client credentials flow](https://oauth.net/2/grant-types/client-credentials/):
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
This example shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active directory on behalf of a user using the [device code flow](https://oauth.net/2/grant-types/device-code/):
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
This example shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active directory on behalf of a user using the [device code flow](https://oauth.net/2/grant-types/device-code/):
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
This example shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active directory on behalf of a user using the [implicit
flow](https://oauth.net/2/grant-types/implicit/):
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
This example shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active directory on behalf of a user using the [authorization code
flow](https://oauth.net/2/grant-types/authorization-code/) with [pkce](https://oauth.net/2/pkce/):
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
This example shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active directory on behalf of a user using the [authorization code
flow](https://oauth.net/2/grant-types/authorization-code/) with [pkce](https://oauth.net/2/pkce/):
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
This example shows how to use only SDK to get a token from Azure Active directory on behalf of a user using the [client credentials flow](https://oauth.net/2/grant-types/client-credentials/):
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
This example shows how to use only SDK to get a token from Azure Active directory on behalf of a user using the [device code flow](https://oauth.net/2/grant-types/device-code/):
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
This example shows how to use only SDK to get a token from Azure Active directory on behalf of a user using the [pkce flow](https://oauth.net/2/pkce/):
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
> **_NOTE:_**  This method will be deprecated soon.
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
Read more about the [authentication process](https://doc.cognitedata.com/dev/guides/iam/external-application.html#tokens).

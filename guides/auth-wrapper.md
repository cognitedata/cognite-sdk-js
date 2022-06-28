---
pagination_next: null
pagination_prev: null
title: Auth-wrapper
---
<!-- Add intro and description here: 1. What is an auth wrapper 2. Purpose of an auth wrapper -->

# Authentication

- [Get started with Auth wrapper](#get-started-with-auth-wrapper​)
- [Use access tokens instead of API keys](#use-access-tokens-instead-of-api-keys)
- [Access different clusters](#access-different-clusters)
- [How to authenticate with the SDK?](#how-to-authenticate-with-the-sdk)
- [OpenID Connect (OIDC) with getToken](#openid-connect-oidc-with-gettoken)
  - [Client credentials flow](#oidc-using-gettoken-with-client-credentials-flow)
  - [Device code flow](#oidc-using-gettoken-with-device-code-flow)
  - [Device code flow with refresh token](#oidc-using-gettoken-with-device-code-flow-with-refresh-token)
  - [Implicit flow](#oidc-using-gettoken-with-implicit-flow)
  - [PKCE flow](#oidc-using-gettoken-with-pkce-flow)
  - [PKCE flow with refresh token](#oidc-using-gettoken-with-pkce-flow-with-refresh-token)
- [OpenID Connect (OIDC) with credentials](#openid-connect-oidc-with-credentials)
  - [Client credentials flow](#oidc-using-credentials-with-client-credentials-flow)
  - [Device code flow](#oidc-using-credentials-with-device-code-flow)
  - [PKCE flow](#oidc-using-credentials-with-pkce-flow)
- [API keys](#api-keys)
  - [getToken method](#gettoken-method)
  - [credentials method](#credentials-method)
- [Manually trigger authentication](#manually-trigger-authentication)


## Get started with Auth wrapper​

The instance of the auth wrapper is passed to the Cognite SDK. Open a terminal of your choice to install the dependencies to get started.

### Install Auth wrapper dependencies

1. Install the Cognite Auth wrapper package:

```bash
npm install @cognite/auth-wrapper
```

2. Install the Cognite SDK:

```bash
npm install @cognite/sdk
```

:::info Prerequisites
1. You need to have a basic knowledge of NPM, Typescript and Vanilla JS.
2. Install the developer dependencies:
  - @types/node
  - typescript
:::

### Build and Run auth wrapper

1. Create a file `quickstart.ts` in the editor of your choice and enter the below code:

```js
import { CogniteAuthWrapper } from "@cognite/auth-wrapper";
import { CogniteClient } from "@cognite/sdk";

class MyProjectTest {
    protected client: CogniteClient;

    constructor() {
        this.client = new CogniteClient({
            appId: 'testing-app',
            project: 'your_cdf_project',
            baseUrl: 'your_baseurl',
            authentication: {
                provider: CogniteAuthWrapper,
                credentials: {
                    method: 'your_method',
                    authority: 'your_authority',
                    client_id: 'your_client_id',
                    client_secret: 'your_client_secret',
                    grant_type: 'your_grant_type',
                    scope: 'your_scope'
                }
            }
        });
    }

    async run () {
        console.log(await this.client.assets.list())
    }
}

export default new MyProjectTest().run();
```

2. Enter the values for `appId`, `project`, and `baseUrl` as per your CDF project.

3. Replace the credentials with values for , `method`, `authority`, `client_id`, `client_secret`, `grant_type`, and `scope` inside the CogniteClient.

4. Inside the `aysnc` function, let's log the assets list as output to ensure that the assets are getting logged to the console.

5. Build and run the code.

```bash
  npm run build
```
Once the build is successful, enter the command:

```bash
  npm run start
```

You will be able to view the list of assests in the console.

## Use access tokens instead of API keys
​
Instead of API keys, we strongly recommend you use **access tokens**. These are short-lived tokens that grant the user access to CDF. The application gets an access token by requesting the user (or client credential) to sign in to a CDF project's identity provider (Google, Azure Active Directory, etc.).

The access token expires after a time, and as a result, the user will get `401` from CDF, and the SDK triggers a new authentication process.

We do not recommend the use of API keys in web applications since the API keys are easily readable by everyone with access to the application. Another restriction is that all the app users share the same API key. All users will have the same access level, and you lose tracing/auditing per user, and keys are not time-limited, etc.

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
1. Using the `getToken` method: You can use the `getToken` method as a parameter on CogniteClient which will act as a callback to the SDK to retrieve and renew tokens whenever required. `getToken` method can be used to authenticate with API keys or OIDC directly by making use of identity providers like Azure Active Directory, Auth0, etc. 
You can use the appropriate library [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper). 
​
> NOTE: The SDK comes with an implementation of the Cognite legacy authentication flow, _but it does not come with an implementation for all IDPs_. This method will be deprecated soon.
​
2. Using the `credentials` field: You can use the `credentials` field as a parameter since the SDK uses [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) internally to manage the authentication life cycle from the beginning until token refresh.
​
## OpenID Connect (OIDC) with `getToken`
​
### OIDC using getToken with Client credentials flow
​
The example below shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure AD on behalf of a user using the [Client credentials flow](https://oauth.net/2/grant-types/client-credentials/):
​
```js
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';
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
  getToken: () => Promise.resolve(await CogniteAuthWrapper.load('client_credentials', settings).login()),
});
​
```
​
You can find a full sample application [here]().
​
### OIDC using getToken with Device code flow
​
The example below shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure AD on behalf of a user using the [Device code flow](https://oauth.net/2/grant-types/device-code/):
​
```js
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';
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
  getToken: () => Promise.resolve(await CogniteAuthWrapper.load('device', settings).login()),
});
​
```
​
You can find a full sample application [here]().
​
### OIDC using getToken with Device code flow with refresh token
​
The example below shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active Directory on behalf of a user using the [Device code flow](https://oauth.net/2/grant-types/device-code/):
​
```js
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';
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
const tokenResponse = await CogniteAuthWrapper.load('device', settings).login();
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  getToken: () => Promise.resolve(await CogniteAuthWrapper.load(
    'device',
    settings
  ).login(tokenResponse?.refresh_token)),
});
​
```
​
You can find a full sample application [here]().
​
### OIDC using getToken with Implicit flow
​
The example below shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure AD on behalf of a user using the [Implicit flow](https://oauth.net/2/grant-types/implicit/):
​
```js
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';
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
  getToken: () => Promise.resolve(await CogniteAuthWrapper.load('implicit', settings).login()),
});
​
```
​
You can find a full sample application [here]().
​
### OIDC using getToken with PKCE flow
​
The example below shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure AD on behalf of a user using the [Authorization code flow](https://oauth.net/2/grant-types/authorization-code/) with [PKCE](https://oauth.net/2/pkce/):
​
```js
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';
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
  getToken: () => Promise.resolve(await CogniteAuthWrapper.load('pkce', settings).login()),
});
​
```
​
You can find a full sample application [here]().
​
### OIDC using getToken with PKCE flow with refresh token
​
The example below shows how to use the Cognite [@cognite/auth-wrapper](https://www.npmjs.com/package/@cognite/auth-wrapper) library to get a token from Azure Active Directory on behalf of a user using the [Authorization code flow](https://oauth.net/2/grant-types/authorization-code/) with [PKCE](https://oauth.net/2/pkce/):
​
```js
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';
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
const tokenResponse: AuthResponse = await CogniteAuthWrapper.load(
  'pkce',
  settings
).login();
​
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  getToken: () => Promise.resolve(await CogniteAuthWrapper.load('pkce', settings)
    .login(tokenResponse?.refresh_token)),
});
​
```
​
You can find a full sample application [here]().
​
## OpenID Connect (OIDC) with `credentials`
​
### OIDC using credentials with Client credentials flow
​
The example below shows how to use only an SDK to get a token from Azure AD on behalf of a user using the [Client credentials flow](https://oauth.net/2/grant-types/client-credentials/):
​
```js
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';
import { CogniteClient } from "@cognite/sdk";
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  authentication: {
    provider: CogniteAuthWrapper,
    credentials: {
      method: 'client_credentials',
      authority: 'your_authority',
      client_id: 'your_client_id',
      grant_type: 'your_grant_type',
      client_secret: 'your_client_secret',
      scope: 'your_scope'
    }
  }
});
​
```
​
You can find a full sample application [here]().
​
### OIDC using credentials with Device code flow
​
The example below shows how to use only an SDK to get a token from Azure AD on behalf of a user using the [Device code flow](https://oauth.net/2/grant-types/device-code/):
​
```js
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';
import { CogniteClient } from "@cognite/sdk";
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  authentication: {
    provider: CogniteAuthWrapper,
    credentials: {
      method: 'device',
      authority: 'your_authority',
      client_id: 'your_client_id',
      client_secret: 'your_client_secret',
      scope: 'your_scope'
    }
  }
});
​
```
​
You can find a full sample application [here]().
​
### OIDC using credentials with PKCE flow
​
The example below shows how to use only an SDK to get a token from Azure Active Directory on behalf of a user using the [PKCE flow](https://oauth.net/2/pkce/):
​
```js
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';
import { CogniteClient } from "@cognite/sdk";
​
const client = new CogniteClient({
  project: "my-project",
  appId: "demo-sample",
  authentication: {
    provider: CogniteAuthWrapper,
    credentials: {
      method: 'pkce',
      authority: 'your_authority',
      client_id: 'your_client_id',
      client_id: 'your_client_id',
      client_secret: 'your_client_secret',
      scope: 'your_scope'
    }
  }
});
​
```
​
You can find a full sample application [here]().
​
## API keys
​
### getToken method
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
### credentials method
​
API keys use the same API in the SDK, using `credentials` you will need to set the following object to handle headers appropriately.
​
```js
const client = new CogniteClient({
  appId: 'api-key-app',
  project: 'demo-project',
  authentication: {
    credentials: {
      method: 'api',
      apiKey: 'API_KEY_HERE'
    }
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

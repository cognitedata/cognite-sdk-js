# OIDC authentication sample w typescript

Node.JS w typescript sample set up to use Cognite (OIDC) authentication.

## Getting Started

This kind of authentication will log you with the OIDC method.

## Prerequisite

Make sure you have read the [prerequisite-guide](../../README.md#prerequisite) before continuing.

## Install

Go to this folder in your terminal and run:

`npm install`

or with yarn:

`yarn`

## Run

`AZURE_TENANT_ID=... COGNITE_PROJECT=... CLIENT_ID=... CLIENT_SECRET=... node build/quickstart.ts`

## How to get logged by yourself?

1. Add the Cognite SDK and @azure/msal-node to your project with yarn or npm.

```sh
yarn add @cognite/sdk@6.1.1
yarn add @azure/msal-node
```

```sh
npm install @cognite/sdk@6.1.1
npm install @azure/msal-node
```

2. Create a new file called `quickstart.ts` and import all necessary things.

```sh
import { CogniteClient } from '@cognite/sdk';
import { ConfidentialClientApplication } from '@azure/msal-node';
```

3. Instantiate four consts with your project name, clientID, clientSecret and your tenantID.

```sh
const project: string = process.env.COGNITE_PROJECT!;
const clientId: string = process.env.CLIENT_ID!;
const clientSecret: string = process.env.CLIENT_SECRET!;
const azureTenant = process.env.AZURE_TENANT_ID!;
```

4. Create a function called `quickstart` with the following code:

```ts
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
      baseUrl: 'https://api.cognitedata.com',
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
```

5. Call the `quickstart` function.

```ts
quickstart()
  .then(() => { process.exit(0); })
  .catch((err) => { console.error(err); process.exit(1); });
```

6. Build your project.

`npm run tsc`

or with yarn

`yarn tsc`

7. Finally, run your code with:

```sh
AZURE_TENANT_ID=... COGNITE_PROJECT=... CLIENT_ID=... CLIENT_SECRET=... node build/quickstart.js
```

# OIDC authentication SPA sample using Azure Active Directory and msal.js

React app created with create-react-app and set up to use msal.js to authenticate the app with Azure Active directory. Some environment variables have to be set before starting the app:

```
$ REACT_APP_CDF_PROJECT=... REACT_APP_AZURE_TENANT_ID=... REACT_APP_AZURE_APP_ID=... yarn start
```

## Getting Started

This kind of authentication will redirect you to the login page to enter your credentials and after you be redirected back to the configured page.

## Prerequisite

Make sure you have read the [prerequisite-guide](../../README.md#prerequisite) before continuing.

## Install

Go to this folder in your terminal and run:

`npm install`

or with yarn:

`yarn`

## Run

`REACT_APP_CDF_PROJECT=... REACT_APP_AZURE_TENANT_ID=... REACT_APP_AZURE_APP_ID=... yarn start`

## How to get logged by yourself?

1. First of all create a new project. Replace "your_project_name" to your project name.

```sh
npx create-react-app your_project_name --template=typescript
```

2. Add the Cognite SDK to your project with yarn or npm.

```sh
yarn add @cognite/sdk@6.1.1
```

```sh
npm install @cognite/sdk@6.1.1
```

3. Make an archive inside the src folder called `auth.ts` and import all things that you'll need to use.

```ts
import { Configuration, PublicClientApplication } from "@azure/msal-browser";
```

4. You need to have a clientId, tenantId, cluster, baseUrl and the scopes.

```ts
const clientId = process.env.REACT_APP_AZURE_APP_ID!;
const tenantId = process.env.REACT_APP_AZURE_TENANT_ID!;
const cluster = process.env.REACT_APP_CLUSTER || "api";
export const baseUrl = `https://${cluster}.cognitedata.com`;
export const scopes = [
  `${baseUrl}/DATA.VIEW`,
  `${baseUrl}/DATA.CHANGE`,
  `${baseUrl}/IDENTITY`,
];
```

5. Start the msal configuration and verification.

```ts
const configuration: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
  },
};

if (!clientId || !tenantId) {
  throw new Error(
    "specify REACT_APP_AZURE_APP_ID and REACT_APP_AZURE_TENANT_ID in your environment"
  );
}
```

6. Instanciate a new `PublicClientApplication` class with the configurations.
```ts
export const pca = new PublicClientApplication(configuration);
```

7. Create a method that retrieve the access_token.

```ts
export const getToken = async () => {
	// Verify if account are setted.
    const accountId = sessionStorage.getItem("account");

    if (!accountId) throw new Error("no user_id found");

	// Get account by ID.
    const account = pca.getAccountByLocalId(accountId);

    if (!account) throw new Error("no user found");

	// Get token information.
    const token = await pca.acquireTokenSilent({
      account,
      scopes,
    });

    return token.accessToken;
};
```

8. Inside your `App.tsx` file Import some methods/components from msal library and React.

```ts
import React from "react";
import {
  MsalProvider,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
```

9. Use the method `useMsal` to deconstruct `instance` in a const.

```ts
function App() {
    ...
    ...

    const { instance } = useMsal();

    return (
        ...
        ...
    )
}
```

10. Now you are able to use the `MsalProvider` around all your code with `AuthenticatedTemplate`, `UnauthenticatedTemplate` and the new `PublicClientApplication` that you already have instanciated all of this inside your default function.

```ts
function App() {
    ...
    ...

    return (
        <MsalProvider instance={pca}>
            <AuthenticatedTemplate>
            ...
            </AuthenticatedTemplate>
            
            <UnauthenticatedTemplate>
            ...
            </UnauthenticatedTemplate>
        </MsalProvider>
    );
}
```

11. Some methods that you can use.

```ts
// For logout
instance.logoutPopup();

// For login
instance
	.loginPopup({
    	prompt: "select_account",
        scopes,
    })
    .then((r) => {
    	if (r.account?.localAccountId) {
        	sessionStorage.setItem("account", r.account?.localAccountId);
        }
});
```

12. Now, you can run your code.

```sh
sudo PORT=80 yarn start
```

# Legacy authentication SPA sample using popups

React app created with `create-react-app` and set up to use Cognite (legacy) authentication with pop ups.
redirects.

## Getting Started

This kind of authentication will open a popupwith the login page to enter your credentials and after you be redirected to the configured page.

## Prerequisite

Make sure you have read the [prerequisite-guide](../../README.md#prerequisite) before continuing.

## Install

Go to this folder in your terminal and run:

`npm install`

or with yarn:

`yarn`

## Run

`yarn start`

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

3. Import all things that you'll need to use.

```ts
import React, { useState, useEffect } from "react";
import {
  CogniteClient,
  POPUP,
  CogniteAuthentication,
  loginPopupHandler,
  isLoginPopupWindow,
} from "@cognite/sdk";
```

4. You need to put the project name and a base url instancing the `CogniteAuthentication` class. Replace “cdf_project_name” to your CDF Project Name.

```ts
const project = 'cdf_project_name';
const baseUrl = "https://greenfield.cognitedata.com";

const legacyInstance = new CogniteAuthentication({
  project,
  baseUrl
});
```

5. Verify if you've the popup window opened an retrieve informations like the token.

```ts
if (isLoginPopupWindow()) {
  loginPopupHandler();
}
```

6. Create a method that redirect you to the login page and retrieve the access_token.

```ts
const getToken = async () => {
    if (!legacyInstance) throw new Error("SDK instance missing");

    await legacyInstance.handleLoginRedirect();
    
    // Retrieving access_token.
    let token = await legacyInstance.getCDFToken();

    // Return token if you already is logged.
    if (token) return token.accessToken;

	// Here you'll be redirected after login setting onAuthenticat with POPUP.
    token = await legacyInstance.login({ onAuthenticate: POPUP });
    
    // Returning token.
    if (token) return token.accessToken;

    throw new Error("error");
};
```

7. Inside the default function of your file instanciate a new class of `CogniteClient` inside a state and a helper to save if you're logged or not.

```ts
function App() {
    const [loggedIn, setLoggedin] = useState(false);
    const [sdk] = useState(
        new CogniteClient({
            appId: "your-app-id",
            project,
            baseUrl,
            getToken,
        })
    );

    // Verify if you're logged, if not call `authenticate` function of the `CogniteClient` that you already have instaciated.
    useEffect(() => {
        loggedIn && sdk.authenticate()
    }, [loggedIn]);

    return (
        ...
    );
}
```

8. Now if you have configured correctly you are able to get logged and retrieve all informations that you need like assets.

```ts
function App() {
    ...
    ...

    const assets = sdk.assets.list();

    return (
        ...
    );
}
```

9. Now, you can run your code.

```sh
sudo PORT=80 yarn start
```

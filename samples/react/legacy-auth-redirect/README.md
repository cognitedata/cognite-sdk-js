# Legacy authentication SPA sample with redirect

React app created with `create-react-app` and set up to use Cognite (legacy) authentication with
redirects.

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
import React, { useState, useEffect } from ‘react’;
import {
  CogniteClient,
  POPUP,
  CogniteAuthentication,
  loginPopupHandler,
  isLoginPopupWindow,
} from "@cognite/sdk";
```

4. You need to put the project name instancing the `CogniteAuthentication` class. Replace “cdf_project_name” to your CDF Project Name.

```ts
const project = 'cdf_project_name';

const legacyInstance = new CogniteAuthentication({
  project,
});
```

5. Create a method that redirect you to the login page and retrieve the access_token.

```ts
const getToken = async () => {
	await legacyInstance.handleLoginRedirect();
    
    // Retrieving access_token.
  	let token = await legacyInstance.getCDFToken();
  	
    // Return token if you already is logged.
    if (token) return token.accessToken;
    
    // Here you'll be redirected after login setting onAuthenticat with REDIRECT.
  	token = await legacyInstance.login({ onAuthenticate: REDIRECT });
  	
    // Returning token.
    if (token) return token.accessToken; 
  
  	throw new Error("error");
};
```

6. Inside the default function of your file instanciate a new class of `CogniteClient` inside a state.

```ts
function App() {
    const [sdk] = useState(
        new CogniteClient({
            appId: "your-app-id",
            project: projectName,
            getToken,
        })
    );

    return (
        ...
    );
}
```

7. Now if you have configured correctly you are able to get logged and retrieve all informations that you need like assets.

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

# react-auth-wrapper

This example was built using a react auth-wrapper which can be found [here](https://npm.im/@cognite/react-auth-wrapper).

The next sections will cover exactly what was done in the current example. It will also be based in authentication using Azure AD, which is the cognite's standard, tough you can you any OIDC based identity provider.

## Installation

Before moving on, you'll need to install the react auth-wrapper as the examble bellow:

Using [npm](https://npmjs.org/)

```bash
npm install @cognite/react-auth-wrapper --save
```

## Getting Started

Configure the library by wrapping your application in `ReactCogniteAuthProvider`:

```jsx
// src/index.jsx
import React from "react";
import ReactDOM from "react-dom";
import { ReactCogniteAuthProvider } from "@cognite/react-auth-wrapper";
import App from "./App";

const oidcConfig = {
  authority: "<your authority>",
  client_id: "<your client id>",
  redirect_uri: "<your redirect uri",
  scope: "<your token scopes>",
  /*
    we are using metadata because the default token and authorization endpoints in azure ad
    contains '/oauth2/v2.0/' wich differs from default '/oauth2/token'
   */
  metadata: {
      'token_endpoint': "https://login.microsoftonline.com/<your tenant>/oauth2/v2.0/token",
      'authorization_endpoint': "https://login.microsoftonline.com/<your tenant/oauth2/v2.0/authorize",
  }
};

ReactDOM.render(
  <ReactCogniteAuthProvider {...oidcConfig}>
    <App />
  </ReactCogniteAuthProvider>,
  document.getElementById("app")
);
```

Use the `useAuth` hook in your components to access authentication state
(`isLoading`, `isAuthenticated` and `user`) and authentication methods
(`signinRedirect`, `removeUser` and `signOutRedirect`).

In the example bellow, note that we are redirecting to ListAssets page where
we're going to connect to CDF and render some Assets.

```jsx
// src/App.jsx
import React from "react";
import { useCogAuth } from "@cognite/react-auth-wrapper";
import ListAssets from './ListAssets';

function App() {
  const auth = useCogAuth();

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
       <ListAssets/>
      </div>
    );
  }

  return <button onClick={() => void auth.signinPopup()}>Log in</button>;
}

export default App;
```

You **must** provide an implementation of `onSigninCallback` to `oidcConfig` to remove the payload from the URL upon successful login. Otherwise if you refresh the page and the payload is still there, `signinSilent` - which handles renewing your token - won't work.

### Making a call using CogniteClient

As a child of `CogniteAuthProvider` with a user containing an access token, we can create
an instance of CogniteClient passing the credentials and make a call to CDF API:

```jsx
import { Asset, CogniteClient } from '@cognite/sdk';
import React, { useState } from 'react';
import { useCogAuth } from '@cognite/react-auth-wrapper';
import { ReactAuthWrapperProvider, CogniteProjectService } from '@cognite/react-auth-wrapper';

const { REACT_APP_COGNITE_BASE_URL } = process.env;

function ListAssets() {
  const authContext: any = useCogAuth();

  const [assets, setAssets] = useState<Asset[]>([]);

  React.useEffect(() => {
    const cogniteProjectService = new CogniteProjectService();

    (async () => {
      try {
        /*
          we are using CogniteProjectService (from react-auth-wrapper package)
          to extract the projects the user can access using it's credentials
        */
        const projects = await cogniteProjectService.loadFromAuthContext(authContext);

        const cogniteClient = new CogniteClient({
          appId: "Authwrapper SDK samples",
          project: projects[0].projectUrlName,
          baseUrl: <your cognite base url>,
          authentication: {
            provider: ReactAuthWrapperProvider,
            credentials: {
              method: 'pkce',
              authContext: authContext,
            }
          }
        });

        const response = await cogniteClient.assets.list();
        setAssets(response.items);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [authContext]);

  if (!assets) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="App">
        {assets.map((asset, index) => {
          return <li key={index}>Assets here {asset.name}</li>;
        })}
      </div>
    </>
  );
}

export default ListAssets;
```

### More...

For more information about the use of react-auth-wrapper, please refer to [react-auth-wrapper] npm package (https://npm.im/@cognite/react-auth-wrapper)

import { useState, useEffect, useMemo } from 'react';
import { CogniteClient } from '@cognite/sdk';

const AAD_CONFIG = {
  clientId: "AAD-APP-ID",
  openIdConfigurationUrl: 'https://login.microsoftonline.com/AZURE-TENANT_ID/v2.0/.well-known/openid-configuration',
  responseMode: 'fragment',
  extraScope: 'openid profile offline_access https://CDF-CLUSTER.cognitedata.com/user_impersonation https://CDF-CLUSTER.cognitedata.com/IDENTITY',
  loginParams: {
    prompt: 'select_account'
  },
  cluster: 'CDF-CLUSTER',
}

const audience = {
  audience: "CUSTOM-AUDIENCE",
};
const AUTH0_CONFIG = {
  openIdConfigurationUrl: "https://AUTH0-CUSTOM-DOMAIN/.well-known/openid-configuration",
  cluster: 'CDF-CLUSTER',
  clientId: "AUTH_0-APP-ID",
  responseMode: "query",
  extraScope: 'openid profile offline_access',
  authenticateParams: audience,
  refreshParams: audience,
  loginParams: {
    prompt: "login",
  },
};

function App() {
  const [token, setToken] = useState();
  const [inspect, setInspect] = useState();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState(undefined);


  const client = useMemo(() => new CogniteClient({ appId: 'sample-app-id' }), []);

  useEffect(() => {
    client.loginWithOAuth({
      type: 'OIDC_AUTHORIZATION_CODE_FLOW',
      options: {
        ...AAD_CONFIG,
        onNoProjectAvailable: () => console.log('Unfortunately, your token has no access to any project in the selected cluster')
      }
    }).then(signedIn => setIsSignedIn(signedIn))
      .catch(e => setError(e.message))
  }, [client]);

  const login = async () => {
    try {
      const loggedin = await client.authenticate();
      setIsSignedIn(loggedin);
    } catch (e) {
      console.log('login error', e);
    }
  }

  useEffect(async () => {
    if (isSignedIn) {
      const token = await client.getCDFToken();
      const inspect = await client.get('/api/v1/token/inspect');

      setToken(token);
      setInspect(inspect);
    }
  }, [client, isSignedIn]);


  return (
    <div>
      <button onClick={() => login()}><h1>Authenticate</h1></button>
      <h3>signed in</h3>
      { JSON.stringify(isSignedIn) }

    { error && (
        <>
        <h3>error</h3>
        <pre>{error}</pre>
        </>
    )}

        <h3>/api/v1/token/inspect</h3>
        <pre>
        {JSON.stringify(inspect, null, 2)}
        </pre>


        <h3>token</h3>
        <pre>
        {JSON.stringify(token, null, 2)}
        </pre>

    </div>
  );
}

export default App;

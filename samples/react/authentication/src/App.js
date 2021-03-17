import React, { useEffect, useState } from 'react';
import { CogniteClient } from '@cognite/sdk';

const project = 'publicdata';
const client = new CogniteClient({ appId: 'Cognite SDK samples' });

const renderAssetsInTable = (assets) => {
  return (
    <table>
      <tbody>
      <tr>
        <th>Name</th>
        <th>Description</th>
      </tr>
      {assets.map(asset => (
        <tr key={asset.id}>
          <td>{asset.name}</td>
          <td>{asset.description}</td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}

const App = () => {
  const [isInit, setIsInit] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [assets, setAssets] = useState(false);

  const fetchRootAssets = async () => {
    const assets = await client.assets
      .list()
      .autoPagingToArray({ limit: 10 });

    setAssets(assets);
  }

  const init = async () => {
    const result = await client.loginWithOAuth({
      project,
      onAuthenticate: 'REDIRECT',
    });

    setIsInit(true);
    setIsSignedIn(result);
  }

  const authenticate = async () => {
    const result = await client.authenticate();

    setIsSignedIn(result);
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="App">
      <button disabled={!isInit || isSignedIn} onClick={authenticate}><h1>Authenticate</h1></button>
      <button disabled={!isInit || !isSignedIn} onClick={fetchRootAssets}><h1>Click here to fetch assets from Cognite</h1></button>
      {assets && renderAssetsInTable(assets)}
    </div>
  );
}

export default App;

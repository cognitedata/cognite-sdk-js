import { useState, useEffect } from 'react';
import { CogniteClient } from '@cognite/sdk';

const project = process.env.REACT_APP_PROJECT;
const cluster = process.env.REACT_APP_CLUSTER;
const clientId = process.env.REACT_APP_CLIENT_ID;
const tenantId = process.env.REACT_APP_TENANT_ID;

function App() {
  const [client, setClient] = useState(null);
  const [assets, setAssets] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchRootAssets = async () => {
    if (client === null) return;
    // fetch the first 10 (maximum) assets
    const assets = await client.assets
      .list()
      .autoPagingToArray({ limit: 10 });
    setAssets(assets);
  };

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

  const authenticate = async () => {
    if (client === null) return;

    const result = await client.authenticate();

    if (result) {
      client.setProject(project);
      setIsAuthenticated(true);
    }
  }

  const login = async (client) => {
    const result = await client.loginWithOAuth({
      cluster,
      clientId,
      tenantId,
    });

    setClient(client);

    if (result) {
      client.setProject(project);
      setIsAuthenticated(true);
    }
  }

  useEffect(() => {
    const client = new CogniteClient({appId: 'sample-app-id'});

    login(client);
  }, []);

  return (
    <div>
      <button onClick={authenticate}><h1>Click here to authenticate</h1></button>
      <button disabled={!isAuthenticated} onClick={fetchRootAssets}><h1>Click here to fetch assets from Cognite</h1></button>
      {assets && renderAssetsInTable(assets)}
    </div>
  );
}

export default App;

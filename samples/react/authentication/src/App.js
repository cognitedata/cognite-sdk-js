import React, { Component } from 'react';
import { CogniteClient } from '@cognite/sdk';

const project = 'publicdata';

class App extends Component {
  state = {
    client: null,
    assets: null,
    inited: false,
    authenticated: false,
  };

  async componentDidMount() {
    const client = new CogniteClient({ appId: 'Cognite SDK samples' });
    const result = await client.loginWithOAuth({
      project,
      onAuthenticate: 'REDIRECT',
    });
    this.setState({ client, inited: true });
    // Login will be triggered on first API call with "client"
    // You can manually trigger the login flow by calling:
    if (!result) {
      client.authenticate();
    }
  }

  fetchRootAssets = async () => {
    const { client } = this.state;
    if (client === null) return;
    // fetch the first 10 (maximum) assets
    const assets = await client.assets
      .list()
      .autoPagingToArray({ limit: 10 });
    this.setState({ assets });
  };

  renderAssetsInTable = (assets) => {
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

  render() {
    const { assets, authenticated, inited } = this.state;
    return (
      <div className="App">
        <button disabled={!inited || authenticated} onClick={this.authenticate}><h1>Authenticate</h1></button>
        <button disabled={!inited || !authenticated} onClick={this.fetchRootAssets}><h1>Click here to fetch assets from Cognite</h1></button>
        {assets && this.renderAssetsInTable(assets)}
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import * as sdk from '@cognite/sdk';

const project = 'publicdata';

class App extends Component {
  state = {
    client: null,
    assets: null,
  };

  async componentDidMount() {
    const client = sdk.createClientWithOAuth({
      project,
      onAuthenticate: 'REDIRECT',
    });
    this.setState({ client });
    // Login will be triggered on first API call with "client"
    // You can manually trigger the login flow by calling:
    client.authenticate();
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
    const { assets } = this.state;
    return (
      <div className="App">
        <button onClick={this.fetchRootAssets}><h1>Click here to fetch assets from Cognite</h1></button>
        {assets && this.renderAssetsInTable(assets)}
      </div>
    );
  }
}

export default App;

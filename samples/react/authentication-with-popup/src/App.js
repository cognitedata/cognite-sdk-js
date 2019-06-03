import React, { Component } from 'react';
import * as sdk from '@cognite/sdk';

const project = 'publicdata';

class App extends Component {
  state = {
    client: null,
    assets: null,
  };

  async componentDidMount() {
    if (sdk.isLoginPopupWindow()) {
      sdk.loginPopupHandler();
      return;
    }

    const client = sdk.createClientWithOAuth({
      project,
      onAuthenticate: (login) => {
        login.popup({
          redirectUrl: window.location.href,
        });
        // for popups you should design your application so the `login.popup`-call is based on a user interaction
        // to avoid the browser blocking the popup window. See https://stackoverflow.com/a/2587692/4462088
        // You can call `login.popup` whenever you want. The SDK will pause all requests until you have called it.
        // So it is possible to create a user-interface with a "Click here to login"-button that triggers `login.popup`.
      },
    });

    this.setState({ client });
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

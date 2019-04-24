import React from 'react';
import * as sdk from '@cognite/sdk';

class App extends React.Component {
  state = {
    assets: [],
  };
  async componentDidMount() {
    // if the application opens up in the popup window we need to call sdk.Login.popupHandler
    if (sdk.Login.isPopupWindow()) {
      sdk.Login.popupHandler();
      return;
    }
    await sdk.Login.authorize({
      popup: true, // this triggers login by popup window
      project: 'publicdata',
      redirectUrl: window.location.href,
      errorRedirectUrl: window.location.href,
    });

    // example call
    const assets = await sdk.Assets.list();
    this.setState({ assets: assets.items });
  }
  render() {
    return (
      <React.Fragment>
        {this.state.assets.map(asset => (
          <div key={asset.id}>{asset.name}</div>
        ))}
      </React.Fragment>
    );
  }
}

export default App;

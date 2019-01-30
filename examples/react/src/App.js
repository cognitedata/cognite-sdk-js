import React from 'react';
import * as sdk from '@cognite/sdk';
import './App.css';

class App extends React.Component {
  state = {
    loggedIn: false,
    assets: [],
  };

  async componentDidMount() {
    try {
      await sdk.Login.authorize(
        {
          project: 'publicdata',
          redirectUrl: window.location,
          errorRedirectUrl: window.location,
        },
        // optional callback function
        // (token) => {
        //   // every time a new authorization (Bearer) token is generated this function will be called.
        // },
      );
      this.setState({ loggedIn: true });
      const assets = await sdk.Assets.search({});
      this.setState({
        assets: assets.items,
      });
    } catch (ex) {
      console.error(ex);
    }
  }
  render() {
    const { loggedIn, assets } = this.state;
    if (!loggedIn) {
      return <h1>Logging in...</h1>;
    }
    return (
      <div className="App">
        <h2>Asset search</h2>
        {assets.map(asset => (
          <p key={asset.id}>
            {asset.id}: {asset.name}
          </p>
        ))}
      </div>
    );
  }
}

export default App;

import React from 'react';
import * as sdk from '@cognite/cognitesdk';
import qs from 'query-string';
import './App.css';

import logo from './logo.svg';

// Allow cookies and set a project
sdk.configure({
  withCredentials: true,
  project: 'publicdata',
});

class App extends React.Component {
  state = {
    loggedIn: false,
    assets: [],
  };

  async componentDidMount() {
    try {
      const { access_token: accessToken, id_token: idToken } = qs.parse(
        window.location.search
      );
      if (!(accessToken && idToken)) {
        // The user is not logged in, get the login url.
        const url = await sdk.Login.retrieveLoginUrl({
          redirectUrl: window.location.origin,
          errorRedirectUrl: `${window.location.origin}/error`,
        });
        // Redirect to the URL
        window.location.href = url;
        return;
      }
      // Now that a token is set, all subsequent requests through the SDK will be passing this token
      sdk.setBearerToken(accessToken);

      this.setState({ loggedIn: true });
      const assets = await sdk.Assets.search({});
      this.setState({
        assets,
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
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
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

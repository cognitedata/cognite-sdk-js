import React from 'react';
import './App.css';
import { CogAuthContextProps, useCogAuth } from '@cognite/react-auth-wrapper';
import ListAssets from './ListAssets';

const cogHome = {
  display : "flex",
  justifyContent : "center",
  alignItems : "center",
  height : "100vh"
}

function Home() {
  const auth: CogAuthContextProps = useCogAuth();

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

  return (
    <>
      <div style={cogHome}>
        <button type="button"  onClick={() => void auth.signinPopup()}>
            Log in
        </button>
      </div>
    </>
  );
}

export default Home;

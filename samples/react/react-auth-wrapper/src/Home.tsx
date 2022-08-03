import React from 'react';
import './App.css';
import { useCogAuth } from '@cognite/react-auth-wrapper';
import Callback from './Callback';

const cogHome = {
  display : "flex",
  justifyContent : "center",
  alignItems : "center",
  height : "100vh"
}

function Home() {
  const auth: any = useCogAuth();

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
       <Callback/>
      </div>
    );
  }

  return (
    <>
      <div style={cogHome}>
        <button type="button"  onClick={() => void auth.signinRedirect()}>
            Log in
        </button>
      </div>
    </>
  );
}

export default Home;

import { useAuth } from 'react-oidc-context';
import './App.css';
import Callback from './Callback';

const cogHome = {
  display : "flex",
  justifyContent : "center",
  alignItems : "center",
  height : "100vh"
}
const cogButton = {

};

function Home() {
  const auth = useAuth();

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

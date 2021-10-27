import React from "react";
import {
  MsalProvider,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { QueryClientProvider, QueryClient } from "react-query";
import Assets from "./AssetView";
import Users from "./Users";
import { pca, scopes } from "./auth";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
    },
  },
});

// Component
const AppProvider = () => (
  <QueryClientProvider client={client}>
    <MsalProvider instance={pca}>
      <App />
    </MsalProvider>
  </QueryClientProvider>
);
export default AppProvider;

function App() {
  const { instance } = useMsal();

  return (
    <>
      <p>Anyone can see this paragraph.</p>

      <AuthenticatedTemplate>
        <button
          onClick={() => {
            sessionStorage.removeItem("account");
            instance.logoutPopup();
            client.clear();
          }}
        >
          Logout
        </button>
        <p>At least one account is signed in!</p>
        <Users />
        <Assets />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <button
          onClick={() => {
            instance
              .loginPopup({
                prompt: "select_account",
                scopes,
              })
              .then((r) => {
                if (r.account?.localAccountId) {
                  sessionStorage.setItem("account", r.account?.localAccountId);
                }
              });
          }}
        >
          Login
        </button>
        <p>No users are signed in!</p>
      </UnauthenticatedTemplate>
    </>
  );
}

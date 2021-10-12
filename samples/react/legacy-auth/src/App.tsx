import React, { useState } from "react";
import { CogniteClient, CogniteAuthentication } from "@cognite/sdk";
import {
  QueryClientProvider,
  QueryClient,
  useQuery,
  useMutation,
} from "react-query";


const project = "vegardok-dev";
const legacyInstance = new CogniteAuthentication({
  project,
});

const getToken = async () => {
  await legacyInstance.handleLoginRedirect();
  let token = await legacyInstance.getCDFToken();
  if (token) {
    return token.accessToken;
  }
  token = await legacyInstance.login({ onAuthenticate: "REDIRECT" });
  if (token) {
    return token.accessToken;
  }
  throw new Error("error");
};


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
    <App />
  </QueryClientProvider>
);
export default AppProvider;

function App() {
  const [sdk] = useState(
    new CogniteClient({
      appId: "masl-demo",
      project,
      getToken,
    })
  );
  const {
    data: assets,
    isFetched,
    error,
    refetch,
  } = useQuery("assets", () => sdk.assets.list());
  const { mutate } = useMutation(
    () => sdk.assets.create([{ name: "new asset" }]),
    {
      onSuccess() {
        refetch();
      },
    }
  );

  if (error) {
    return (
      <>
        <>Error</>
        <>{JSON.stringify(error, null, 2)}</>
      </>
    );
  }
  if (!isFetched) {
    return <>Loading</>;
  }

  return (
    <>
      <>Assets</>
      <button onClick={() => mutate()}>Create asset</button>
      <pre>{JSON.stringify(assets, null, 2)}</pre>
    </>
  );
}

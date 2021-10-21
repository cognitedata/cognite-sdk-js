import React, { useEffect, useState } from "react";
import {
  CogniteClient,
  POPUP,
  CogniteAuthentication,
  loginPopupHandler,
  isLoginPopupWindow,
} from "@cognite/sdk";
import {
  QueryClientProvider,
  QueryClient,
  useQuery,
  useMutation,
} from "react-query";

const project = process.env.REACT_APP_CDF_PROJECT;
const baseUrl = "https://greenfield.cognitedata.com";

const legacyInstance =
  !!project &&
  new CogniteAuthentication({
    project,
    baseUrl
  });

if (isLoginPopupWindow()) {
  loginPopupHandler();
}

const getToken = async () => {
  if (!legacyInstance) {
    throw new Error("SDK instance missing");
  }
  await legacyInstance.handleLoginRedirect();
  let token = await legacyInstance.getCDFToken();
  if (token) {
    return token.accessToken;
  }
  token = await legacyInstance.login({ onAuthenticate: POPUP });
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

const AppProvider = () => {
  if (!process.env.REACT_APP_CDF_PROJECT) {
    return (
      <div>
        <h1>Error</h1>
        <p>
          This sample application expects to be passed a Cognite project from
          the command line. Start the app in the following way:
        </p>
        <pre>REACT_APP_CDF_PROJECT=project yarn start</pre>
      </div>
    );
  }
  return (
    <QueryClientProvider client={client}>
      <h1>Sample app: Cognite legacy authentication using pop ups</h1>
      <App />
    </QueryClientProvider>
  );
};

export default AppProvider;

function App() {
  const [loggedIn, setLoggedin] = useState(false);
  const [sdk] = useState(
    new CogniteClient({
      appId: "masl-demo",
      project: project!,
      baseUrl,
      getToken,
    })
  );
  useEffect(() => {
    loggedIn && sdk.authenticate()
  }, [loggedIn]);

  const {
    data: assets,
    isFetched,
    error,
    refetch,
  } = useQuery("assets", () => sdk.assets.list(), { enabled: loggedIn, refetchInterval: 5000 });

  const { mutate } = useMutation(
    () => sdk.assets.create([{ name: "new asset" }]),
    {
      onSuccess() {
        refetch();
      },
    }
  );

  if (!loggedIn) {
    return <button onClick={() => setLoggedin(true)}>Log in</button>;
  }

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

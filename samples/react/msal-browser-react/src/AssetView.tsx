import React, { useState } from "react";
import { CogniteClient } from "@cognite/sdk";
import { useMsal } from "@azure/msal-react";
import { useQuery, useMutation } from "react-query";
import { getToken } from "./auth";

export const scopes = ["https://api.cognitedata.com/DATA.CHANGE"];

export default function ListAssets() {
  const masl = useMsal();

  const [sdk] = useState(
    new CogniteClient({
      project: "vegardok-oidc-dev",
      appId: "masl-demo",
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
      <h1>Accounts</h1>
      <pre>{JSON.stringify(masl.accounts, null, 2)}</pre>
    </>
  );
}

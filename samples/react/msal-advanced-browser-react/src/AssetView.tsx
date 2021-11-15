import React, { useState } from "react";
import { CogniteClient } from "@cognite/sdk";
import { useMsal } from "@azure/msal-react";
import { useQuery, useMutation } from "react-query";
import { getToken, baseUrl } from "./auth";

export default function ListAssets() {
  const masl = useMsal();

  const [sdk] = useState(
    new CogniteClient({
      project: "vegardok-dev",
      appId: "masl-demo",
      baseUrl: baseUrl.replace("https://", ""),
      getToken,
    })
  );

  const {
    data: assets,
    isFetched,
    error,
    refetch,
  } = useQuery("assets", async () => {
    const assets = await sdk.assets
      .list()
      .catch((e) => console.log("sdk error", e));
    return assets?.items.sort(
      (a, b) => b.createdTime.getTime() - a.createdTime.getTime()
    );
  });

  const { mutate } = useMutation(
    () => sdk.assets.create([{ name: `Asset - ${assets?.length || 0}` }]),
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
    <div>
      <>Assets</>
      <button onClick={() => mutate()}>Create asset</button>
      <pre>{JSON.stringify(assets, null, 2)}</pre>
      <h1>Accounts</h1>
      <pre>{JSON.stringify(masl.accounts, null, 2)}</pre>
    </div>
  );
}

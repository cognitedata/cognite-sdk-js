import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useQuery } from "react-query";

const scopes = ["User.Read.All"];

/**
 * This compoment will try to silently aquire a token for the Microsoft Graph to list all users in
 * the logged in organization. If it is not able to get a token a button is rendered to open a popup
 * askin for permission to list the users. This has to be granted by an Azure Active directory
 * administrator.
 */
export default function Users() {
  const msal = useMsal();

  const [loadedPerm, setLoaded] = useState(false);
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    const accountId = sessionStorage.getItem("account");
    const account = msal.instance.getAccountByLocalId(accountId!)!;
    msal.instance
      .acquireTokenSilent({
        account,
        scopes,
      })
      .then((r) => {
        if (r.accessToken) {
          setToken(r.accessToken);
        }
      })
      .catch((e) => console.error("could not get token", e))
      .finally(() => setLoaded(true));
  }, [msal.instance]);

  const { data: users = [] } = useQuery(
    "users",
    async () => {
      return fetch("https://graph.microsoft.com/v1.0/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((r) => r.json())
        .then((r) => r.value.map((u: any) => u.userPrincipalName) as string[]);
    },
    { enabled: !!token }
  );

  if (!loadedPerm) {
    return null;
  }

  if (!token) {
    return (
      <button
        onClick={() => {
          const accountId = sessionStorage.getItem("account");
          const account = msal.instance.getAccountByLocalId(accountId!)!;

          msal.instance
            .acquireTokenPopup({
              account,
              scopes,
            })
            .then((r) => {
              if (r.accessToken) {
                setToken(r.accessToken);
              }
            });
        }}
      >
        Get permission to fetch userts
      </button>
    );
  }

  return (
    <div>
      <h3>Users</h3>
      <ul>
        {users.map((name) => (
          <li>{name}</li>
        ))}
      </ul>
    </div>
  );
}

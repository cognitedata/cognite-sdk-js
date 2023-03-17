import { Configuration, PublicClientApplication } from "@azure/msal-browser";

const clientId = process.env.REACT_APP_AZURE_APP_ID!;
const tenantId = process.env.REACT_APP_AZURE_TENANT_ID!;
const cluster = process.env.REACT_APP_CLUSTER || "api";
export const baseUrl = `https://${cluster}.cognitedata.com`;
export const scopes = [
  `${baseUrl}/DATA.VIEW`,
  `${baseUrl}/DATA.CHANGE`,
  `${baseUrl}/IDENTITY`,
];

// MSAL configuration
const configuration: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
  },
};

if (!clientId || !tenantId) {
  throw new Error(
    "specify REACT_APP_AZURE_APP_ID and REACT_APP_AZURE_TENANT_ID in your environment"
  );
}

export const pca = new PublicClientApplication(configuration);
export const getToken = async () => {
  const accountId = sessionStorage.getItem("account");
  if (!accountId) {
    throw new Error("no user_id found");
  }
  const account = pca.getAccountByLocalId(accountId);
  if (!account) {
    throw new Error("no user found");
  }
  console.log("active account", account.username);
  const token = await pca.acquireTokenSilent({
    account,
    scopes,
  });
  return token.accessToken;
};

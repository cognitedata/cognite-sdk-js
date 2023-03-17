import { Configuration, PublicClientApplication } from "@azure/msal-browser";

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
    clientId: `${process.env.REACT_APP_AZURE_APP_ID}`,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID}`,
  },
};

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

  const token = await pca.acquireTokenSilent({
    account,
    scopes,
  });
  console.log({ token });
  return token.accessToken;
};

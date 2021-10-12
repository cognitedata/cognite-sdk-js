import { Configuration, PublicClientApplication } from "@azure/msal-browser";

export const scopes = ["https://api.cognitedata.com/DATA.CHANGE"];

// MSAL configuration
const configuration: Configuration = {
  auth: {
    clientId: "AZURE_APP_ID",
    authority:
      "https://login.microsoftonline.com/AZURE_TENANT_ID",
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
  console.log("active account", account.username);
  const token = await pca.acquireTokenSilent({
    account,
    scopes,
  });
  return token.accessToken;
};

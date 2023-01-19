import fetch from 'cross-fetch';
import { URLSearchParams } from 'url';

const headers = new Headers({
  'Content-Type': 'application/x-www-form-urlencoded',
});

export const login = async () => {
  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${process.env.COGNITE_AZURE_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.COGNITE_CLIENT_ID,
          client_secret: process.env.COGNITE_CLIENT_SECRET,
          scope: 'https://greenfield.cognitedata.com/.default',
        }).toString(),
        headers,
      }
    );
    const account = await response.json();
    return account;
  } catch (err) {
    console.error(err);
  }
};

// Copyright 2023 Cognite AS

import { URLSearchParams } from 'node:url';
import fetch from 'cross-fetch';

export const login = async () => {
  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${process.env.COGNITE_AZURE_DOMAIN}/oauth2/v2.0/token`,
      {
        method: 'POST',
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.COGNITE_CLIENT_ID || '',
          client_secret: process.env.COGNITE_CLIENT_SECRET || '',
          scope: `${process.env.COGNITE_BASE_URL}/.default`,
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    const account = await response.json();
    return account;
  } catch (err) {
    console.error(err);
  }
};

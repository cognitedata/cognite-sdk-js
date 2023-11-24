// Copyright 2020 Cognite AS
import CogniteClient from '../cogniteClient';
import { name } from '../../package.json';
import { ConfidentialClientApplication } from '@azure/msal-node';

export const TEST_PROJECT = process.env.COGNITE_PROJECT!;
export const CLIENT_ID = process.env.COGNITE_CLIENT_ID!;
export const CLIENT_SECRET = process.env.COGNITE_CLIENT_SECRET!;
const azureTenant = process.env.COGNITE_AZURE_TENANT_ID!;
const COGNITE_BASE_URL = process.env.COGNITE_BASE_URL!;

export function setupLoggedInClient() {
  if (TEST_PROJECT && CLIENT_ID && CLIENT_SECRET && azureTenant) {
    const pca = new ConfidentialClientApplication({
      auth: {
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        authority: `https://login.microsoftonline.com/${azureTenant}`,
      },
    });
    
    const client = new CogniteClient({
      project: TEST_PROJECT,
      baseUrl: COGNITE_BASE_URL,
      appId: `JS SDK integration tests (${name})`,
      getToken: () =>
        pca
          .acquireTokenByClientCredential({
            scopes: [`${COGNITE_BASE_URL}/.default`],
            skipCache: true,
          })
          .then((response) => response?.accessToken as string),
    });

    return client;
  } else {
    return null;
  }
}

export const itif = (condition: any) => (condition ? it : it.skip);

// Copyright 2020 Cognite AS
import CogniteClient from '../cogniteClient';
import { name } from '../../package.json';
import { ConfidentialClientApplication } from '@azure/msal-node';

export const TEST_PROJECT = process.env.COGNITE_PROJECT_ALERTS_API!;
export const CLIENT_ID = process.env.COGNITE_CLIENT_ID_ALERTS_API!;
export const CLIENT_SECRET = process.env.COGNITE_CLIENT_SECRET_ALERTS_API!;
const azureTenant = process.env.COGNITE_TENANT_ID_ALERTS_API!;

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
      baseUrl: 'https://azure-dev.cognitedata.com',
      appId: `JS SDK integration tests (${name})`,
      getToken: () =>
        pca
          .acquireTokenByClientCredential({
            scopes: ['https://azure-dev.cognitedata.com/.default'],
            skipCache: true,
          })
          .then((response) => response?.accessToken as string),
    });

    return client;
  } else {
    return null;
  }
}

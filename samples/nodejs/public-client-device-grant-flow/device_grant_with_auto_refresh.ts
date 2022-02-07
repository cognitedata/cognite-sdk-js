// Copyright 2020 Cognite AS
import { CogniteClient } from '@cognite/sdk';
import {
  PublicClientApplication,
  AuthenticationResult,
  AccountInfo,
} from '@azure/msal-node';
import open from 'open';
import fs from 'fs';
import path from 'path';
import { cachePlugin, readFromCache } from './cache';

const project: string = process.env.COGNITE_PROJECT!;
const clientId: string = process.env.CLIENT_ID!;
const azureTenant = process.env.AZURE_TENANT_ID!;

if (!project || !clientId || !azureTenant) {
  throw Error(
    'You must set the environment variable AZURE_TENANT_ID, COGNITE_PROJECT and CLIENT_ID'
  );
}

const ACCOUNT_JSON_PATH = path.resolve('./account.json');

let account: AccountInfo | null;

if (fs.existsSync(ACCOUNT_JSON_PATH)) {
  account = JSON.parse(
    fs.readFileSync(ACCOUNT_JSON_PATH, { encoding: 'utf8' })
  );
}

const scopes = [
  'https://greenfield.cognitedata.com/.default',
  'offline_access',
];

const handleResponse = async (
  response: AuthenticationResult | null
): Promise<string> => {
  console.log(response);
  if (response && response.account) {
    fs.writeFileSync(ACCOUNT_JSON_PATH, JSON.stringify(response.account));
  }
  return response ? response.accessToken : 'invalid';
};

async function deviceCodeGrantExample() {
  const pca = new PublicClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${azureTenant}`,
    },
    cache: { cachePlugin },
  });

  // MUST DO!
  readFromCache(pca.getTokenCache());

  const client = new CogniteClient({
    appId: 'Cognite SDK samples',
    project,
    baseUrl: 'https://greenfield.cognitedata.com/',
    getToken: (): Promise<string> =>
      new Promise<AuthenticationResult | null>((resolve, reject) => {
        if (!account) {
          reject();
        } else {
          pca
            .acquireTokenSilent({
              forceRefresh: true, // IMPORTANT: ONLY FOR DEMO PURPOSES!
              account: account!,
              scopes: scopes,
            })
            .then(resolve);
        }
      })
        .catch(() => {
          return pca.acquireTokenByDeviceCode({
            deviceCodeCallback: ({ message, userCode, verificationUri }) => {
              open(verificationUri)
                .then(() => console.log(`Enter ${userCode}`))
                .catch(() => console.log(message));
            },
            scopes,
          });
        })
        .then(handleResponse)
        .catch(e => {
          console.log(e);
          return '';
        }),
  });

  await client.authenticate();

  const info = (await client.get('/api/v1/token/inspect')).data;

  console.log('tokenInfo', JSON.stringify(info, null, 2));

  try {
    const assets = await client.assets.list();
    // read again
    console.log(assets);
  } catch (e) {
    console.log('asset error');
    console.log(e);
  } //
}

deviceCodeGrantExample()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

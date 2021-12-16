// Copyright 2020 Cognite AS
import { CogniteClient } from '@cognite/sdk';
import { PublicClientApplication } from '@azure/msal-node';
import open from 'open';
import fs from 'fs';
import path from 'path';
import {cachePlugin} from './cache';

const project: string = process.env.COGNITE_PROJECT!;
const clientId: string = process.env.CLIENT_ID!;
const azureTenant = process.env.AZURE_TENANT_ID!;

if (!project || !clientId || !azureTenant) {
  throw Error(
    'You must set the environment variable AZURE_TENANT_ID, COGNITE_PROJECT and CLIENT_ID'
  );
}

async function deviceCodeGrantExample() {
  const pca = new PublicClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${azureTenant}`,
    },
    cache: { cachePlugin }
  });


  const client = new CogniteClient({
    appId: 'Cognite SDK samples',
    project,
    baseUrl: "https://greenfield.cognitedata.com/",
    getToken: () =>
      pca
        .acquireTokenByDeviceCode({
          deviceCodeCallback: ({ message, userCode, verificationUri }) => {
            open(verificationUri)
              .then(() => console.log(`Enter ${userCode}`))
              .catch(() => console.log(message));
          },
          scopes: ['https://greenfield.cognitedata.com/.default', 'offline_access'],
        })
        .then((response) => {
          // console.log(response?.accessToken)
          fs.writeFileSync(path.resolve('./account.json'), JSON.stringify(response?.account));
          return response?.accessToken!
        }).catch((e)=>{
          console.log(e);
          return ''
        }),
  });

  await client.authenticate();

  const info = (await client.get('/api/v1/token/inspect')).data;

  console.log('tokenInfo', JSON.stringify(info, null, 2));

  try {
    const assets = await client.assets.list();
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
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

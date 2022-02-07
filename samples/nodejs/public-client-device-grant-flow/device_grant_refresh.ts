// Copyright 2020 Cognite AS
import { CogniteClient } from '@cognite/sdk';
import { PublicClientApplication } from '@azure/msal-node';
import fs from 'fs';
import path from 'path';
import {readFromCache, cachePlugin} from './cache';

const project: string = process.env.COGNITE_PROJECT!;
const clientId: string = process.env.CLIENT_ID!;
const azureTenant = process.env.AZURE_TENANT_ID!;

if (!project || !clientId || !azureTenant) {
  throw Error(
    'You must set the environment variable AZURE_TENANT_ID, COGNITE_PROJECT and CLIENT_ID'
  );
}

const account = JSON.parse(fs.readFileSync(path.resolve('./account.json'), {encoding:'utf8'}));

async function deviceCodeGrantExample() {
  const pca = new PublicClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${azureTenant}`,
    },
    cache:{ cachePlugin }
  });

  // MUST DO!
  readFromCache(pca.getTokenCache());

  const client = new CogniteClient({
    appId: 'Cognite SDK samples',
    project,
    baseUrl:"https://greenfield.cognitedata.com/",
    getToken: () =>
    pca.acquireTokenSilent({
      forceRefresh:true,
      account: account!,
      scopes: ['https://greenfield.cognitedata.com/.default', 'offline_access']
    })
        .then((response) => {
          console.log(response)
          return response?.accessToken!
        }).catch((e)=>{
          console.log(e);
          return ''
        }),
  });

  console.log(await client.authenticate());

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

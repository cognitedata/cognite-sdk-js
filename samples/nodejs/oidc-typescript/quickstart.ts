// Copyright 2020 Cognite AS
import { CogniteClient } from '@cognite/sdk';
import { ConfidentialClientApplication } from '@azure/msal-node';

const project: string = process.env.COGNITE_PROJECT!;
const cluster = process.env.COGNITE_CLUSTER!;
const clientId: string = process.env.CLIENT_ID!;
const clientSecret: string = process.env.CLIENT_SECRET!;
const azureTenant = process.env.AZURE_TENANT_ID!;

if (!project || !cluster || !clientId || !clientSecret || !azureTenant) {
  throw Error(
    'You must set the environment variable AZURE_TENANT_ID, COGNITE_PROJECT, COGNITE_CLUSTER, CLIENT_ID and CLIENT_SECRET'
  );
}

async function quickstart() {
  const pca = new ConfidentialClientApplication({
    auth: {
      clientId,
      clientSecret,
      authority: `https://login.microsoftonline.com/${azureTenant}`,
    },
  });

  const client = new CogniteClient({
    appId: 'Cognite SDK samples',
    project,
    baseUrl: `https://${cluster}.cognitedata.com`,
    oidcTokenProvider: () =>
      pca
        .acquireTokenByClientCredential({
          scopes: [`https://${cluster}.cognitedata.com/.default`],
          skipCache: true,
        })
        .then((response) => response?.accessToken! as string),
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
  }
}

quickstart()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

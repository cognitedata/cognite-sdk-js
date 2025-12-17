// Copyright 2020 Cognite AS
import { CogniteClient } from '@cognite/sdk';
import { ConfidentialClientApplication } from '@azure/msal-node';

const project: string = process.env.COGNITE_PROJECT!;
const clientId: string = process.env.CLIENT_ID!;
const clientSecret: string = process.env.CLIENT_SECRET!;
const azureTenant = process.env.AZURE_TENANT_ID!;
const baseUrl = process.env.BASE_URL!;

if (!project || !clientId || !clientSecret || !azureTenant || !baseUrl) {
  throw Error(
    'You must set the environment variable AZURE_TENANT_ID, COGNITE_PROJECT, CLIENT_ID and CLIENT_SECRET and BASE_URL'
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
    baseUrl,
    getToken: () =>
      pca
        .acquireTokenByClientCredential({
          scopes: [`${baseUrl}/.default`],
          skipCache: true,
        })
        .then((response) => response?.accessToken! as string),
  });

  await client.authenticate();

  // const info = (await client.get('/api/v1/token/inspect')).data;

  // console.log('tokenInfo', JSON.stringify(info, null, 2));

  try {
    // const assets = await client.assets.list();
    //const functions = await client.functions.list({ limit: 10 });
    
    // await client.functions.delete([functions[0].id]);
    const retrieve = await client.functions.retrieve(1853152453344324);
    console.log('retrieve', retrieve);
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

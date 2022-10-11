// Copyright 2020 Cognite AS
import { CogniteClient } from '@cognite/sdk';
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';
import {
  Converter,
  UnitDictionariesProcessorImpl,
} from '@cognite-ornellas/units/';

const project: string = process.env.COGNITE_PROJECT!;
const clientId: string = process.env.CLIENT_ID!;
const clientSecret: string = process.env.CLIENT_SECRET!;
const azureTenant = process.env.AZURE_TENANT_ID!;
const authority =
  process.env.AUTHORITY ||
  'https://login.microsoftonline.com/b7484399-37aa-4c28-9a37-a32f24c0621f';

if (!project || !clientId || !clientSecret || !azureTenant) {
  throw Error(
    'You must set the environment variable AZURE_TENANT_ID, COGNITE_PROJECT, CLIENT_ID and CLIENT_SECRET'
  );
}

async function quickstart() {
  const client = new CogniteClient({
    appId: 'Cognite SDK samples',
    project,
    authentication: {
      provider: CogniteAuthWrapper,
      credentials: {
        authority: authority,
        method: 'client_credentials',
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://greenfield.cognitedata.com/.default',
      },
    },
  });

  await client.authenticate();

  const convertedDatapoints = await client.datapoints.retrieve({
    items: [{ id: 6522584026758 }, { outputUnit: 'US_bbl_oil/d' }],
  });

  console.log(`converted data points: \n ${convertedDatapoints}`);
}

quickstart()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

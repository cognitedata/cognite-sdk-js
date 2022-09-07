// Copyright 2020 Cognite AS
import { CogniteClient } from '@cognite/sdk';
import { CogniteAuthWrapper } from '@cognite/auth-wrapper';
import { Converter, UnitDictionariesProcessorImpl } from '@cognitedata/units';

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

  const converter = new Converter(new UnitDictionariesProcessorImpl());

  const input_unit = 'US_bbl_oil/s';
  const output_unit = 'US_gallon/s';

  const res = converter.unitConvert(1, input_unit, output_unit).toPrecision(6);

  console.log(res);

  // const info = (await client.get('/api/v1/token/inspect')).data;

  // console.log('tokenInfo', JSON.stringify(info, null, 2));

  // try {
  //   const assets = await client.assets.list();
  //   console.log(assets);
  // } catch (e) {
  //   console.log('asset error');
  //   console.log(e);
  // } //
}

quickstart()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

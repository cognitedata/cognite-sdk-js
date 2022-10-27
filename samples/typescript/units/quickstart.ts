// Copyright 2020 Cognite AS
import { CogniteClient, Timeseries } from '@cognite/sdk';

const project: string = process.env.COGNITE_PROJECT || 'publicdata';
const apiKey: string = process.env.COGNITE_CREDENTIALS || '';
if (!apiKey) {
  throw Error(
    'You must set the environment variable COGNITE_CREDENTIALS to your api-key to be able to run the example. See https://stackoverflow.com/a/22312868/4462088'
  );
}

async function quickstart() {
  const client = new CogniteClient({
    appId: 'Cognite SDK samples',
    project,
    apiKeyMode: true,
    getToken: () => Promise.resolve(apiKey),
  });

  const timeseries: Timeseries[] = await client.timeseries.create([
    { name: 'tmp', unit: 'ft3/s' },
  ]);

  const timeserie = timeseries[0];

  const timestampTill = Date.now() - 60 * 60 * 24 * 1000;

  const datapoints = [
    {
      timestamp: new Date(timestampTill + 1),
      value: 1,
    },
  ];

  await client.datapoints.insert([
    {
      id: timeserie.id,
      datapoints,
    },
  ]);

  const convertedDatapoints = await client.datapoints.retrieve(
    {
      items: [{ id: timeserie.id }],
    },
    { outputUnit: 'US_bbl_oil/d' }
  );

  await client.timeseries.delete([{ id: timeserie.id }]);

  console.log(
    `converted data points: \n ${JSON.stringify(convertedDatapoints)}`
  );
}

quickstart()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

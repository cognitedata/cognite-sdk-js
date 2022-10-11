// Copyright 2020 Cognite AS

import { CogniteClient } from '@cognite/sdk';

const project: string = process.env.COGNITE_PROJECT || 'publicdata';
const apiKey: string = process.env.COGNITE_CREDENTIALS || '';
if (!apiKey) {
  throw Error(
    'You must set the environment variable COGNITE_CREDENTIALS to your api-key to be able to run the example. See https://stackoverflow.com/a/22312868/4462088'
  );
}

// all examples are using async/await
// Read more about async/await: https://javascript.info/async-await

async function quickstart() {
  // create a SDK client
  const client = new CogniteClient({
    appId: 'Cognite SDK samples',
    project,
    apiKeyMode: true,
    getToken: () => Promise.resolve(apiKey),
  });

  console.log(
    `\nThe SDK client is now configured to talk with Cognite project "${project}"\n`
  );

  // get maximum 5 root assets
  // await client.assets.create([{name: 'new asset'}]);
  const rootAssets = await client.datapoints.retrieve({
    items: [{ id: 6522584026758 }],
  });
  // const rootAssets = await client.timeseries
  //   .list()
  //   .autoPagingToArray({ limit: 5 });
  console.log('List of the first 5 (maximum) root assets:\n');
  console.log(rootAssets);
}

quickstart()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

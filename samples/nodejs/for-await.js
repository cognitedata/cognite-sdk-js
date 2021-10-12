// This example required NodeJS version >= 10

const { CogniteClient } = require('@cognite/sdk');

const project = process.env.COGNITE_PROJECT || 'publicdata';
const apiKey = process.env.COGNITE_CREDENTIALS;
if (!apiKey) {
  throw Error('You must set the environment variable COGNITE_CREDENTIALS to your api-key to be able to run the example. See https://stackoverflow.com/a/22312868/4462088');
}

// all examples are using async/await
// Read more about async/await: https://javascript.info/async-await

async function quickstart() {
  const client = new CogniteClient({ appId: 'Cognite SDK samples' });
  client.loginWithApiKey({
    project,
    apiKey,
  });

  console.log('\nIterate over assets: ');
  for await (const asset of client.assets.list()) {
    console.log(asset);
    // call break when you want to stop iterating:
    break;
  }
}

quickstart()
  .then(()  => { process.exit(0); })
  .catch((err) => { console.error(err); process.exit(1); });
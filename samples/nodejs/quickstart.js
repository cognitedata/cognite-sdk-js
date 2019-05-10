const sdk = require('@cognite/sdk');

const project = process.env.COGNITE_PROJECT || 'publicdata';
const apiKey = process.env.COGNITE_CREDENTIALS;
if (!apiKey) {
  throw Error('You must set the environment variable COGNITE_CREDENTIALS to your api-key to be able to run the example. See https://stackoverflow.com/a/22312868/4462088');
}

// all examples are using async/await
// Read more about async/await: https://javascript.info/async-await

async function quickstart() {
  // get information about your api-key
  const apiKeyInfo = await sdk.getApiKeyInfo(apiKey);
  console.log('Api-key info:');
  console.log(apiKeyInfo);

  // create a SDK client
  const client = await sdk.createClientWithApiKey({
    project,
    apiKey,
  });

  console.log(`\nThe SDK client is now configured to talk with Cognite project "${client.project}"\n`);

  // get maximum 5 root assets
  const rootAssets = await client.assets
    .list({ filter: { depth: { min: 0, max: 0 }}})
    .autoPagingToArray({ limit: 5 });
  console.log('List of the first 5 (maximum) root assets:\n');
  console.log(rootAssets);

  console.log('\nIterate over assets: ');
  await client.assets.list().autoPagingEach(asset => {
    console.log(asset);
    // to break return false:
    return false;
  });

  // For NodeJS version >= 10 you could use for-await.
  // See example in for-await.js
}

quickstart()
  .then(()  => { process.exit(0); })
  .catch((err) => { console.error(err); process.exit(1); });
const { CogniteClient } = require('@cognite/sdk');

const project = process.env.COGNITE_PROJECT || 'publicdata';
const apiKey = process.env.COGNITE_CREDENTIALS;
if (!apiKey) {
  throw Error(
    'You must set the environment variable COGNITE_CREDENTIALS to your api-key to be able to run the example. See https://stackoverflow.com/a/22312868/4462088'
  );
}

// all examples are using async/await
// Read more about async/await: https://javascript.info/async-await

async function quickstart() {
  // create a SDK client
  const client = new CogniteClient({ appId: 'Cognite SDK samples' });
  client.loginWithApiKey({
    project,
    apiKey,
  });

  console.log(
    `\nThe SDK client is now configured to talk with Cognite project "${
      client.project
    }"\n`
  );

  // get maximum 5 root assets
  const rootAssets = await client.assets
    .list({ filter: { root: true } })
    .autoPagingToArray({ limit: 5 });
  console.log('List of the first 5 (maximum) root assets:\n');
  console.log(rootAssets);

  console.log('\nIterate over assets: ');
  await client.assets.list().autoPagingEach(asset => {
    console.log(asset);
    // to break return false:
    return false;
  });

  const firstPage = await client.assets.list();
  if (firstPage.next) {
    const secondPage = await firstPage.next();
  }

  // For NodeJS version >= 10 you could use for-await.
  // See example in for-await.js
}

quickstart()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

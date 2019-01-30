const sdk = require('@cognite/sdk');

const project = process.env.COGNITE_PROJECT || 'publicdata';
sdk.configure({
  project,
  // Replace this with your apikey, or set it as an environment variable
  apiKey: process.env.COGNITE_CREDENTIALS,
  // baseUrl: 'https://myown.base.url'
});

// with .then
const assetId = 123456789;
sdk.Assets.retrieve(assetId).then(asset => {
  console.log('Asset: ', asset);
}).catch(error => {
  console.error(error);
});

// with async & await
async function listRootAssets() {
  const assets = await sdk.Assets.list({ depth: 0, limit: 100 });
  console.log('Root assets: ', assets);
}

async function searchForAssets() {
  const assets = await sdk.Assets.search({ name: '21PT1019', limit: 1 });
  console.log('Assets: ', assets);
}

(async function() {
  try {
    await listRootAssets();
    await searchForAssets();
  } catch (error) {
    console.error(error);
  }
})();

// do raw requests (for instance to endpoints marked as experimental)
const params = {
  limit: 1,
};
sdk.rawGet(`api/0.5/projects/${project}/assets`, { params }).then(result => {
  console.log('Assets: ', result.data.data.items);
});

// sdk.rawGet(url, { params: queryParams });
// sdk.rawPost(url, { data: jsonBody, params: queryParams });
// sdk.rawPut(url, { data: jsonBody, params: queryParams });
// sdk.rawDelete(url, { params: queryParams });
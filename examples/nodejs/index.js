const sdk = require('@cognite/cognitesdk');

sdk.configure({
  project: process.env.COGNITE_PROJECT || 'publicdata',
  // Replace this with your apikey, or set it as an environment variable
  apiKey: process.env.COGNITE_CREDENTIALS,
});

sdk.Assets.search({}).then(assets => {
  //
  console.log(assets);
});

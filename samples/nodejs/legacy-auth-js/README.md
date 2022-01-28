# Legacy authentication sample

Node.JS sample set up to use Cognite (legacy) authentication with API Token.

## Getting Started

This kind of authentication will log you with an API Token.

## Prerequisite

Make sure you have read the [prerequisite-guide](../../README.md#prerequisite) before continuing.

## Install

Go to this folder in your terminal and run:

`npm install`

or with yarn:

`yarn`

## Run

`COGNITE_CREDENTIALS="YOUR_API_KEY" node quickstart.js`

or with `for await`

`COGNITE_CREDENTIALS="YOUR_API_KEY" node for-await.js`

## How to get logged by yourself?

1. Add the Cognite SDK to your project with yarn or npm.

```sh
yarn add @cognite/sdk@6.1.1
```

```sh
npm install @cognite/sdk@6.1.1
```

2. First of all create a new file called `quickstart.js` and import all necessary things from Cognite SDK.

```sh
const { CogniteClient } = require('@cognite/sdk');
```

3. Instantiate two consts with your project name and your API Key.

```sh
const project = 'your_project_name_here';
const apiKey = 'your_api_key_here';
```

4. You've two ways to use this sample, first without for await with node versions < 10 or with node versions >= 10 with for await. Create a function called `quickstart` with one of the following codes:

```js
// Example for Node versions < 10 without for await
async function quickstart() {
    // Here you're crearting a new SDK client with the provided credentials
    const client = new CogniteClient({
        appId: 'Cognite SDK samples',
        project,
        getToken: () => Promise.resolve(apiKey),
        apiKeyMode: true
    });

    console.log(
        `\nThe SDK client is now configured to talk with Cognite project "${
        client.project
        }"\n`
    );

    // Getting maximum 5 root assets
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

    if (firstPage.next) const secondPage = await firstPage.next();
}
```

```js
// Example for Node versions >= 10 with for await
async function quickstart() {
    // Here you're crearting a new SDK client with the provided credentials
    const client = new CogniteClient({
        appId: 'Cognite SDK samples',
        project,
        getToken: () => Promise.resolve(apiKey),
        apiKeyMode: true
    });
    
    console.log('\nIterate over assets: ');
    for await (const asset of client.assets.list()) {
        console.log(asset);
        // call break when you want to stop iterating:
        break;
    }
}
```

5. Call the `quickstart` function.

```js
quickstart()
  .then(() => { process.exit(0); })
  .catch((err) => { console.error(err); process.exit(1); });
```

6. Finally, run your code with:

```sh
COGNITE_CREDENTIALS="YOUR_API_KEY" node quickstart.js
```

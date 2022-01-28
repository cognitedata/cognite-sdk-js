# Legacy authentication sample w typescript

Node.JS w typescript sample set up to use Cognite (legacy) authentication with API Token.

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

`COGNITE_CREDENTIALS="YOUR_API_KEY" node build/quickstart.js`

## How to get logged by yourself?

1. Add the Cognite SDK to your project with yarn or npm.

```sh
yarn add @cognite/sdk@6.1.1
```

```sh
npm install @cognite/sdk@6.1.1
```

2. Create a new file called `quickstart.ts` and import all necessary things from Cognite SDK.

```sh
const { CogniteClient } = require('@cognite/sdk');
```

3. Instantiate two consts with your project name and your API Key.

```sh
const project = 'your_project_name_here';
const apiKey = 'your_api_key_here';
```

4. Create a function called `quickstart` with one of the following codes:

```ts
async function quickstart() {
    // Here you're crearting a new SDK client with the provided credentials
    const client = new CogniteClient({
      appId: 'Cognite SDK samples',
      project,
      apiKeyMode: true,
      getToken: () => Promise.resolve(apiKey)
    });

    console.log(
      `\nThe SDK client is now configured to talk with Cognite project "${
        project
      }"\n`
    );

    // get maximum 5 root assets
    await client.assets.create([{name: 'new asset'}]);
    const rootAssets = await client.assets
      .list({ filter: { root: true } })
      .autoPagingToArray({ limit: 5 });
    console.log('List of the first 5 (maximum) root assets:\n');
    console.log(rootAssets);
}
```

5. Call the `quickstart` function.

```ts
quickstart()
  .then(() => { process.exit(0); })
  .catch((err) => { console.error(err); process.exit(1); });
```

6. Build your project.

`npm run tsc`

or with yarn

`yarn tsc`

7. Finally, run your code with:

```sh
COGNITE_CREDENTIALS="YOUR_API_KEY" node build/quickstart.js
```

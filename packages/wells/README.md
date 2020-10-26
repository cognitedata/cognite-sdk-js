<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

# Cognite Wells JS SDK (derived from stable)

This package provides an SDK derived from `@cognite/sdk`, aka
[stable](https://github.com/cognitedata/cognite-sdk-js/blob/master/packages/stable/README.md).

It is recomended to install this package under the same name as `@cognite/sdk`.
This allows you to change SDK versions without changing your imports.
See the [beta readme](https://github.com/cognitedata/cognite-sdk-js/blob/master/packages/beta/README.md) for details.

### install and build

```bash
yarn install
yarn build
```

### consuming

##### set your env variables (must be valid for both cdf and geospatial API)

```bash
COGNITE_WELLS_PROJECT=<project-tenant>
COGNITE_WELLS_CREDENTIALS=<your-api-key>
```

#### setup client

```bash
const { CogniteClient } = require("@cognite/sdk-wells");

let client = new CogniteClient({
  appId: `JS SDK test (${name})`,
  baseUrl: "https://api.cognitedata.com",
});

client.loginWithApiKey({
  project: process.env.COGNITE_WELLS_PROJECT,
  apiKey: process.env.COGNITE_WELLS_CREDENTIALS,
});
```

#### run a polygon query by GeoJson

```bash
const polygon = {
    type: 'Polygon',
    coordinates: [
    [
        [-4.86423, 63.59999],
        [19.86423, 63.59999],
        [19.86423, 52.59999],
        [-4.86423, 52.59999],
        [-4.86423, 63.59999],
    ],
    ],
};

const response = await client.wells.searchByPolygon({geometry: polygon});
```

#### run a polygon query by wkt

```bash
const polygon = 'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

const response = await client.wells.searchByPolygon({geometry: polygon});
```

![query](figures/wells-sdk.png)

### Testing the wells package only

This repo contains some integration tests that require a CDF api key for `subsurface-test` tenant.
Talk to any of the contributors or leave an issue and it'll get sorted.
Travis will run the test and has its own api key.

Run all tests:

navigate to wells package root directory:

```bash
cd /cognite-sdk-js/packages/wells
```

```bash
yarn build
COGNITE_WELLS_PROJECT=<project-tenant> COGNITE_WELLS_CREDENTIALS=<your-api-key> yarn test
```

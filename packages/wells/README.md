<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

# Cognite Wells JS SDK (derived from stable)

The purpose of the wells-sdk is to build a layer on top of the core CDF API that allows for interpreting and querying data in the context of the Cognite well model / wells data layer. The well model / wells data layer is a representation of how well data can be described and modeled in terms of Cognite’s reusable resources (assets, sequences, geospatial, etc).

The importance of such a representation is being able to concatenate data from different sources into a single contextualized representation that is independent of source and customer. This allows both apps, such as Discover, and also geoscientists running models on top of well data, to be able to find the data they need and use it without having to consider where this data came from and what is its original format.

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

## **consuming**

##### set your env variables (must be valid for both cdf and geospatial API)

```bash
COGNITE_WELLS_PROJECT=<project-tenant>
COGNITE_WELLS_CREDENTIALS=<your-api-key>
```

### setup client

```js
const { CogniteClient } = require('@cognite/sdk-wells');

let client = new CogniteClient({
  appId: `JS SDK test (${name})`,
  baseUrl: 'https://api.cognitedata.com',
});

client.loginWithApiKey({
  project: process.env.COGNITE_WELLS_PROJECT,
  apiKey: process.env.COGNITE_WELLS_CREDENTIALS,
});
```

### **well queries**

#### _run a polygon query by GeoJson:_

```js
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

const response = await client.wells.searchByPolygon({ geometry: polygon });
```

#### _run a polygon query by wkt:_

```js
const polygon =
  'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

const response = await client.wells.searchByPolygon({ geometry: polygon });
```

#### _run a custom query:_

```js
const polygon =
  'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

// create a custom method
const fn: SearchWells = async (geometry: GeoJson) =>
  await someClient.myCustomPolygonSearch({ geometry: geometry });

// input that custom filter
const response = await client.wells.searchByPolygon({
  geometry: polygon,
  customFilter: fn,
});
```

### _polygon search with additional filters:_

```js
const polygon =
  'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

const response = await client.wells.listWells(
  {
    wellGeometry: {
      geometry: polygon,
      crs: 'epsg:4326',
      outputCrs: 'EPSG:4326',
    },
    filter: {
      name: ['Well A'],
      dataSource: ['A', 'B'],
      operator: ['A', 'B'],
      field: ['A', 'B'],
      block: ['A', 'B'],
    },
    limit: 1000,
  }
  }
)
```

### **Wellbore queries**

#### _List all wellbores in tenant:_

```js
const response = await client.wellbores.listAll();
```

#### _List immediate children wellbore of parentId:_

```js
const wellId = 2278618537691581;
const response = await client.wellbores.listChildren(wellId);
```

#### _List all wellbores (all levels of subtree) from wellId:_

```js
const rootId = 4438800495523058;
const response = await client.wellbores.listByWellId(rootId);
```

#### _Custom method for listing wellbores:_

```js
const fn: SearchWellbores = async (args: number) =>
  await myClient.customWellboresMethod(args);

const rootId = 4438800495523058;
const response = await client.wellbores.listByWellId(rootId, fn);
```

#### _Read wellbore trajectories and rows:_

Trajectories are expressed as **Survey[]** and are found on the wellbore object using a lazy getter _wellbore.trajectory()_. All trajectory rows are found on the trajectory object (**Survey** dataclass) and can be acessed using a lazy getter _trajectory.rows(limit=1000)_.

```js
const wellId = 2278618537691581;
const wellbores = await client.wellbores.listChildren(wellId);
for (const wellbore of wellbores) {
  const trajectories = await wellbore.trajectories();
  // trajectories exist?
  if (trajectories.length != 0) {
    for (const trajectory of trajectories) {
      const rows = await trajectory.rows();
      // rows exist?
      if (rows.length != 0) {
        console.log(rows);
      }
    });
  }
});
```

## **Survey queries**

### _List trajectories:_

```js
const wellboreId = 4618298167286402;
const trajectories = await client.surveys.listTrajectories(wellboreId);
for (const trajectory of trajectories) {
  const rows = await trajectory.rows();
  console.log(rows);
});
```

### _List trajectories with custom filter:_

```js
const wellboreId = 4618298167286402;

const fn: SearchSurveys = async (args: number) =>
  await client.surveys.listTrajectories(args);

const trajectories = await client.surveys.listTrajectories(wellboreId, fn);
for (const trajectory of trajectories) {
  const rows = await trajectory.rows();
  console.log(rows);
});
```

### **Testing the wells package locally**

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

# Cognite Wells JS SDK

Cognite wells SDK is tool for interacting with the CDF Wells Data Layer (WDL). All queries are passed through a service API called the 'Well-Service' that handles ingestion and queries into the well data layer.

The wells data layer is an abstraction on top of CDF resources able to concatenate well data from different sources into a single contextualized representation that is independent of source and customer. This allows apps, such as Discover or customer apps, and also geoscientists running advanced models on top of well data, to be able to find data in a consistent way without having to worry about the details of many different source formats.

### install and build

```bash
yarn install
yarn build
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

## **consuming**

### set your env variables (must be valid for both cdf and geospatial API)

```bash
COGNITE_WELLS_PROJECT=<project-tenant>
COGNITE_WELLS_CREDENTIALS=<your-api-key>
```

### set up client

```ts
import { createWellsClient, Cluster } from '@cognite/sdk-wells';

// Cluster.API (default), Cluster.BP, Cluster.GREENFIELD
let client = createWellsClient('app id', Cluster.API);

client.loginWithApiKey({
  project: process.env.COGNITE_WELLS_PROJECT,
  apiKey: process.env.COGNITE_WELLS_CREDENTIALS,
});
```

### **Well queries**

#### _Get well by id:_

```ts
import { Well } from '@cognite/sdk-wells';

const wellId: number = 8456650753594878;
const well: Well | undefined = await client.wells.getId(wellId);
```

#### _List wells:_

```ts
import { WellItems } from '@cognite/sdk-wells';

const wells: WellItems | undefined = await client.wells.list();
wells?.items.forEach(well => {
    console.log(well.externalId)
});
```

#### _Filter wells by wkt polygon:_

```ts
import { WellFilter } from '@cognite/sdk-wells';

const polygon = 'POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))';
const filter: WellFilter = {
  polygon: { wktGeometry: polygon, crs: 'epsg:4326' },
  sources: ['edm'],
};
const wells = await client.wells.filter(filter);
```

#### _Filter wells by geoJson polygon:_

```ts
import { WellFilter } from '@cognite/sdk-wells';

const polygon = <GeoJson>{
      type: 'Polygon',
      coordinates: [
        [
          [0.0, 0.0],
          [0.0, 80.0],
          [80.0, 80.0],
          [80.0, 0.0],
          [0.0, 0.0],
        ],
      ],
    };
const filter: WellFilter = {
  polygon: { geoJsonGeometry: polygon, crs: 'epsg:4326' },
  sources: ['edm'],
};
const wells = await client.wells.filter(filter);
```

#### _Filter - list all labels:_

```ts
const blockLabels: String[] | undefined = await client.wells.blocks();
const fieldLabels: String[] | undefined = await client.wells.fields();
const operatorLabels: String[] | undefined = await client.wells.operators();
const quadrantLabels: String[] | undefined = await client.wells.quadrants();
const sourceLabels: String[] | undefined = await client.wells.sources();
```

### **Wellbore queries**

#### _Get wellbore by id:_

```ts
import { Wellbore, Survey } from '@cognite/sdk-wells';
const wellboreId: number = 8456650753594878;
const wellbore: Wellbore | undefined = await client.wellbores.getById(wellboreId).then(response => response).catch(err => err);

// lazy method to get wellbore trajectory
const trajectory: Survey | undefined = await wellbore?.trajectory();

// lazy method to get data from trajectory
const data: SurveyData | undefined = await trajectory?.data();
```

#### _Get wellbore measurement for measurementType: 'GammaRay':_

```ts
import { Measurements, MeasurementType } from '@cognite/sdk-wells';

const wellboreId: number = 870793324939646;
const measurements: Measurements | undefined;
measurements = await client.wellbores.getMeasurement(
  wellboreId,
  MeasurementType.GammaRay
);
```

#### _Get trajectory for a wellbore:_

```ts
import { Survey } from '@cognite/sdk-wells';

const wellboreId: number = 8456650753594878;
const trajectory: Survey | undefined;
trajectory = await client.wellbores.getTrajectory(wellboreId);
```

### **Survey queries**

#### _Get data from a survey:_

```ts
import { SurveyDataRequest, SurveyData } from '@cognite/sdk-wells';

const surveyId: number = 5289118434026779;

const request: SurveyDataRequest = {
  id: surveyId,
  start: undefined,
  end: undefined,
  limit: 100,
  cursor: '98jgi&0%4',
  columns: undefined,
};

const data: SurveyData | undefined = await client.surveys.getData(request);
```

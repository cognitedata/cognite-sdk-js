# Cognite Wells nodejs SDK

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

### set up client with Api-Key

```ts
import { createWellsClient, Cluster } from '@cognite/sdk-wells';

// Cluster.API (default), Cluster.BP, Cluster.GREENFIELD
// Cluster.BP, Cluster.BP_NORTHEUROPE, Cluster.AZURE_DEV
let client = createWellsClient('app id', Cluster.API);

client.loginWithApiKey({
  project: process.env.COGNITE_WELLS_PROJECT,
  apiKey: process.env.COGNITE_WELLS_CREDENTIALS,
});
```

### set up client with Native Token

```ts
import { createWellsClient, Cluster, RefreshToken } from '@cognite/sdk-wells';

// Cluster.API (default), Cluster.BP, Cluster.GREENFIELD
let client = createWellsClient('app id', Cluster.API);

// this method will be called when token expires and CDF throws 401 or 403
const functionThatReturnsANewToken: RefreshToken = () => 'new fresh token';

client.loginWithToken({
  project: process.env.COGNITE_WELLS_PROJECT as string,
  accessToken: '*INITIAL-TOKEN*',
  refreshToken: functionThatReturnsANewToken,
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

#### _Filter wells without cursor (get ALL results sequentially):_

```ts
import { WellFilter } from '@cognite/sdk-wells';

const polygon = 'POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))';
const filter: WellFilter = {
  polygon: { wktGeometry: polygon, crs: 'epsg:4326' },
  sources: ['edm'],
};
const wells = await client.wells.filterSlow(filter);
```

#### _Filter wells by geoJson polygon:_

```ts
import { WellFilter } from '@cognite/sdk-wells';

const polygon = <GeoJson>{
  type: 'Polygon',
  coordinates: [
    [[0.0, 0.0], [0.0, 80.0], [80.0, 80.0], [80.0, 0.0], [0.0, 0.0]],
  ],
};
const filter: WellFilter = {
  polygon: { geoJsonGeometry: polygon, crs: 'epsg:4326' },
  sources: ['edm'],
};
const wells = await client.wells.filter(filter);
```

### _Filter wells by wkt polygon, name/description and specify desired outputCrs_

```ts
import { WellFilter } from '@cognite/sdk-wells';

const testPolygon =
  'POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))';
const filter: WellFilter = {
  polygon: { wktGeometry: testPolygon, crs: 'EPSG:4326' },
  stringMatching: 'Field',
  outputCrs: 'EPSG:23031',
};

const wells = await client.wells.filter(filter);
const retrievedCrs = wells?.items.map(well => well.wellhead?.crs)
```

### _Get wells that have a trajectory_

```ts
import { WellFilter } from '@cognite/sdk-wells';

const filter: WellFilter = { hasTrajectory = {} };
const wells = await client.wells.filter(filter);
```

### _Get wells that have a trajectory with data between certain depths_

```ts
import { WellFilter } from '@cognite/sdk-wells';

const filter: WellFilter = {
  hasTrajectory = { minDepth: 1300.0, maxDepth: 1700.0 },
};
const wells = await client.wells.filter(filter);
```

### _Get wells that has the right set of measurement types_

```ts
import { MeasurementFilter, MeasurementFilters } from '@cognite/sdk-wells';

// create measurement type filters
const gammaRayFilter: MeasurementFilter = {
  measurementType: MeasurementType.GammaRay,
};
const densityFilter: MeasurementFilter = {
  measurementType: MeasurementType.Density,
};
const lotFilter: MeasurementFilter = {
  measurementType: MeasurementType.LOT,
};

// Look for wells that match on ANY
const measurementFilters: MeasurementFilters = {
  containsAny: [gammaRayFilter, densityFilter, lotFilter],
};

// OR, look for wells that match on ALL
const measurementFilters: MeasurementFilters = {
  containsAll: [gammaRayFilter, densityFilter, lotFilter],
};

// apply filter
const filter: WellFilter = { hasMeasurements: measurementFilters };

const wells = await client.wells.filter(filter);
```

#### _Get wellbores for a well id:_

```ts
import { Well, Wellbore } from '@cognite/sdk-wells';

const wellId: number = 2275887128760800;
const wellbores: Wellbore[] | undefined;
wellbores = await client.wellbores.getFromWell(wellId);
```

or

```ts
import { Well, Wellbore } from '@cognite/sdk-wells';

const wellId: number = 2275887128760800;
const well: Well = await client.wells.getById(wellId);
const wellbores: Wellbore[] | undefined;
wellbores = await well.wellbores();
```

#### _Get wellbores from multiple well ids:_

```ts
import { Wellbore } from '@cognite/sdk-wells';

const wellIds: number[] = [2457499785650331, 2275887128760800];
const wellbores: Wellbore[] | undefined = await client.wellbores
  .getFromWells(wellIds)
  .then(response => response)
  .catch(err => err);
```

#### _Filter - list all labels:_

```ts
const blockLabels: String[] | undefined = await client.wells.blocks();
const fieldLabels: String[] | undefined = await client.wells.fields();
const operatorLabels: String[] | undefined = await client.wells.operators();
const quadrantLabels: String[] | undefined = await client.wells.quadrants();
const sourceLabels: String[] | undefined = await client.wells.sources();
const measurementTypeLabels:
  | String[]
  | undefined = await client.wells.measurements();
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
import { Measurement, MeasurementType, SurveyData } from '@cognite/sdk-wells';

const wellboreId: number = 870793324939646;
const measurements: Measurement[] | undefined;
measurements = await client.wellbores.getMeasurement(
  wellboreId,
  MeasurementType.GammaRay
);

// lazy method to inspect data from measurement
if (measurements) {
  // sync
  for (var measurement of measurements) {
    const data: SurveyData = await measurement.data();
    console.log(data.rows);
  }

  // async
  measurements.forEach(async measurement => {
    const data: SurveyData = await measurement.data();
    console.log(data.columns);
  });
}
```

#### _Get trajectory for a wellbore:_

```ts
import { Survey } from '@cognite/sdk-wells';

const wellboreId: number = 8456650753594878;
const trajectory: Survey | undefined;
trajectory = await client.wellbores.getTrajectory(wellboreId);
```

### **Casing queries**

#### _Get casing from well or wellbore id:_

```ts
import { Sequence } from '@cognite/sdk-wells';

const wellOrWellboreId: number = 5432591169464385;

const casings: Sequence[] | undefined = await client.wellbores.getCasings(
  wellOrWellboreId
);

// then get the casing data
casings?.forEach(async casing => {
  const data: SequenceData | undefined = await client.wellbores.getCasingsData(
    casing.id, // cdf sequence id (number)
    undefined, // start (number)
    undefined, // end (number)
    undefined, // columns (string[])
    '98jgi&0%4'// cursor (string)
    100        // limit (number)
  );
```

#### _Get Casing data (functional approach)_

```ts
import { Wellbore, Sequence } from '@cognite/sdk-wells';
const wellId: number = 5432591169464385;

// get all wellbores related to a well
const wellbores: Wellbore[] | undefined = await client.wellbores.getFromWell(wellId)

wellbores?.forEach(async wellbore => {

  // get all casings related to the wellbore
  const casings: Sequence[] | undefined = await wellbore?.casings();

  // get all the data (with filters) on each casing
  casings?.forEach(async casing => {
    const casingData: SequenceData | undefined = await casing.data(
    undefined, // start (number)
    undefined, // end (number)
    undefined, // columns (string[])
    '98jgi&0%4'// cursor (string)
    100        // limit (number)
    );
  })
})
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

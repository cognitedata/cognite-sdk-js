# Derived SDKs HOW-TO

This document serves as a guide for working with SDK packages.
First there is an overview, describing the most important packages
in the repository and how they interact. Then there are guides for
creating your own SDK packages, how to add APIs to the SDK, how to
make a derived SDK, and how to override APIs from the derived SDK.

## Overview of packages

### @cognite/sdk-core
exports a `BaseCogniteClient` ([docs](https://cognitedata.github.io/cognite-sdk-js/core/classes/basecogniteclient.html)) which supports logging in, upon which it creates
a `CDFHttpClient` containing the API keys needed to interract with the API.
Helper functions for logging in with browser popups and redirects also live here, and a generic `BaseResourceApi<T>` class provides protected templated methods for working with resource APIs with
pagination and chunking.

### @cognite/sdk (stable)
exports a `CogniteClient` ([docs](https://cognitedata.github.io/cognite-sdk-js/classes/cogniteclient.html)) which inherits from the `BaseCogniteClient` to add accessors to all stable API endpoints. Endpoint access is grouped by resource type. Example: `TimeSeriesAPI` ([docs](https://cognitedata.github.io/cognite-sdk-js/classes/timeseriesapi.html)) lets you create, filter, count, delete etc. timeseries.

Most types used in requests and responses are defined as interfaces and type aliases in `src/types.ts`,
and closely mimic the structure of the REST API.

### @cognite/sdk-beta
depends on both stable and core, and uses inheritence to augment the stable sdk.
The resulting class is exported as `CogniteClient` ([docs](https://cognitedata.github.io/cognite-sdk-js/beta/classes/cogniteclient.html)), and the rest of stable is forward-exported as well,
which makes the beta package behave as stable by default. To understand how the beta class can override
parts of stable, see the sections below.

### Any other potential packages
This is not an exhaustive list, because you can create your own packages.
See the sections below.

# Creating an SDK derived from stable

To create a new package, copy the `packages/template` folder in place and give it a new name. Go into the folder and change `package.json` to give the npm package a name. Tooling expects the package name to match the folder name like so:
```json
    "private": true,
    "name": "@cognite/sdk-<folder name>",
    "version": "0.0.0",
```
Keep the package private until it's ready to be published, since CI will version and publish all public packages
when releases are triggered.

You should also update the `"test"` script to run the tests inside your newly created folder:
```json
        "test": "jest --config=../../jest.config.js --testPathPattern=/<folder name>/",
```

Finally, if you want docs from this SDK to appear as a subfolder on the reference docs,
add the following script, which will run when docs are built for deployment:
```json
        "docs:bundle": "yarn docs && mkdir -p ../../docs/<subfolder> && cp -r docs/* ../../docs/<subfolder>/" 
```

The `README.md` file will appear on npm if published, so write something about the package.

## The structure of a package
In your newly created folder you will find some config files and a `src/` directory.
```
 src/
 |--> __test__/
 |--> cogniteClient.ts
 \--> index.ts
```

The client is defined in `cogniteClient.ts` and is exported from `index.ts`.
The simplest possible client (derived from stable) looks like this:
```ts
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';

export default class CogniteClient extends CogniteClientStable {

}
```
With the accompanying `index.ts`:
```ts
export * from '@cognite/sdk';
export { default as CogniteClient } from './cogniteClient';
```

# Adding endpoints to an SDK

Endpoints are all implemented as functions on subclasses of `BaseResourceAPI<T>`, but that is not a strict
requirement. The class simply helps with common actions on resources, and the generic parameter lets you specify
the type. For an example, see `TimeSeriesAPI` [here](../packages/stable/src/api/timeSeries/timeSeriesApi.ts).
The class has several endpoints, most of which already have generic implementations in the superclass.

Let's define a new API class in `src/api/coolThing/coolThingApi.ts`:
```ts
import { BaseResourceAPI, InternalId } from '@cognite/sdk-core';

export interface ExternalCoolThing {
    name: string;
    coolness: number;
}

export type CoolThing = ExternalCoolThing & InternalId;

export interface CoolThingQuery {
    /** Only get cool things at least this cool */
    min?: number;

    /** Only get cool things no cooler than */
    max?: number;
}

export class CoolThingAPI extends BaseResource<CoolThing> {

    /**
    * [Create cool thing(s)](https://doc.cognitedata.com/api/v1/#operation/postCoolThing)
    *
    * ```js
    * const timeseries = [
    *   { name: '', coolness: 40 },
    *   { name: '', coolness: 80 },
    * ];
    * const created = await client.timeseries.create(timeseries);
    * ```
    */
    public create = (items: ExternalCoolThing[]): Promise<CoolThing[]> => {
        return super.createEndpoint(items);
    };

    public list = (query?: CoolThingQuery)
}
```

The `CogniteClient` class makes instances of these classes in `initAPIs()`, which is called once credentials and project name are set. The accessor helper `accessAPI` reminds the user to set credentials before using APIs.

Let's add our `CoolThingAPI` to our derived `CogniteClient`.
```ts
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { CoolThingAPI } from './api/coolThing/coolThingApi';
import { accessApi } from '@cognite/sdk-core';

export default class CogniteClient extends CogniteClientStable {

    private coolThingApi?: CoolThingAPI;

    protected initAPIs() {
        super.initAPIs();

        // Turns into $BASE_URL/api/$API_VERSION/projects/$PROJECT/coolthing
        this.coolThingApi = this.apiFactory(CoolThingAPI, 'coolthing');
    }

    get coolThing(): CoolThingAPI {
        return accessApi(this.coolThingApi);
    }
}
```

The resulting CogniteClient now exports all API classes from stable, as well as our new API class.
When you create API classes, they should be exported in `index.ts`, along with any types used by
the API class.
```ts
export * from '@cognite/sdk';
export { default as CogniteClient } from './cogniteClient';
export {
    CoolThingAPI,
    ExternalCoolThing,
    CoolThing,
    CoolThingQuery,
} from './api/coolThing/coolThingApi';
```

In the stable API all type definitons are placed in `types.ts`, but for derived SDKs,
it is often better to put the types together with the API class. Then it is easier to see what has been changed when moving features to stable.

### TODO MOVE
Also note what happens if out derived SDK has modified the type of `Timeseries`

```ts
export * from '@cognite/sdk'; // We /dont/ export the Timeseries type from here
export { TimeSeriesAPI, Timeseries } from './api/timeSeries/timeSeriesApi'; // Because we export one here
```
This name overlap is also why derived SDKs use `modules` mode in 'typedoc' for their generated documentation, which makes the package and file path part of the url in the docs. This prevents overlapping, and makes it very clear what package a type is defined in.

# Accessing endpoints from outside of CDF

If you want to access a different domain, it is recomended to make your own
 `BasicHttpClient` ([docs](https://cognitedata.github.io/cognite-sdk-js/beta/classes/basichttpclient.html)). You can 

In a custom `CogniteClient` class:
```ts
export default class CogniteClient extends CogniteClientStable {

    private openDoor?: (name: string) => Promise<boolean>;

    protected initAPIs() {
        super.initAPIs();

        const doorClient = new BasicHttpClient("https://example.com");

        this.openDoor = async (name: string) => {
            const response = await doorClient.post('doors/open', { params: { name } });
            return response.status === 200;
        }
    }

    get doorControl() {
        return {
            openDoor: accessApi(this.openDoor)
        };
    }
}
```


# Overriding endpoints in a derived SDK

If you want 

# Creating an SDK not derived from stable
If you want to make an SDK derived from a beta or alpha, replace the dependency on `@cognite/sdk` with the correct package,
and yarn workspace will find it. All imports must be changed to the new package.
In theory all SDK versions are quite similar, except for aditions and small changes, so find & replace on imports should mostly work.
```ts
import { CogniteClient as CogniteClientStable } from '@cognite/sdk-beta';
```

If however, you want to create an SDK not based on any existing SDK, you only need to depend on core.
The stable SDK is such an SDK, see [stable/src/cogniteClient.ts](../packages/stable/src/cogniteClient.ts).

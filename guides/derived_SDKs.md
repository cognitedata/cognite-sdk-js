# Derived SDKs HOW-TO

## Overview of packages
The Cognite Javascript SDK is written to allow multiple versions to co-exist and depend on each other.
This allows us to more easily maintain SDKs for different API versions, such as betas and alphas.
It also allows arbitrary additions to be made to the SDK, by anyone who wants specific changes or features.
Different versions are implemented as different npm packages, possibly depending on one another.
This allows us to override specific endpoints, and otherwise delegate untouched features to the stable SDK.
The packages are folders in a monorepo, with tooling to allow building and testing everything at once, as
well as IDE support for going to definitions across packages.

### The core package
Basic functionality is implemented in `@cognite/sdk-core`, in the `packages/core/` folder.
The `BaseCogniteClient` class is an SDK client with only the login and logout APIs implemented. 
Logging in creates an HTTP client with features to handle Cognite API keys.
A generic `BaseResourceApi<T>` base class is provided for resource endpoint implementation.

### The stable SDK
The stable API is implemented as `@cognite/sdk` in `packages/stable/`. This is the package most apps will use.
The `CogniteClient` class uses inheritance to add API accessors to the `BaseCogniteClient`.
Each part of the API gets its own class in `src/api/*/*.ts`, e.g. the `TimeseriesAPI` class
which lets you create, delete, list and filter etc. timeseries.
These classes often inherit `BaseResourceApi<T>` from core, which provides many common generic endpoints,
as protected templated methods.

See the [reference documentation](https://cognitedata.github.io/cognite-sdk-js/classes/cogniteclient.html)
for `CogniteClient` to see all API classes provided by the API.

Instances of API classes are created in `CogniteClient` in the protected method `initAPIs()`,
where they are constructed with an HTTP client and path.
Most types used in requests and responses are defined as interfaces and type aliases in `src/types.ts`,
and closely mimic the structure of the REST API.

The package exports the `CogniteClient`, the API classes and the types.

### The beta SDK
The beta SDK is implemented as `@cognite/sdk-beta` in `packages/beta/`.
It depends on both stable and core, and uses inheritence to augment the stable sdk.
The resulting class is exported as `CogniteClient`, and the rest of stable is forward-exported as well,
which makes the beta package behave as stable by default. To understand how the beta class 

# Creating an SDK derived from stable
The simplest possible beta SDK just changes the string returned from `version`.

`src/cogniteclient.ts`:
```ts
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { version } from '../package.json';

export default class CogniteClient extends CogniteClientStable {
    protected get version() {
        return `${version}-beta`;
    }
}
```

The class must be exported from the package, as well as everything exported from stable.

`src/index.ts`:
```ts
// Copyright 2020 Cognite AS

export * from '@cognite/sdk';
export { default as CogniteClient } from './cogniteClient';
```

## Adding new endpoints to an SDK

```ts
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { MyNewAPI } from './api/myNew/myNewApi';

export default class CogniteClient extends CogniteClientStable {

    protected myNewApi:MyNewAPI;
    protected initAPIs() {
        super.initAPIs();
        this.myNewApi = this.apiFactory(MyNewAPI, 'mynew');
    }

    get myNew(): MyNewAPI {
        return accessApi(this.myNewApi);
    }
}
```

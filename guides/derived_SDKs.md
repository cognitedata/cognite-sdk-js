# Derived SDKs HOW-TO

This document serves as a guide for working with SDK packages.
First there is an overview, describing the most important packages
in the repository and how they interact

 Then there are guides for creating your own packages and making changes
 to derived packages.

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
The `CogniteClient` class uses inheritance to add accessors to the `BaseCogniteClient`.
Each part of the API gets its own class in `src/api/*/*.ts`, e.g. the `TimeseriesAPI` class
which lets you create, delete, list and filter etc. timeseries.

See the [reference documentation](https://cognitedata.github.io/cognite-sdk-js/classes/cogniteclient.html)
for `CogniteClient` to see all API classes provided by the API.

Most types used in requests and responses are defined as interfaces and type aliases in `src/types.ts`,
and closely mimic the structure of the REST API. The package exports the `CogniteClient`, the API classes and the types.

### The beta SDK
The beta SDK is implemented as `@cognite/sdk-beta` in `packages/beta/`.
It depends on both stable and core, and uses inheritence to augment the stable sdk.
The resulting class is exported as `CogniteClient`, and the rest of stable is forward-exported as well,
which makes the beta package behave as stable by default. To understand how the beta class can override
parts of stable, see the sections below.

### Any other potential packages
This is not an exhaustive list, because you can create your own packages.
See the sections below.

# Creating an SDK derived from stable



# Overriding endpoints in a derived SDK

# Creating an empty CDF SDK

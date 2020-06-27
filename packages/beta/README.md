Cognite Javascript SDK beta
===========================
The package `@cognite/sdk-beta` provides convenient access to the beta version of the Cognite API.
Setup is very similar to [stable](https://github.com/haved/cognite-sdk-js/blob/v1/packages/stable/README.md),
but use the following command to install:
```
$ yarn add @cognite/sdk@@cognite/sdk-beta
```
or with npm
```
$ npm install @cognite/sdk@@cognite/sdk-beta --save
```

This will install the beta package as a dependency, but under the normal sdk name.
In `package.json`, it will look like this:
```
    "@cognite/sdk": "@cognite/sdk-beta^X.X.X"
```

With the beta package installed under an alias, you don't need to modify your code
to access beta features. Import the `CogniteClient` as you normally would:
```js
import { CogniteClient } from '@congite/sdk';
```

## Documentation

Though it looks like the normal `CogniteClient`, it's actually named `CogniteClassBeta`.
See the typedoc [here](https://haved.github.io/cognite-sdk-js/beta/classes/cogniteclientbeta.html).

\[beta API reference\](TODO: link to beta api reference here)

The beta API is mostly a superset of stable. See the [stable readme](https://github.com/haved/cognite-sdk-js/blob/v1/packages/stable/README.md).
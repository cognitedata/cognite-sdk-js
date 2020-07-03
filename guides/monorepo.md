# Monorepo
The sdk is implemented with several npm packages, all contained in the `packages/` folder.
We use `lerna` to run commands in all repos, and also to configure versions.

## Structure
 - `packages/stable/` - holds `@cognite/sdk`, the stable SDK
 - `packages/core/` - holds `@cognite/sdk-core`, core functionality used by the SDK
 - `packages/beta/` - holds `@cognite/sdk-beta`, the beta SDK
 - `samples/` - holds several folders with sample use of the SDK

## Development
All dependencies can be installed from the repository root:
```
yarn
```
To `build`, `clean`, `test`, `lint` or `lint:fix`, run the command like so:
```
$ yarn <command>
```
If in the root folder, the operation is run in all packages (excluding samples), in topological order.
Remember to build all packages before testing, and the enviroment variables needed to run certain tests.

## Cross references
`@cognite/sdk` is dependent on a specific version of `@cognite/sdk-core`,
which matches the version number in `core/package.json`.
When building, you should always build all packages at once using `yarn build` in the root folder.
When changes are merged, `lerna` updates the versions and makes sure the packages still reference
each other exactly.

## Typescript
Each package has both `tsconfig.json` and `tsconfig.build.json`.
The difference is that `tsconfig.json` uses path aliases to reference the source folders of other packages.
This allows IDEs to visit source code across packages when going to definition.
Otherwise, Ctrl-clicking types from another package would open `dist/**/*.d.ts` files.

The `tsconfig.build.json` files don't do any path aliasing, so when building or linting
we use `dist/index.js` and `dist/src/**/*.d.ts` from the other packages.
To make sure all `dist/` folders are up to date, build all packages
by running `yarn build` in the root of the project.

To avoid duplicating configuration, there is a root `tsconfig.common.json` with most configuration,
a root `tsconfig.build.json` for build-specific configuration,
and a root `tsconfig.json` with the path aliasing.
The latter two extend the first.

Package specific configuration is mostly specifying output folder, and extending the corresponding
file in the project root. You only need to specify output folder in build configuration,
since your IDE will reference by source through path aliases.

Tests are written in typescript, but are explicitly excluded in `tsconfig.build.json`.
This means test are not compiled with the build, but by `jest` when tests are run.
To make the IDE experience better, tests are not excluded in `tsconfig.json`.
This means you can still use Go To Definition from test into source, and even into other packages.
When running tests, however, packages' `dist/index.js` files are used, so run `yarn build` first.

In the rare event you open up the generated `codeSnippets/` folder manually, you can also there
use Go To Definition thanks to different `tsconfig.json` and `tsconfig.build.json` files.

## Versioning
Commits need to follow [proper commit messages](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines). Once they are merged, CI uses the script `scripts/versionAndPush.sh`, which uses `lerna version`.
This will individually update versions of packages based on the commit messages affecting each package.
References between packages are also updated. A list of changes are commited to `CHANGELOG.md` in each package.
After bumping versions, the new packages are uploaded to npm using `lerna release`.

## Adding new packages
To add a new package, copy whatever is needed from another package, and give it a unique name in `package.json`.
If it's a sample in the sample folder, make sure its package name ends in `-sample` and that the package is private.
Lerna will create any public packages on npm, so make sure the names are correct before committing.

**Note:** Scoped packages (e.g. `@cognite/sdk`) need special confirmation that they are public the first time they are published.
This is specified in the individual `package.json` files: `"publishConfig": { "access": "public" }`.

## Samples
The `samples/` folder contains several samples, each top level folder being a private package in the workspace.
Though tecnically in the workspace for ease of testing, they would also work as-is as stand alone dependants of the sdk.
All samples' names end in `-sample`, to make filtering easy. `yarn test` does not test samples.

**NOTE** The `samples/react/` folder contains samples that are not tested, because a) they don't have tests,
and b) including the packages in the workspace would give lots of versioning conflicts with `react-scripts`.

To test the samples, first build the sdk.
```
$ yarn build
```

Then you can run the samples' tests.
```
$ yarn test-samples
```

## Documentation
Since each package gets its own npm page, they all have `README.md` files.
These are also used as front pages of typedoc pages.
This means all links must be absolute.
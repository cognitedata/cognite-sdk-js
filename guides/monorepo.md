# Monorepo
The sdk is implemented with several npm packages, all contained in the `packages/` folder.
We use `lerna` to run commands in all repos, and also to configure versions.

## Structure
 - `packages/stable/` - holds `@haved/cogsdk`, the stable SDK
 - `packages/core/` - holds `@haved/cogsdk-core`, core functionality used by the SDK
 - `packages/beta/` - holds `@haved/cogsdk-beta`, the beta SDK
 - `samples/` - holds several folders with sample use of the SDK

## Development
All dependencies can be installed from the repository root:
```
yarn
```
To `build`, `clean`, `test`, `lint` or `lint:fix`, run the command like so:
```
yarn <command>
```
If in the root folder, the operation is run in all packages, in topological order.
Remember to build all packages before testing, and the enviroment variables needed to run certain tests.

## Cross references
`@haved/cogsdk` is dependent on a specific version of `@haved/cogsdk-core`,
which matches the version number in `core/package.json`.
When building, you should always build all packages at once using `yarn build` in the root folder.
When changes are merged, `lerna` updates the versions and makes sure the packages still reference
each other exactly.

In theory you could use `file:../core` to reference other packages in the repo, but we want
strong versioning.

## Typescript
Each package has both `tsconfig.json` and `tsconfig.build.json`.
The difference is that `tsconfig.json` uses path aliases to reference the source folders of other packages.
This allows IDEs to visit source code across packages when going to definition.
The `tsconfig.build.json` files don't do any path aliasing, so when building or linting
we use `dist/index.js` and `dist/src/**/*.d.ts` from the other packages.
To make sure all `dist/` folder are up to date, build all packages
by running `yarn build` in the root of the project.

## Versioning
Commits need to follow [proper commit messages](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines). Once they are merged, CI uses the script `scripts/versionAndPush.sh`, which effectivly does
```
yarn lerna version --conventional-commits --exact
```
This will individually update versions of packages based on the commit messages affecting each package.
References between packages are also updated. A list of changes are commited to `CHANGELOG.md` in each package.

## Samples
The `samples/` folder contains several samples, each sample being a private package in the workspace.
Though tecnically in the workspace for ease of testing, they would also work as-is as stand alone dependants of the sdk.
To test the samples, first build the sdk.
```
yarn build
```

Then you can run the samples' tests.
```
yarn test-samples
```
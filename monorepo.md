# Monorepo
The sdk is implemented with several npm packages, all contained in the `packages/` folder.
We use `lerna` to run commands in all repos, and also to configure versions.

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
Remember enviroment variables needed to run tests.

## Cross references
`@cognite/sdk` is dependent on a specific version of `@cognite/sdk-core`,
which matches the version number in `core/package.json`. When changes to versions are made,
`lerna` makes sure the packages still reference each other exactly.

In theory you could use `file:../core` to reference other packages in the repo, but we want
strong versioning.

## Typescript
Each package has both `tsconfig.json` and `tsconfig.build.json`.
The difference is that `tsconfig.json` uses path aliases to reference the source folders of other packages.
This allows IDEs to visit source code across packages when going to definition.
The `tsconfig.build.json` files don't do any path aliasing, so when building or linting
we use `dist/index.js` and `dist/index.d.ts` from the other packages.

## Versioning
Commits need to follow [proper commit messages](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines). Once they are merged, CI uses
```
yarn lerna version --conventional-commits --yes
```
This will individually update versions of packages and references between them based on what kinds of commits were made. Changes are commited to `CHANGELOG.md` in each package.

## Samples
The `samples/` folder is also a package in the workspace, but private.
Each sample inside is then a package in the global workspace.
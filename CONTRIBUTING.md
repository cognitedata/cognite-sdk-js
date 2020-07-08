Contributing
============

Contributions are welcome, and this document details how changes can be made and submitted,
and eventually included in a relase. We use monorepo tooling, and a git setup for CI/CD.a PATCH bump 

Please note we have a [code of conduct](./CODE_OF_CONDUCT.md).

## Making changes
Make the changes to the package(s) you want to change, and commit them to a fork or branch.
Commits need to follow [proper commit messages](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).
The commit messages are used to automatically bump the versions of changed packages, and write automatic changelogs.
We use semantic versioning, with versions `MAJOR.MINOR.PATCH`.

 - For fixes, start the commit with `fix:`. This will bump PATCH.
 - For features, start the commit with `feat:`. This will bump MINOR.
 - For breaking changes, add an exclamation mark, e.g. `feat!:` or `fix!:`. This will bump MAJOR.
 - For extra details in the changelog, you can specify a scope, e.g. `feat(assets):`.
 - For other changes, use `refactor:`, `test:`, `docs:`, `chore:` etc.

## Pull request
Make a pull request from your branch to the main branch. When merging the pull request,
only use squashing if the resulting squash commit can accuratly describe the change as a single conventional commit.
Once the change is pushed to the main branch, it is time for a release.

## Releases & Versioning
Releases happen from a separate branch, called `release`. This is because lerna eagarly publishes
whenever files in a package have changed. Tests and markdown files are ignored, but all other changes will trigger
at minimum a PATCH bumb.

**Always** push the HEAD of the main branch to `release`.
This will trigger a deploy on travis CI.
Here lerna will look at changes since the last release (by using git tags),
and find out what changes have occured, and what commit messages affect each package.
Eventual version bumps will be made to `package.json` files automatically,
and commit descriptions will be appended to changelogs.
The changes are then committed back to the `release` branch and tagged.
Packages are published to npm, and a github release is made.
A pull request is opened back to the main branch.
It is important that the commit is pushed with the same hash,
to keep git tags correct.

Documentation is also built and deployed from the release branch.
If the code snippets have changed, a pr is made to the service contracts repo.

## Patching older major versions

If you need to backport a fix to a previous MAJOR version of a package,
you have to do it manually.

Let's say you want to make a fix to `@cognite/sdk-core@2`,
after `@cognite/sdk-core@3.0.0` is already published.

First check if there already is a backporting branch called `@cognite/sdk-core@2.x`.
```bash
git fetch
git checkout @cognite/sdk-core@2.x
```

If there isn't, make it based on the latest release of MAJOR version 2.
You can look at git tags to find the last release.
```bash
git fetch --all --tags
git tag | grep @cognite/sdk-core@2.
```

Let's say `2.38.1` was the last release before `3.0.0`.
We make a branch based on it for all backporting needs.

```bash
git checkout tags/@cognite/sdk-core@2.38.1 -b @cognite/sdk-core@2.x
```

Now we have a branch for our changes, in case we later need to backport more things.
In this branch, make your changes, and push them to GitHub.
We are not using CI/CD for publishing, but by pushing them we can at least
see automated tests run on the branch. Make sure they pass!

Once you are ready to make the new version, and have pushed everything to git,
open a terminal in the root of the project and run:
```bash
yarn
yarn build
```

Then go to `packages/core` (or whatever package you are backporting to), and run:
```bash
npm version patch -m "backport fix to %s for reasons"
npm publish
git push && git push --tags
```

This will make a commit with the updated `package.json`, create a new git tag, and publish to npm.
Make sure you are logged in to npm, talk to a maintainer.
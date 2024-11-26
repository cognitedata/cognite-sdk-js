# Contributing

Contributions are welcome, and this document details how changes can be made and submitted,
and eventually included in a release. We use monorepo tooling, and a git setup for automatically releasing
new versions based on commit messages.

Please note we have a [code of conduct](./CODE_OF_CONDUCT.md).

## Making changes

Make the changes to the package(s) you want to change, and commit them to a fork or branch. Commits
need to follow [proper commit
messages](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular).
The commit messages are used to automatically bump the versions of changed packages, and write
automatic changelogs. See the [Releases & Versioning](#releases--versioning) section below about
releasing changes.

We use semantic versioning, with versions `MAJOR.MINOR.PATCH`.

- For fixes, start the commit with `fix: msg` or `fix(topic): msg`. This will bump PATCH.
- For features, start the commit with `feat: msg` or `feat(topic): msg`. This will bump MINOR.
- For changes that break backwards compatibility, add `BREAKING CHANGE: description` to the footer.
  This will bump MAJOR version.

Note that using `<type>!: msg` **is not supported**, it will actually break the semantics of some
types. `feat!: msg` will result in a _patch_ release, not major. `<type>!: msg` [is a
thing](https://www.conventionalcommits.org/en/v1.0.0/) but that is _not_ supported by the
implementation used in this repo.

Also note that a major version upgrades are _not_ propagated up the dependency tree. If you do a
breaking change in `@cognite/sdk-core` it will get a major version bump, if you use the `BREAKING CHANGE: desc` footer. However, packages that depends on `@cognite/sdk-core` will only get a patch
upgrade. So if you do a breaking change to a non-top level package and also want to get major
version bump of the upstream packages you have to ensure that manually. This can be done in two
ways, run `lerna version major` or do a inconsequential change to the top level packages. If you do
_any_ change to the top packages (including the smallest white space cleanup), it will all be
covered by the `BREAKING CHANGE: msg` commit, leading them to all get a major version bump.

- For extra details in the changelog, you can specify a scope like so: `feat(assets): `.
- For other changes there are types without version bumping semantics:
  - `docs: ` changes to documentation
  - `build: ` changes to build scripts and config
  - `ci: ` changes to ci scripts and pipeline
  - `refactor: ` code moving and renaming
  - `style: ` fixes to code style
  - `test: ` changes to tests
  - `perf: ` changes to improve performance
  - `revert: ` changing things back
  - `chore: ` miscelanious changes

#### Example

```
docs(contributing-readme): add example of commit with subject line
```

A commit hook makes sure the syntax is followed. Automated commit messages such as `Merge pull request` are handled.

## Code generation

This SDK support generating TypeScript types from the Cognite OpenAPI document.
The idea is to use the OpenAPI document as a source of truth and to automate
part of the process. Any incorrect or missing types should be fixed/added
in the OpenAPI document instead of manually adjusting the generated types.
This also helps to keep documentation up to date.

Use the command `yarn codegen` for available commands.

More details are documented in the [codegen README](packages/codegen/README.md).

## Pull request

Make a pull request from your branch to the master branch. When merging the pull request,
only use squashing if the resulting squash commit can accurately describe the change as a single conventional commit.
Once the change is pushed to the master branch, it is time for a release.

## Releases & Versioning

Releases are done from the master branch, so when a pull request is merged,
CI/CD will run tests, and if successful, do deploys.
Documentation is built and deployed, and code snippets
are exported to the service contract repo as a pull request.

Updating and uploading npm packages only happens if the HEAD commit of the master branch
contains `[release]` in its description and the PR title starts with `feat` or `fix`.
When CI/CD sees this, it will use lerna to update
package versions of changed packages based on commit messages, and add the
changes to the changelogs. The changes are comitted to the master branch
with the new versions as git tags, and the new package versions are uploaded to npm.

We restrict new npm releases to `[release]`-tagged commits because lerna is
quite aggressive in its versioning. Changes to any file not ignored by lerna will
cause a PATCH bump. Markdown files and tests are ignored, but changing anything else,
like a comment in a source file, will trigger a new version,
irrespective of conventional commits.

This does _not_ mean you should store unfinished work on the master branch.
Another package may be ready for release, and once a `[release]`
commit is pushed, all changed packages are updated.
Repository administrators should be in control of `[release]` commits.

To add a release commit to a clean working tree, use the command

```bash
git checkout master
git pull
git commit --allow-empty -m "chore: trigger [release]"
git push
```

If you want to push the empty commit to master via a pull request,
use a squash merge (not rebase+ff). Otherwise GitHub will ignore the empty PR.

Also, keep in mind that the `[release]` commit has to be the HEAD of
master, and Github Action only runs on the HEAD. If HEAD has changed by the time
the versioning happens, Github Action will fail.

In order to perform a major release by merging a release candidate branch to master by keeping the same major version in release candidate version.

- Create a PR from release-* to master
- Make a PR title and the message when merging to be ` chore(): details [release]`
- The release tag is to trigger the release of the package.

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
We are not using CI/CD for publishing, but by pushing changes we can at least
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

## Code overview

### HTTP Client

The core of the SDK is the HTTP client. The HTTP client is divided into multiple layers:

1. [BasicHttpClient](./packages/core/src/httpClient/basicHttpClient.ts)
2. [RetryableHttpClient](./packages/core/src/httpClient/retryableHttpClient.ts)
3. [CDFHttpClient](./packages/core/src/httpClient/cdfHttpClient.ts)

See each file for a description of what they do.

### Pagination

We have multiple utilities to easy pagination handling. The first entrypoint is [cursorBasedEndpoint](./packages/core/src/baseResourceApi.ts) which adds a `next()` function on the response to fetch the next page of result. Then we use [makeAutoPaginationMethods](./packages/core/src/autoPagination.ts) to add the following methods:

- autoPagingToArray
  ```ts
  const assets = await client.assets.list().autoPagingToArray({ limit: 100 });
  ```
- autoPagingEach
  ```ts
  for await (const asset of client.assets.list().autoPagingEach({ limit: Infinity })) {
    // ...
  }
  ```

### Date parser

Some API responses includes DateTime responses represented as UNIX timestamps. We have utility class to automatically translate the number response into a Javascript [Date instance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date).

See the [DateParser class](./packages/core/src/dateParser.ts).

### Metadata

We offer users to get hold of the HTTP response status code and headers through the [MetadataMap class](./packages/core/src/metadata.ts).

### Core utilities

- [promiseAllWithData](./packages/core/src/utils.ts)
- [promiseCache](./packages/core/src/utils.ts)
- [topologicalSort](./packages/core/src/graphUtils.ts)
- [RevertableArraySorter](./packages/core/src/revertableArraySorter.ts)

### Cognite Clients

There is a Cognite Client per SDK package:
- [Core](./packages/core/src/baseCogniteClient.ts)
- [Stable](./packages/stable/src/cogniteClient.ts)
- [Beta](./packages/beta/src/cogniteClient.ts)
- [Alpha](./packages/alpha/src/cogniteClient.ts)
- [Playground](./packages/playground/src/cogniteClientPlayground.ts)
- [Template](./packages/template/src/cogniteClient.ts)

The Core one is the base, meaning the others extends from it.


#### Authentication

The authentication logic lives in the [core BaseCogniteClient](./packages/core/src/baseCogniteClient.ts).
The client constructor offer the field `oidcTokenProvider` (formely called `getToken`) where the SDK user will provide a valid access token.

The SDK will call this method when:

- The user calls `authenticate` on the client.
- The SDK receives a 401 from the API.
  When multiple requests receives a 401, then only a single call to `oidcTokenProvider` will be invoked. All requests will wait for `oidcTokenProvider` to resolve/reject. If it's resolved, then all the requests will retry before returning the response to the SDK caller. However, if the resolved access token matches the original access token, then no retry will be performed.
Make sure you are logged in to npm, talk to a maintainer.
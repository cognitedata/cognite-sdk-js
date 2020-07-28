Contributing
============

Contributions are welcome, and this document details how changes can be made and submitted,
and eventually included in a release. We use monorepo tooling, and a git setup for automatically releasing
new versions based on commit messages.

Please note we have a [code of conduct](./CODE_OF_CONDUCT.md).

## Making changes
Make the changes to the package(s) you want to change, and commit them to a fork or branch.
Commits need to follow [proper commit messages](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).
The commit messages are used to automatically bump the versions of changed packages, and write automatic changelogs.

We use semantic versioning, with versions `MAJOR.MINOR.PATCH`.

 - For fixes, start the commit with `fix: `. This will bump PATCH.
 - For features, start the commit with `feat: `. This will bump MINOR.
 - For changes that break backwards compatibility, add a `!` before the colon: `feat!: `.
   This will bump MAJOR version.
   
   The same can be achieved by specifying a footer.
   The footer must come after a blank line, and start with `BREAKING CHANGE: ` (colon mandatory),
   followed by a description of what breaks.
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

## Pull request
Make a pull request from your branch to the main branch. When merging the pull request,
only use squashing if the resulting squash commit can accurately describe the change as a single conventional commit.
Once the change is pushed to the main branch, it is time for a release.

## Releases & Versioning
Releases are done from the main branch, so when a pull request is merged,
CI/CD will run tests, and if successful, do deploys.
Documentation is built and deployed, and code snippets
are exported to the service contract repo as a pull request.

Updating and uploading npm packages only happens if the HEAD commit of the main branch
contains `[release]` in its description. When CI/CD sees this, it will use lerna to update
package versions of changed packages based on commit messages, and add the 
changes to the changelogs. The changes are comitted to the main branch
with the new versions as git tags, and the new package versions are uploaded to npm.

We restrict new npm releases to `[release]`-tagged commits because lerna is
quite aggressive in its versioning. Changes to any file not ignored by lerna will
cause a PATCH bump. Markdown files and tests are ignored, but changing anything else,
like a comment in a source file, will trigger a new version,
irrespective of conventional commits.

This does *not* mean you should store unfinished work on the main branch.
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

Also, keep in mind that the `[release]` commit has to be the HEAD of
main, and travis only runs on the HEAD. If HEAD has changed by the time
the versioning happens, travis will fail.

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

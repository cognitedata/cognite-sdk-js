---
name: bump-version
description: Cut a new release of the cognite-sdk-js packages. Bumps package versions and writes CHANGELOGs from conventional commits via `yarn release` (lerna), then opens the `chore(release): publish new package versions` PR whose merge publishes to npm. Use when asked to bump versions, release, publish, or cut a release of @cognite/sdk, sdk-core, sdk-beta or sdk-alpha.
---

# Bump version / release

Releases are **never hand-edited**. Versions and CHANGELOG entries are computed by
`lerna version --conventional-commits` from commit messages since each package's last
tag. The repo wraps this in `yarn release` (`scripts/create-release-pr.js`). Your job is
to run it from a clean, current `master`, check the result, and open the PR.

## How the pieces fit

| Piece | What it does |
|---|---|
| `lerna.json` | `"version": "independent"`. Each package is versioned separately. `*.md`, tests and specs don't count as changes. |
| `yarn release` | Requires being on `master` == `origin/master` with a **completely clean** tree (untracked files count). Fetches tags, creates `release/automated-<UTC timestamp>` (e.g. `release/automated-2026-11-06T12-42-27`), runs lerna, commits `chore(release): publish new package versions`, then pushes the branch. It does **not** open the PR. It prints a compare URL. |
| `.github/workflows/validate-release-pr.yaml` | On `release/automated-*` PRs, it fails if the branch's merge-base isn't the current `origin/master` HEAD or if master was merged in. If master moves before merge, close the PR and run the release again. Never rebase or merge master in. |
| `.github/workflows/publish-on-merge.yaml` | On push to master that touches `packages/*/package.json` **and** whose head commit message contains `chore(release): publish new package versions`, it builds, runs `lerna publish from-package` (npm with OIDC), creates tags such as `@cognite/sdk@10.19.0` and deploys docs to gh-pages. **Squash-merge** so the commit message keeps that title. All recent release PRs (#1511–#1551) were squash-merged into a single commit `chore(release): publish new package versions (#N)`. |

Published packages: `@cognite/sdk` (packages/stable), `@cognite/sdk-core` (core),
`@cognite/sdk-beta` (beta) and `@cognite/sdk-alpha` (alpha). `codegen` and `template` are
private and never bumped.

### What a release diff looks like (reference: #1551)

- `packages/<pkg>/package.json`: the `version` changes, plus the internal dependency
  ranges in dependents (e.g. alpha/beta `"@cognite/sdk": "^10.19.0"` and
  `"@cognite/sdk-core": "^5.4.1"`).
- `packages/<pkg>/CHANGELOG.md`: a new entry is inserted under the header.
- `yarn.lock`: the workspace versions are updated.

### Semver rules (from commits, per package)

- `fix:` / `fix(scope):` → PATCH. `feat:` → MINOR. A `BREAKING CHANGE:` footer → MAJOR.
- `feat!:` is **not** supported. It produces a *patch*. Flag any `!:` commits to the user.
- A dependent of a bumped package gets only a PATCH ("Version bump only"), even when the
  dependency took a major bump. If the user wants majors to propagate, raise it with them
  before releasing; don't do it silently.
- `chore`, `ci`, `docs`, `build`, `test` and `refactor` don't bump on their own.

### CHANGELOG style (generated; don't rewrite it)

The minor/major heading uses `#` and the patch heading uses `##`. Both link to the
compare range between URL-encoded tags, followed by the date:

```md
# [10.19.0](https://github.com/cognitedata/cognite-sdk-js/compare/%40cognite%2Fsdk%4010.18.0...%40cognite%2Fsdk%4010.19.0) (2026-11-06)

### Features

* **extractors:** add connectorExternalId to extractors Solution ([#1550](https://github.com/cognitedata/cognite-sdk-js/issues/1550)) ([0882ea6](https://github.com/cognitedata/cognite-sdk-js/commit/0882ea6...))
```

A package that only follows a dependency gets:

```md
## [5.4.1](...compare/%40cognite%2Fsdk-core%405.4.0...%40cognite%2Fsdk-core%405.4.1) (2026-11-06)

**Note:** Version bump only for package @cognite/sdk-core
```

**What goes in (level of detail).** It isn't every PR. A package's entry lists only
`feat`, `fix`, `perf`, `revert` and `BREAKING CHANGE` commits that touched files under
that package's directory since its last tag, one bullet per squashed PR. `chore`, `ci`,
`docs`, `test`, `refactor`, `build` and dependency bumps are left out, even when they
touch the package. For example, `chore: data modeling concurrency policy (#1524)` is in
the 10.18.0 range but not in its changelog. A PR that touches several packages appears in
each of them; #1525 (`feat(stable): …`) is in both the stable and alpha 0.48.0 entries.
A package whose only change is a dependency bump gets the one-line "Version bump only"
note and no bullets. The "closes …" tail comes from `#123` references in the squash
commit body (#1521's is long) and is kept as is. All five recent release PRs (#1511,
#1530, #1537, #1539, #1551) had one commit, straight from `yarn release`. Nobody trimmed
or rewrote the generated text.

Sections are `### Features`, `### Bug Fixes` and `### BREAKING CHANGES`. A bullet is
`* **scope:** subject (#PR) (sha)`. The commit's scope is used and the subject is taken
as written, so a bad changelog line means a bad commit message. Report it; don't
hand-edit, unless the user explicitly asks.

## Procedure

1. **Get onto a clean, current master.**
   ```bash
   git fetch origin --tags --force
   git status --porcelain
   ```
   - If there are uncommitted changes, ask the user. Offer to stash them (`git stash push -m ... -- <files>`) or commit them on their branch. Never discard them.
   - **Untracked files also block `yarn release`**. A common one is the local
     `cognite-sdk-python/` reference clone. Offer to exclude it locally with
     `echo 'cognite-sdk-python/' >> .git/info/exclude`. That isn't committed, and it's
     safer than moving the folder. Don't add it to `.gitignore` in the release PR.
   - `git checkout master && git pull --ff-only origin master`.
   - Make sure `node_modules` is current (`yarn install --immutable`) so `lerna` resolves.

2. **Preview what will be released**, before touching anything, and show it to the user:
   ```bash
   yarn lerna changed --long          # packages that will bump
   for p in sdk:stable sdk-core:core sdk-beta:beta sdk-alpha:alpha; do
     name=${p%%:*}; dir=${p##*:}
     tag=$(git tag --list "@cognite/$name@*" --sort=-v:refname | head -1)
     echo "== @cognite/$name (last $tag)"; git log --oneline "$tag"..HEAD -- "packages/$dir"
   done
   ```
   Summarise the expected bump per package (patch/minor/major) and the reason. Flag any
   `!:` commits, `BREAKING CHANGE` footers, or commits with sloppy subjects that will land
   in the changelog. If nothing changed, stop and say so.

3. **Run the release** (it pushes a branch, so confirm with the user first unless they
   already asked to release):
   ```bash
   yarn release
   ```
   If it fails a pre-flight check, fix the cause (step 1) and run it again. If it failed
   after creating the `release/automated-*` branch, delete that local branch
   (`git checkout master && git branch -D release/automated-...`), and the remote one if
   it was pushed, before retrying.

4. **Verify the commit** on the release branch:
   ```bash
   git show --stat HEAD
   git show HEAD -- 'packages/*/package.json' 'packages/*/CHANGELOG.md'
   ```
   Check the following:
   - The version bumps match the preview.
   - Only `packages/*/package.json`, `packages/*/CHANGELOG.md` and `yarn.lock` changed.
     If anything else got in, the tree wasn't clean, so abort and redo.
   - Dependents' `@cognite/*` ranges point at the new versions.
   - No private package (`codegen` or `template`) was bumped.

5. **Open the PR** (not as a draft, because CI skips drafts). Use the exact title, because
   the publish workflow matches on it:
   ```bash
   gh pr create --base master --head <release/automated-...> \
     --title "chore(release): publish new package versions" \
     --body "Automated version bump for release. Merging this PR will publish packages to NPM.

   <optional: one line per package, old → new>"
   ```
   Then bind and follow the PR as usual. Expect `validate-release`, `pr-title`, `lint`,
   `tests (22)`, `tests (24)`, `snippets`, `samples` and `stable`. It needs one approving
   review from a teammate; after that, the author usually merges it. Remind the user to
   **squash-merge** it and not to update it from master. If master moves first (or
   `validate-release` fails), close the PR with a comment such as "superseded by #N",
   and repeat from step 1. #1510 → #1511 was handled this way.

6. **After merge**, confirm the publish went through:
   ```bash
   gh run list --workflow publish-on-merge.yaml --limit 1
   npm view @cognite/sdk version   # repeat for each bumped package
   git fetch --tags && git tag --sort=-creatordate | head
   ```
   Every bumped package must have a new tag and the new version on npm. Then switch back
   to `master` and pull. Offer to restore anything stashed in step 1.

   **Partial publish failures happen.** In #1537 the CD run failed with
   `TLOG_CREATE_ENTRY_ERROR ... (409)` (npm provenance/sigstore) for `sdk-alpha` and
   `sdk-beta`. core and stable were published, but alpha 0.47.0 and beta 6.3.2 never
   reached npm, and the next release skipped past them. If the run fails, list the
   versions missing from npm/tags and tell the user. Retrying with
   `gh run rerun <id> --failed` is safe because `lerna publish from-package` only
   publishes versions that aren't on the registry yet. That's a publish, so ask before
   rerunning.

## Don'ts

- Don't edit versions or CHANGELOGs by hand, and don't run `lerna version` directly with
  other flags. Always use `yarn release`.
- Don't run `lerna publish` or `npm publish` locally. Publishing happens only in CD.
- Don't push to master, add commits to the release branch, or merge or rebase master into it.
- Don't release from a branch other than master. Backports to older majors follow the
  manual process in `CONTRIBUTING.md` ("Patching older major versions").

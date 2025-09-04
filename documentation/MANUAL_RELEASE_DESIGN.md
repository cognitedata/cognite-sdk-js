# Simple Manual Release Process

## Overview

A streamlined release process that eliminates security risks while maintaining simplicity:

1. **Release Manager**: `yarn release` (creates PR automatically)
2. **Review**: Review and approve the generated PR
3. **Publish**: Merge PR → packages automatically publish to NPM

## Security Issue Resolved

**Problem**: The previous automated workflow used `lerna version` commands that pushed commits directly to the `master` branch, bypassing code review and branch protection rules.

**Solution**: All version changes now go through pull request workflow with proper review and validation.

## Implementation

### Release Script (`scripts/create-release-pr.js`)

```javascript
#!/usr/bin/env node

const { execSync } = require("child_process");

async function createReleasePR() {
  try {
    // Calculate versions without pushing
    console.log("Calculating version changes...");
    execSync(
      "lerna version --conventional-commits --no-push --no-git-tag-version --yes",
      { stdio: "inherit" }
    );

    // Create release branch
    const branchName = `release/automated-${
      new Date().toISOString().split("T")[0]
    }`;
    execSync(`git checkout -b ${branchName}`);

    // Commit changes
    execSync("git add .");
    execSync('git commit -m "chore(release): version bump [skip ci]"');

    // Push branch
    execSync(`git push origin ${branchName}`);

    // Create PR
    execSync(
      `gh pr create --title "Release: Version Bump" --body "Automated version bump for release. Merging this PR will publish packages to NPM." --base master --head ${branchName}`
    );

    console.log("✅ Release PR created successfully!");
    console.log("Review the PR and merge when ready to publish.");
  } catch (error) {
    console.error("❌ Release failed:", error.message);
    process.exit(1);
  }
}

createReleasePR();
```

### Package.json Script

```json
{
  "scripts": {
    "release": "node scripts/create-release-pr.js"
  }
}
```

### GitHub Workflow (`.github/workflows/publish-on-merge.yaml`)

```yaml
name: Publish on Release PR Merge

on:
  push:
    branches: [master]
    paths: ['packages/*/package.json']

jobs:
  publish:
    if: contains(github.event.head_commit.message, 'chore(release): version bump')
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: yarn install --immutable

      - name: Build packages
        run: yarn build

      - name: Configure NPM
        run: echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> .npmrc
        env:
          NPM_TOKEN: ${{ secrets.NPM_PUBLISH_TOKEN }}

      - name: Publish to NPM and create tags
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: lerna publish from-package --yes --no-git-reset
```

### Lerna Configuration (`lerna.json`)

```json
{
  "version": "independent",
  "npmClient": "yarn",
  "command": {
    "version": {
      "ignoreChanges": [
        "**/*.md",
        "**/__tests__/**",
        "**/*.spec.ts",
        "**/*.test.ts"
      ],
      "message": "chore(release): version bump [skip ci]",
      "allowBranch": ["release/*"],
      "push": false,
      "gitTagVersion": false
    }
  }
}
```

### Branch Protection Setup

To ensure an outdated release PR cannot be merged.

**Required GitHub Settings for `master` branch:**

- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators in restrictions

**Add validation CI check (`.github/workflows/validate-release-pr.yaml`):**

```yaml
name: Validate Release PR

on:
  pull_request:
    branches: [master]

jobs:
  validate-release:
    if: startsWith(github.head_ref, 'release/automated-')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check if release PR is up-to-date
        run: |
          COMMITS_BEHIND=$(git rev-list --count HEAD..origin/master)
          if [ "$COMMITS_BEHIND" -gt 0 ]; then
            echo "❌ Release PR is $COMMITS_BEHIND commits behind master"
            echo "Please close this PR and create a fresh one with 'yarn release'"
            exit 1
          else
            echo "✅ Release PR is up-to-date with master"
          fi
```

## Usage

### Standard Release

```bash
git checkout master && git pull origin master
yarn release
# Review PR → Merge → Packages published automatically
```

### Handling Outdated Release PRs

If other PRs are merged before your release PR:

1. Close the outdated release PR
2. Run `yarn release` again to create a fresh PR
3. Review and merge the new PR

The branch protection + CI check prevents merging outdated PRs automatically.

## What Lerna Publish Does

`lerna publish from-package`:

- Reads versions from `package.json` files
- Publishes only packages with new versions to NPM
- Creates and pushes git tags automatically
- Safe to run multiple times (idempotent)

## Prerequisites

- **GitHub CLI**: `brew install gh`
- **NPM Token**: `NPM_PUBLISH_TOKEN` secret configured
- **GitHub Environment**: `production` environment with manual approval
- **Branch Protection**: Rules configured as described above

## Benefits

- **Enhanced Security**: No direct master branch commits
- **Simple Process**: One command starts release flow
- **Clear Audit Trail**: Every release documented in PR history
- **Automatic Publishing**: Merge triggers immediate NPM publication
- **Prevents Accidents**: Branch protection prevents outdated releases

## Dependencies

- **GitHub CLI** (`gh`) - For creating PRs
- **Lerna** - For version management and publishing
- **Node.js** - For running release script

Install GitHub CLI: `brew install gh` or download from [cli.github.com](https://cli.github.com)

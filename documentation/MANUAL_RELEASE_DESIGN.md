# Simple Manual Release Process

## Overview

A streamlined release process where releases are initiated manually but executed automatically through pull requests:

1. **Release Manager**: Pull latest master, run release command
2. **Automated**: Command creates PR with version bumps and release notes
3. **Release Manager**: Review and merge PR
4. **Automated**: Packages published to NPM and git tags created

## Release Workflow

### 1. Initiate Release

```bash
# Pull latest master
git checkout master
git pull origin master

# Run release command (creates PR automatically)
yarn release
```

### 2. Review & Merge

- Review the generated PR for version changes and release notes
- Merge PR to master when ready
- Packages automatically publish to NPM

## Implementation

### Required Scripts

**`package.json`**:

```json
{
  "scripts": {
    "release": "node scripts/create-release-pr.js"
  }
}
```

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

### GitHub Workflows

**`.github/workflows/publish-on-merge.yaml`**:

```yaml
name: Publish on Release PR Merge

on:
  push:
    branches: [master]
    paths: ['packages/*/package.json']

jobs:
  publish:
    # Only run when a commit contains our release message (from the automated PR)
    if: contains(github.event.head_commit.message, 'chore(release): version bump')
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval for production deployments

    steps:
      - uses: actions/checkout@v4
        # Get the merged code with updated package.json versions

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
        # Set up Node.js environment for building and publishing

      - name: Install dependencies
        run: yarn install --immutable
        # Install all dependencies needed for build and publish

      - name: Build packages
        run: yarn build
        # Build all packages before publishing (ensures clean artifacts)

      - name: Configure NPM
        run: echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> .npmrc
        env:
          NPM_TOKEN: ${{ secrets.NPM_PUBLISH_TOKEN }}
        # Authenticate with NPM registry for publishing

      - name: Publish to NPM and create tags
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # lerna publish from-package does the following:
          # 1. Reads current versions from package.json files
          # 2. Publishes changed packages to NPM registry
          # 3. Creates and pushes git tags for published versions
          # 4. Does NOT modify package.json or create commits (versions already set by PR)
          lerna publish from-package --yes --no-git-reset
```

### Configuration Updates

**`lerna.json`**:

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

**Remove existing automated triggers** from `.github/workflows/release.yaml` or delete the file entirely.

## How Lerna Publish Works

### `lerna publish from-package` explained:

When the GitHub workflow runs `lerna publish from-package`, here's exactly what happens:

1. **Version Detection**: Reads current versions from each `package.json` file
2. **Change Detection**: Compares current versions with what's published on NPM
3. **Package Publishing**: Publishes only packages that have new versions to NPM
4. **Git Tagging**: Creates git tags (e.g., `@cognite/sdk@1.2.3`) for each published package
5. **Tag Pushing**: Pushes all new tags to the GitHub repository

### Key Benefits:

- ✅ **Idempotent**: Safe to run multiple times - won't republish existing versions
- ✅ **Selective**: Only publishes packages that actually changed versions
- ✅ **Automatic tagging**: Creates consistent git tags without manual intervention
- ✅ **No version bumping**: Doesn't modify `package.json` files (versions already set by PR)

### Command Flags Explained:

- `--yes`: Skip all confirmation prompts (required for CI)
- `--no-git-reset`: Don't reset git state after publishing
- `from-package`: Use current `package.json` versions instead of calculating new ones

## Security & Branch Protection

### Required GitHub Settings

1. **Branch Protection for `master`**:

   - Require pull request reviews (1+ reviewer)
   - Require status checks to pass
   - Include administrators in restrictions
   - No direct pushes allowed

2. **Environment Protection for `production`**:
   - Require manual approval for NPM publishing
   - Restrict to repository administrators

## Usage

### Standard Release

```bash
yarn release
# Review PR → Merge → Packages published automatically
```

### Emergency Hotfix

```bash
git checkout master
git pull origin master
yarn release
# Same process - no exceptions for emergencies
```

## Benefits

- **Simple**: One command starts the release process
- **Safe**: All changes go through PR review
- **Automated**: Publishing happens automatically on merge
- **Auditable**: Clear git history and PR trail
- **Consistent**: Same process for all releases

## Rollback

If a release needs to be rolled back:

```bash
# Unpublish from NPM (within 24 hours)
npm unpublish @cognite/sdk@<version>

# Or deprecate (after 24 hours)
npm deprecate @cognite/sdk@<version> "Critical issue - use previous version"

# Revert version changes via PR
git checkout master
git pull origin master
git checkout -b hotfix/revert-version
git revert <release-commit-hash>
git push origin hotfix/revert-version
gh pr create --title "Revert problematic release" --body "Reverting version changes"
```

## Dependencies

- **GitHub CLI** (`gh`) - For creating PRs
- **Lerna** - For version management and publishing
- **Node.js** - For running release script

Install GitHub CLI: `brew install gh` or download from [cli.github.com](https://cli.github.com)

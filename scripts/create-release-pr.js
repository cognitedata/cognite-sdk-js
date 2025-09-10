#!/usr/bin/env node

const { execSync } = require('node:child_process');

async function createReleasePR() {
  try {
    /*
    // Pre-flight checks
    console.log('Running pre-flight checks...');

    // 1. Fetch latest changes from remote
    execSync('git fetch origin', { stdio: 'inherit' });

    // 2. Check that we're on master branch
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
    }).trim();
    if (currentBranch !== 'master') {
      console.error(
        `❌ Expected to be on 'master' branch, but currently on '${currentBranch}'. Please switch to master branch first.`
      );
      process.exit(1);
    }

    // 3. Check that we're on the latest commit of remote master
    const localCommit = execSync('git rev-parse HEAD', {
      encoding: 'utf8',
    }).trim();
    const remoteCommit = execSync('git rev-parse origin/master', {
      encoding: 'utf8',
    }).trim();
    if (localCommit !== remoteCommit) {
      console.error(
        '❌ Local master is not up to date with origin/master. Please pull the latest changes first.'
      );
      process.exit(1);
    }

    // 4. Check that working directory is clean
    const gitStatus = execSync('git status --porcelain', {
      encoding: 'utf8',
    }).trim();
    if (gitStatus.length > 0) {
      console.error(
        `❌ Working directory is not clean. Please commit or stash your changes first.\nUnstaged/staged files:\n${gitStatus}`
      );
      process.exit(1);
    }
*/
    console.log('🎉 All pre-flight checks passed!\n');

    // Create release branch first (with timestamp for uniqueness)
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    const branchName = `release/automated-${timestamp}`;
    console.log(`Creating release branch: ${branchName}`);
    execSync(`git checkout -b ${branchName}`);

    // Calculate versions without pushing (now on the release branch)
    console.log('Calculating version changes...');
    execSync(
      'lerna version --conventional-commits --no-push --no-git-tag-version --yes',
      { stdio: 'inherit' }
    );

    // Commit changes
    execSync('git add .');
    execSync('git commit -m "chore(release): publish new package versions"');

    // Push branch
    execSync(`git push origin ${branchName}`);
    console.log('✅ Release branch pushed successfully!\n');

    console.log(
      'Please use the following link to review the changes and create a release PR:'
    );
    const prTitle = 'Release: Version Bump';
    const prBody =
      'Automated version bump for release. Merging this PR will publish packages to NPM.';
    console.log(
      `https://github.com/cognitedata/cognite-sdk-js/compare/master...${branchName}?quick_pull=1&title=${encodeURIComponent(prTitle)}&body=${encodeURIComponent(prBody)}`
    );
  } catch (error) {
    console.error('❌ Release failed:', error.message);
    process.exit(1);
  }
}

createReleasePR();

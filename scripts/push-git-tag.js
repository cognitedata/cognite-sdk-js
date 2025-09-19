#!/usr/bin/env node

const { execSync } = require('node:child_process');

/**
 * Script to create and push git tags after npm publish
 * Uses npm environment variables available during lifecycle scripts
 */
function pushGitTag() {
  const packageName = process.env.npm_package_name;
  const packageVersion = process.env.npm_package_version;

  if (!packageName || !packageVersion) {
    console.error(
      'Error: npm_package_name and npm_package_version environment variables are required'
    );
    console.error(
      'This script should be run as an npm lifecycle script (postpublish)'
    );
    process.exit(1);
  }

  const tagName = `${packageName}@${packageVersion}`;

  try {
    console.log(`Creating git tag: ${tagName}`);
    execSync(`git tag "${tagName}"`, { stdio: 'inherit' });

    console.log(`Pushing git tag: ${tagName}`);
    execSync(`git push origin "${tagName}"`, { stdio: 'inherit' });

    console.log(`✅ Successfully created and pushed tag: ${tagName}`);
  } catch (error) {
    console.error(`❌ Failed to create/push git tag: ${tagName}`);
    console.error(error.message);
    process.exit(1);
  }
}

pushGitTag();

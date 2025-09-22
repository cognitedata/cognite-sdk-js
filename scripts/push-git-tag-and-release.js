#!/usr/bin/env node

const { execSync } = require('node:child_process');
const { readFileSync } = require('node:fs');

/**
 * Script to create and push git tags after npm publish and create GitHub releases
 * Uses npm environment variables available during lifecycle scripts
 */

/**
 * Parse changelog to extract release notes for a specific version
 * @param {string} version - Version to extract (e.g., "1.0.0")
 * @returns {string} Release notes for the version
 */
function extractChangelogEntry(version) {
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    const lines = changelog.split('\n');
    
    // Find the start of the version entry
    console.log(`^## \\[${version.replace(/\./g, '\\.')}\\]`);
    const versionPattern = new RegExp(`^## \\[${version.replace(/\./g, '\\.')}\\]`);
    const startIndex = lines.findIndex(line => versionPattern.test(line));
    
    if (startIndex === -1) {
      throw new Error(`Version ${version} not found in changelog`);
    }
    
    // Find the end of this version entry (next ## header)
    let endIndex = lines.length;
    for (let i = startIndex + 1; i < lines.length; i++) {
      if (lines[i].startsWith('## [')) {
        endIndex = i;
        break;
      }
    }
    
    // Extract the changelog entry (skip the version header)
    const releaseNotes = lines
      .slice(startIndex + 1, endIndex)
      .join('\n')
      .trim();
    
    return releaseNotes;
}

/**
 * Create GitHub release using GitHub CLI
 * @param {string} tagName - Git tag name
 * @param {string} releaseNotes - Release notes content
 */
async function createGitHubRelease(tagName, releaseNotes) {
    console.log(`Creating GitHub release: ${tagName}`);
    
    // Create the release using GitHub CLI
    const releaseCommand = `gh release create "${tagName}" --title "${tagName}" --notes "${releaseNotes.replace(/"/g, '\\"')}"`;
    console.log(releaseCommand);
    execSync(releaseCommand, { stdio: 'inherit' });
    
    console.log(`✅ Successfully created GitHub release: ${tagName}`);
}

async function pushGitTagAndRelease() {
  const packageName = process.env.npm_package_name;
  const packageVersion = process.env.npm_package_version;

  if (!packageName || !packageVersion) {
    console.error(
      'Error: npm_package_name and npm_package_version environment variables are required'
    );
    process.exit(1);
  }

  const tagName = `${packageName}@${packageVersion}`;

  try {
    // Create and push git tag
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

    // Create GitHub release
    try {
        const releaseNotes = extractChangelogEntry(packageVersion);
        await createGitHubRelease(tagName, releaseNotes);
    } catch (error) {
        console.error(`❌ Failed to create GitHub release: ${tagName}`);
        console.error(error.message);
        process.exit(1);
    }
}

pushGitTagAndRelease();

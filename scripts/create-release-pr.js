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

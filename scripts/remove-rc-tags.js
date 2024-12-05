// Remove -rc tag from release branch when it merge to master
const fs = require('node:fs');
const glob = require('glob');

// Retrive all pacakage.json file paths
const packageFilesPaths = glob.sync('packages/*/package.json');

// loop through each and remove rc tag
for (const packageFilePath of packageFilesPaths) {
  //get the package content to json file
  const packageJson = JSON.parse(fs.readFileSync(packageFilePath, 'utf-8'));

  // check for rc, remove it, reassign the version and rewrite
  if (packageJson.version?.includes('-rc')) {
    // 6.0.0-rc.1 --> [6.0.0, -rc.1]
    // 5.0.0 which then convert to 6.0.0 by release.yaml
    majorVersion = Number.parseInt(packageJson.version.split('-rc')[0]) - 1;
    packageJson.version = `${majorVersion}.0.0`;
    fs.writeFileSync(
      packageFilePath,
      `${JSON.stringify(packageJson, null, 2)}\n`
    );
  }
}

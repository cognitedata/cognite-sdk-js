const sdkPackage = require('../package.json');
const samplesPackage = require('../samples/package.json');

const sdkVersion = sdkPackage.version;
const samplesDependencyVersion = samplesPackage.dependencies['@cognite/sdk'];
if (sdkVersion !== samplesDependencyVersion) {
  console.error('Mismatch between sdk-version in package.json and sdk-dependency version in ./samples/package.json');
  console.error(`${sdkVersion} !== ${samplesDependencyVersion}`);
  process.exit(1);
}
process.exit(0);

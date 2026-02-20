#!/usr/bin/env node
// Wrapper so "yarn lint --fix" runs the fix script (biome ci does not accept --fix).
const { execSync } = require('node:child_process');
const hasFix = process.argv.includes('--fix');
if (hasFix) {
  execSync('yarn run lint:fix', { stdio: 'inherit' });
} else {
  execSync('yarn g:biome ci', { stdio: 'inherit' });
}

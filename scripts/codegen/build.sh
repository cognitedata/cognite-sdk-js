#!/bin/sh
set -e

rm -rf ./tmp
mkdir -p ./tmp

yarn install
yarn build
node scripts/codegen/index.js "$@"

yarn build --since master
yarn lint:fix --since master

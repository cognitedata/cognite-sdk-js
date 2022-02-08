#!/bin/sh
set -e

FOLDER="./tmp/service-contracts"
rm -rf ./tmp
mkdir -p ./tmp

git -C ${FOLDER} pull || git clone git@github.com:cognitedata/service-contracts.git ${FOLDER}
cd ${FOLDER}
yarn install
chmod +x build.sh
./build.sh
cd ../..

yarn install
node scripts/codegen/index.js "$@"

yarn build --since master
yarn lint:fix --since master


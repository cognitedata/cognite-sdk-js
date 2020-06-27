#!/usr/bin/bash
set -ex

if [ "$ONLY_TEST" = true ]; then
    echo "Only doing build and test"
    yarn --ignore-engines
    yarn global add lerna@3.1.4 #Supports node 8
    lerna run build --stream
    lerna run test --stream
else
    yarn
    yarn global add codecov
    yarn commitlint-travis
    #yarn validateDocLinks
    yarn lint
    yarn build
    yarn test && codecov
    yarn test-samples
    yarn test-snippets
    yarn bundle-docs
fi
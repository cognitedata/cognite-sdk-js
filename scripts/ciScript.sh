#!/usr/bin/bash
# exit when any command fails, print each command
set -ex

yarn --frozen-lockfile
yarn build

if [ "$ONLY_TEST" = true ]; then
    echo "Only doing build and test"
    yarn test
    yarn test-samples
else
    yarn global add codecov@3.7.0
    yarn commitlint-travis
    yarn validateDocLinks || true
    yarn lint
    yarn test:codecov
    yarn test-samples
    yarn test-snippets
    yarn docs:bundle
fi
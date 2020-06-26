#!/usr/bin/bash
set -ex

if [ "$ONLY_TEST" = true ]; then
    yarn install --ignore-engines #lerna doesn't work on node 8
    yarn workspaces run build
    yarn workspaces run test
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
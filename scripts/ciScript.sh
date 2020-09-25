#!/usr/bin/bash
# exit when any command fails, print each command
set -ex

yarn --frozen-lockfile
yarn build

if [ "$TRAVIS_EVENT_TYPE" = pull_reqest ]; then
  PR_TITLE=$(curl https://github.com/${TRAVIS_REPO_SLUG}/pull/${TRAVIS_PULL_REQUEST} 2> /dev/null | grep "title" | head -1)
  echo $PR_TITLE | commitlint
fi

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

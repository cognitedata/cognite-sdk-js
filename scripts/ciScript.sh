#!/usr/bin/bash
# exit when any command fails, print each command
set -ex

yarn --frozen-lockfile
yarn build

if [ "$TRAVIS_EVENT_TYPE" = pull_request ]; then
echo "Make sure PR title has a valid format"
  sudo apt-get install jq
  PR_TITLE=$(curl -H "Authorization: Bearer $GITHUB_TOKEN" \
                  -H "application/vnd.github.v3+json" \
                  https://api.github.com/repos/${TRAVIS_REPO_SLUG}/pulls/${TRAVIS_PULL_REQUEST} | jq -r ".title")
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

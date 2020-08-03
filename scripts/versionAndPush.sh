#!/usr/bin/bash
# exit upon error (DON'T -x !!)
set -e

# Don't be in detached head mode
echo "Checking out \$TRAVIS_BRANCH: $TRAVIS_BRANCH"
git checkout $TRAVIS_BRANCH

git config --global user.email "cognite-cicd@users.noreply.github.com"
git config --global user.name "Cognite CICD"

# Setting remote with token, with hard coded repo name
git remote set-url origin "https://${GITHUB_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git" > /dev/null 2>&1
echo "Set git origin with token!"

# Used by lerna version
GH_TOKEN="${GITHUB_TOKEN}"
# Lerna makes a commit (with [skip ci] in message)
# Will fail if upstream head has changed in the meantime
# Will do nothing and return 0 if nothing has changed
echo "Running lerna version"
yarn lerna version --conventional-commits --create-release github --no-private --yes
echo "Ran lerna version!"

echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
echo "Added NPM_TOKEN to .npmrc"

# publish to npm (if any packages have new versions)
echo "Running lerna publish"
# Don't remove builds and snippet info etc after publish
yarn lerna publish from-package --yes --no-git-reset
echo "Ran lerna publish!"

#!/usr/bin/bash
# exit upon error (DON'T -x !!)
set -e

# Don't be in detached head mode
echo "Checking out \$TRAVIS_BRANCH: $TRAVIS_BRANCH"
git checkout $TRAVIS_BRANCH

cat ~/.config/git/config || true
echo ""

git config --global user.email travis@travis-ci.org
git config --global user.name "Travis CI"
echo "Set git identity to Travis CI<travis@travis-ci.org>"

# Find the new remote with github token, careful not to leak secrets
OLD_REMOTE="$(git remote get-url origin)"
REPO_PATH=$(echo $OLD_REMOTE | sed -En "s/^.*github.com.(.*)/\1/p")
git remote set-url origin "https://$GITHUB_TOKEN@github.com/$REPO_PATH" > /dev/null 2>&1
echo "Set git origin with token!"

GH_TOKEN="$GITHUB_TOKEN" #Used by lerna version
# Lerna makes a commit (with [skip ci] in message)
echo "Running lerna version"
yarn lerna version --conventional-commits --no-private --yes
echo "Ran lerna version!"

echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
echo "Added NPM_TOKEN to .npmrc"

# publish to npm
echo "Running lerna publish"
# Don't remove builds and snippet info etc after publish
# We don't have prepublish lifecycle scripts, but the packages are already built either way
yarn lerna publish from-package --yes --no-git-reset
echo "Ran lerna publish!"

#!/usr/bin/bash
# exit upon error (DON'T -x !!)
set -e

if ! [[ $TRAVIS_COMMIT_MESSAGE =~ "[release]" ]]; then
    echo "Not a release commit, skipping version bumping and releasing"
    exit 0
fi

echo "A release commit!"

# Don't be in detached head mode
echo "Checking out \$TRAVIS_BRANCH: $TRAVIS_BRANCH"
git checkout $TRAVIS_BRANCH

# Check if anything has changed in any package
if ! yarn lerna changed; then
    echo "Nothing has changed"
    exit 0
fi

git config --global user.email "cognite-cicd@users.noreply.github.com"
git config --global user.name "Cognite CICD"

# Setting remote with token, with hard coded repo name
git remote set-url origin "https://${GITHUB_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git" > /dev/null 2>&1
echo "Set git origin with token!"

GH_TOKEN="$GITHUB_TOKEN" #Used by lerna version
# Lerna makes a commit (with [skip ci] in message)
# Will fail if upstream head has changed in the meantime
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

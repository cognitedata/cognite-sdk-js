#!/usr/bin/bash
# exit upon error (DON'T -x !!)
set -ex

# Don't be in detached head mode
echo "Checking out \$TRAVIS_BRANCH: $TRAVIS_BRANCH"
git checkout $TRAVIS_BRANCH

if true ; then

    git config --user.email travis@travis-ci.org
    git config --user.name Travis CI
    echo "Set git identity to Travis CI<travis@travis-ci.org>"

    # Find the new remote with github token, careful not to leak secrets
    OLD_REMOTE="$(git remote get-url origin)"
    REPO_PATH=$(echo $OLD_REMOTE | sed -En "s/^.*github.com:(.*)/\1/p")
    git remote set-url "https://$GITHUB_TOKEN@github.com/$REPO_PATH" --quiet > /dev/null 2>&1
    echo "Set git origin with token!"

    GH_TOKEN="$GITHUB_TOKEN" #Used by lerna version
    # Lerna makes a commit (with [skip ci] in message) 
    yarn lerna version --conventional-commits --no-private --yes > /dev/null 2>&1
    echo "Ran lerna version!"

    # publish to npm
    yarn lerna publish from-package --yes
    echo "Ran lerna publish!"
else
    echo "No changes made to packages, no version pushed"
fi
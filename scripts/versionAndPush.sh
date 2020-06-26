#!/usr/bin/bash
# exit upon error (DON'T -x !!)
set -e

# Don't be in detached head mode
git checkout $TRAVIS_BRANCH

if true ; then
    # Find the new remote with github token, careful not to leak secrets
    OLD_REMOTE="$(git remote get-url origin)"
    REPO_PATH=$(echo $OLD_REMOTE | sed -En "s/^.*github.com:(.*)/\1/p")
    git remote set-url "https://$GITHUB_TOKEN@github.com/$REPO_PATH" --quiet > /dev/null 2>&1

    GH_TOKEN="$GITHUB_TOKEN" #Used by lerna version
    # Lerna makes a commit (with [skip ci] in message) 
    yarn lerna version --conventional-commits --no-private --yes --create-release github > /dev/null 2>&1
    
    # publish to npm
    yarn lerna publish --yes
else
    echo "No changes made to packages, no version pushed"
fi
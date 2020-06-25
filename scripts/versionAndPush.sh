# exit upon error (DON'T -x !!)
set -e

# Don't be in detached head mode
git checkout $TRAVIS_BRANCH

if yarn lerna changed ; then

    # Set git identity
    git config --global user.email "travis@travis-ci.org"
    git config --global user.name "Travis CI"

    # Lerna makes a commit (with [skip ci] in message)
    yarn lerna version --conventional-commits --exact --yes --no-push
    
    # Find the new remote with github token, careful not to leak secrets
    OLD_REMOTE="$(git remote get-url origin)"
    echo "Old remote is $OLD_REMOTE"
    REPO_PATH=$(echo $OLD_REMOTE | sed -En "s/^.*github.com:(.*)/\1/p")
    git remote set-url "https://$GITHUB_TOKEN@github.com/$REPO_PATH" --quiet > /dev/null 2>&1

    # Push the commit to GitHub
    git push --no-verify --quiet -u origin $TRAVIS_BRANCH > /dev/null 2>&1
    
    #publish to npm
    #yarn lerna publish --yes
else
    echo "No changes made to packages, no version pushed"
fi
#!/usr/bin/bash
# exit when any command fails (DON'T -x !!)
set -e

sudo add-apt-repository -y ppa:cpick/hub
sudo apt-get -y update
sudo apt-get install -y hub
sudo apt-get install -y jq

stablePackage="packages/stable"
packageVersion=$(jq -r ".version" "${stablePackage}/package.json")
branchName="bot/jsCodeSnippets_v$packageVersion"
message="[JS SDK]: update code snippets to v$packageVersion"

echo "Cloning service contract repo"
git clone https://$GITHUB_TOKEN@github.com/cognitedata/service-contracts.git >/dev/null 2>&1
cd service-contracts

echo "Checking out branch $branchName"
git checkout -b "$branchName"

echo "Copying stable SDK's code snippets"
cp "../${stablePackage}/codeSnippets/index.json" ./versions/v1/js-sdk-examples.json
if ! git diff --quiet ; then
    echo "service contracts code snippets have changed. making pull request"
    git add ./versions/v1/js-sdk-examples.json
    git commit -m "$message"
    #git push origin "$branchName"
    #hub pull-request -m "$message"
    #echo "pull request made"
else
    echo "no changes made to code snippets, not opening service contracts pr"
fi

cd ../
rm -rf service-contracts
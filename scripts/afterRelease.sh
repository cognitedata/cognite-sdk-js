# exit when any command fails
set -e

(cd packages/stable; yarn extract-snippets)

packageVersion=$(jq -r ".version" package.json)
branchName="bot/jsCodeSnippets_v$packageVersion"
message="[JS SDK]: update code snippets to v$packageVersion"

git clone https://$GITHUB_TOKEN@github.com/cognitedata/service-contracts.git >/dev/null 2>&1
cd service-contracts

git checkout -b "$branchName"
cp ../packages/stable/codeSnippets/index.json ./versions/v1/js-sdk-examples.json
git add ./versions/v1/js-sdk-examples.json
git commit -m "$message"
git push origin "$branchName"
hub pull-request -m "$message"

cd ../
rm -rf service-contracts
rm -rf codeSnippets

# exit when any command fails
set -e

yarn extract-snippets

packageVersion=$(jq -r ".version" package.json)
branchName="feat/updateSDKJsExamples$packageVersion"

hub clone git@github.com:cognitedata/service-contracts.git
cd service-contracts

hub checkout -b "$branchName"
cp ../codeSnippets/index.json ./versions/v1/js-sdk-examples.json
hub add ./versions/v1/js-sdk-examples.json
hub commit -m "feat: update js code samples for sdk version $packageVersion"
git push origin "$branchName"
hub pull-request --no-edit -a polomani -r martincognite,f1cognite

cd ../
rm -rf service-contracts
rm -rf codeSnippets

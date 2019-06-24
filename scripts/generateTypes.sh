yarn add --dev cognitedata/openapi-spec-merger#feat/convertInlineSchemasToExplicit
yarn add --dev cognitedata/dtsgenerator#feat/typeMappings
yarn add --dev cognitedata/service-contracts
# fetch newest service-contracts
yarn upgrade @cognite/service-contracts

# unhide 3d viewer stuff from config
node -e "const fs = require('fs');\
const configFile = fs.readFileSync('./node_modules/@cognite/service-contracts/versions/v1/oas-config.json');\
const configJson = JSON.parse(configFile.toString());\
configJson.includes.push({ localPath: './threed_private.yml'});\
fs.writeFileSync('./node_modules/@cognite/service-contracts/versions/v1/oas-config-modified.json', JSON.stringify(configJson, null, 2));"

# merge service-contracts to JSON
node ./node_modules/@cognite/oas-merger/src/cli -c ./node_modules/@cognite/service-contracts/versions/v1/oas-config-modified.json -f ./v1.json

cd ./node_modules/dtsgenerator
yarn
yarn build
cd ./../../scripts

# generate types and do some post generation rain-dance
node ../node_modules/dtsgenerator/bin/dtsgen --out ../src/types/types.ts ../v1.json  -n ""
printf '%s\n%s\n' "// Copyright 2019 Cognite AS" "$(cat ../src/types/types.ts)" > ../src/types/types.ts
sed -i "" 's/declare type/export type/g' ../src/types/types.ts
sed -i "" 's/declare interface/export interface/g' ../src/types/types.ts
sed -i "" 's/declare namespace/export declare namespace/g' ../src/types/types.ts

rm ../v1.json
rm ../node_modules/@cognite/service-contracts/versions/v1/oas-config-modified.json

# run linter
yarn lint --fix
yarn remove @cognite/oas-merger @cognite/service-contracts

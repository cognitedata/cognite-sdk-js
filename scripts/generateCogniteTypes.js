const fs = require('fs');
const SwaggerParser = require('swagger-parser');
const dtsGenerator = require('dtsgenerator').default;

async function main() {
  const openApi = await SwaggerParser.bundle('https://storage.googleapis.com/cognitedata-api-docs/openapi.0.6.json');
  let dts = await dtsGenerator({
    contents: [openApi],
  });
  // make declaration file importable
  dts = dts.replace('declare namespace Components', 'export namespace Components');
  dts = dts.replace('namespace Schemas', 'export namespace Schemas');
  dts = dts.replace('declare namespace Paths', 'export namespace Paths');
  
  // remove invalid part of the spec
  dts = dts.replace(/empty\?: boolean;/g, '');
  
  // export un-exported namespaces
  // dts = dts.replace(/^\s+namespace /gm, 'export namespace ');
  dts = dts.replace(/(?<!export )namespace /gm, 'export namespace ');
  
  fs.writeFileSync('./src/types/cogniteApi/index.d.ts', dts);
}

main().catch(console.err);

// Copyright 2022 Cognite AS
import yargs, { CommandModule, Options } from 'yargs';
import { generateTypes } from './generate';
import { updateSnapshot } from './snapshot';

const packageOptions: Options = {
  required: true,
  describe: 'SDK package (e.g. stable, beta)',
  type: 'string',
};

const fetchLatestCommand: CommandModule = {
  command: 'fetch-latest',
  describe:
    'Fetch latest published Cognite OpenAPI document. Note that you will also need to run the command to generate types afterwards',
  builder: (yargs) => yargs.option('package', packageOptions),
  handler: async (argv) => {
    await updateSnapshot({
      package: argv.package as string,
    });
  },
};

const generateTypesCommand: CommandModule = {
  command: 'generate-types',
  describe: 'Generate types for configured services',
  builder: (yargs) => yargs.option('package', packageOptions),
  handler: async (argv) => {
    await generateTypes({
      package: argv.package as string,
    });
  },
};

async function main(): Promise<void> {
  await yargs(process.argv.slice(2))
    .version(false)
    .scriptName('codegen')
    .locale('en')
    .recommendCommands()
    .command(fetchLatestCommand)
    .command(generateTypesCommand)
    .demandCommand()
    .strict()
    .parse();
}

(async () => {
  await main();
})();

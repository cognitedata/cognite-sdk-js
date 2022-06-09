// Copyright 2022 Cognite AS
import yargs, { CommandModule, Options } from 'yargs';
import { createConfiguration } from './configuration';
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
    const nodeVersion = process.versions.node.split('.');
    const majorVersion = parseInt(nodeVersion[0]);
    if (majorVersion < 16) {
      throw new Error('NodeJS version must be v16 or higher');
    }

    await generateTypes({
      package: argv.package as string,
    });
  },
};

const configureCommand: CommandModule = {
  command: 'configure',
  describe: 'Create configuration file to enable type generation for a service',
  builder: (yargs) =>
    yargs
      .option('package', packageOptions)
      .option('service', {
        describe: 'REST service to configure types for',
        type: 'string',
      })
      .option('version', {
        describe: 'Cognite API version (v1, playground)',
        type: 'string',
      }),
  handler: async (argv) => {
    await createConfiguration({
      package: argv.package as string,
      service: argv.service as string | undefined,
      version: argv.version as string | undefined,
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
    .command(configureCommand)
    .demandCommand()
    .strict()
    .parse();
}

(async () => {
  await main();
})();

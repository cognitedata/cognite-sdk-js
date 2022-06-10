import { ConfigureCommand } from '../../packages/codegen/src';
import { yargsBase } from './command';

const cmd = new ConfigureCommand();

const parser = yargsBase().options({
    package: { type: 'string', demand: true, describe: "Js sdk package (stable, beta, etc.)" },
    service: { type: 'string', demand: false, describe: "REST service to generate types for" },
    version: { type: 'string', demand: false, describe: "Cognite api version (v1, playground, etc.)" },
}).command("create", "create a configuration", (y) => y, async (argv) => {
    await cmd.create({
        package: argv.package,
        service: argv.service,
        version: argv.version,
    });
});


(async() => {
    await parser.argv;
})();

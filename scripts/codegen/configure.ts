import { ConfigureCommand } from '../../packages/codegen/src';
import { yargsBase } from './command';

const cmd = new ConfigureCommand();

const parser = yargsBase().options({
    package: { type: 'string', demand: true, describe: "Js sdk package (stable, beta, etc.)" },
    service: { type: 'string', demand: false, describe: "REST service to generate types for" },
    version: { type: 'string', demand: false, describe: "Cognite api version (v1, playground, etc.)" },
}).command("create", "create a configuration", (y) => y, async (argv) => {
    await cmd.create(argv);
}).command("validate", "validate configuration", (y) => y, async (argv) => {
    await cmd.validate(argv);
}).command("delete", "delete a configuration", (y) => y, async (argv) => {
    await cmd.delete({...argv});
});


(async() => {
    await parser.argv;
})();

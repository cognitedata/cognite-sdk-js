import { SnapshotCommand } from '../../packages/codegen/src';
import { yargsBase } from './command';

const cmd = new SnapshotCommand();

const parser = yargsBase().options({
    package: { type: 'string', demand: true,  describe: "Js sdk package (stable, beta, etc.)" },
    service: { type: 'string', demand: false, describe: "REST service to generate types for" },
    version: { type: 'string', demand: false, describe: "Cognite api snapshot (v1, playground, etc.)" },
    "from-path": { type: 'string', demand: false, describe: "Specify a local openapi spec instead" },
}).command("update", "update a snapshot", (y) => y, async (argv) => {
    await cmd.update({...argv});
}).command("delete", "delete a snapshot", (y) => y, async (argv) => {
    await cmd.delete({...argv});
});


(async() => {
    await parser.argv;
})();

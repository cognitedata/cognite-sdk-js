import { VersionFileCommand } from '../../packages/codegen/src';
import { yargsBase } from './command';

const cmd = new VersionFileCommand();

const parser = yargsBase().options({
    package: { type: 'string', demand: true,  describe: "Js sdk package (stable, beta, etc.)" },
    service: { type: 'string', demand: false, describe: "REST service to generate types for" },
    version: { type: 'string', demand: false, describe: "Cognite api snapshot (v1, playground, etc.)" },
    "from-path": { type: 'string', demand: false, describe: "Specify a local openapi spec instead" },
}).command("create", "create a snapshot", (y) => y, async (argv) => {
    try {
        await cmd.create({...argv});
        console.log("ok");
    } catch (error) {
        console.error("ERROR: unable to create snapshot: " + error)
    }
}).command("update", "update a snapshot", (y) => y, async (argv) => {
    try {
        await cmd.update({...argv});
        console.log("ok");
    } catch (error) {
        console.error("ERROR: unable to update snapshot: " + error)
    }
}).command("delete", "delete a snapshot", (y) => y, async (argv) => {
    try {
        await cmd.delete({...argv});
        console.log("ok");
    } catch (error) {
        console.error("ERROR: unable to delete snapshot: " + error)
    }
});


(async() => {
    await parser.argv;
})();

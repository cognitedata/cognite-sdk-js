import { VersionFileCommand } from '../../packages/codegen/src';
import { yargsBase } from './command';

const cmd = new VersionFileCommand();

const parser = yargsBase().options({
    package: { type: 'string', demand: true,  describe: "Js sdk package (stable, beta, etc.)" },
    service: { type: 'string', demand: false, describe: "REST service to generate types for" },
    version: { type: 'string', demand: false, describe: "Cognite api version (v1, playground, etc.)" },
    "from-path": { type: 'string', demand: false, describe: "Specify a local openapi spec instead" },
}).command("create", "create a versionfile", (y) => y, async (argv) => {
    try {
        await cmd.create({...argv});
        console.log("ok");
    } catch (error) {
        console.error("ERROR: unable to create versionfile: " + error)
    }
}).command("update", "update a versionfile", (y) => y, async (argv) => {
    try {
        await cmd.update({...argv});
        console.log("ok");
    } catch (error) {
        console.error("ERROR: unable to update versionfile: " + error)
    }
}).command("delete", "delete a versionfile", (y) => y, async (argv) => {
    try {
        await cmd.delete({...argv});
        console.log("ok");
    } catch (error) {
        console.error("ERROR: unable to delete versionfile: " + error)
    }
});


(async() => {
    await parser.argv;
})();

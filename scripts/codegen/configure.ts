import { ConfigureCommand } from '../../packages/codegen/src';
import { yargsBase } from './command';

const cmd = new ConfigureCommand();

const parser = yargsBase().options({
    package: { type: 'string', demand: true, describe: "Js sdk package (stable, beta, etc.)" },
    service: { type: 'string', demand: true, describe: "REST service to generate types for" },
    version: { type: 'string', demand: true, describe: "Cognite api version (v1, playground, etc.)" },
    "versionfile-scope": { type: 'string', default: "package", describe: "Whether a service should use the global or local versionfile" },
}).command("create", "create a configuration", (y) => y, async (argv) => {
    try {
        let config = argv;
        if (typeof argv['versionfile-scope'] !== "undefined") {
            config["scope"] = argv['versionfile-scope'];
        }
        await cmd.create(config);
        console.log("ok");
    } catch (error) {
        console.error("ERROR: unable to create config: " + error)
    }
}).command("update", "update a configuration", (y) => y, async (argv) => {
    try {
        let config = argv;
        if (typeof argv['versionfile-scope'] !== "undefined") {
            config["scope"] = argv['versionfile-scope'];
        }
        await cmd.update(config);
        console.log("ok");
    } catch (error) {
        console.error("ERROR: unable to update config: " + error)
    }
}).command("delete", "delete a configuration", (y) => y, async (argv) => {
    try {
        await cmd.delete({...argv});
        console.log("ok");
    } catch (error) {
        console.error("ERROR: unable to delete config: " + error)
    }
});


(async() => {
    await parser.argv;
})();

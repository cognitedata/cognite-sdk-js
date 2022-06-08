import { ConfigFileUpdateOptions, ConfigureCommand } from '../../packages/codegen/src';
import { yargsBase } from './command';

const cmd = new ConfigureCommand();

const snapshotArg = 'snapshot-scope';

const extractConfig = (argv: Record<string, any>) => {
    const args: any = {};
    args.version = "version";
    args.service = "service";
    args.package = "package";
    args[snapshotArg] = "scope";

    const config = Object.keys(args)
        .filter(name => typeof argv[name] !== "undefined")
        .reduce((acc, name) => Object.assign(acc, {[args[name]]: argv[name]}), {} as ConfigFileUpdateOptions);

    return config;
}

const parser = yargsBase().options({
    package: { type: 'string', demand: true, describe: "Js sdk package (stable, beta, etc.)" },
    service: { type: 'string', demand: true, describe: "REST service to generate types for" },
    version: { type: 'string', demand: true, describe: "Cognite api version (v1, playground, etc.)" },
    'snapshot-scope': { type: 'string', default: "package", describe: "Whether a service should use the package or service unique open api snapshot" },
}).command("create", "create a configuration", (y) => y, async (argv) => {
    try {
        const config = extractConfig(argv)
        await cmd.create(config);
        console.log("ok");
    } catch (error) {
        console.error("ERROR: unable to create config: " + error)
    }
}).command("update", "update a configuration", (y) => y, async (argv) => {
    try {
        const config = extractConfig(argv)
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

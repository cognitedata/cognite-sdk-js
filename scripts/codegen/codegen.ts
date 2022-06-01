import { CodeGenCommand } from '../../packages/codegen/src';
import { yargsBase } from './command';

const cmd = new CodeGenCommand();

const parser = yargsBase().options({
    package: { type: 'string', demand: true,  describe: "Js sdk package (stable, beta, etc.)" },
    service: { type: 'string', demand: false, describe: "REST service to generate types for" },
}).command("generate", "generate types for configured services", (y) => y, async (argv) => {
    const nodeVersion = process.versions.node.split(".");
    const majorVersion = parseInt(nodeVersion[0]);
    if (majorVersion < 16) {
        console.error("NodeJS version must be v16 or higher");
        process.exit(1);
    }

    try {
        await cmd.generate({...argv});
        console.log("ok");
    } catch (error) {
        console.error("ERROR: unable to generate types: " + error);
    }
});


(async() => {
    await parser.argv;
})();

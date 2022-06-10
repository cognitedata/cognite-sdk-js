import { SnapshotCommand } from '../../packages/codegen/src';
import { yargsBase } from './command';

const cmd = new SnapshotCommand();

const parser = yargsBase().options({
    package: { type: 'string', demand: true,  describe: "Js sdk package (stable, beta, etc.)" },
}).command("update", "update a snapshot", (y) => y, async (argv) => {
    await cmd.update({
        package: argv.package,
    });
});


(async() => {
    await parser.argv;
})();

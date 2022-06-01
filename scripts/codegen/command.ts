import { Argv } from 'yargs';
import yargs from 'yargs/yargs';

export const yargsBase = (): Argv => {
    return yargs(process.argv.slice(2))
        .version(false)
        .demandCommand()
        .recommendCommands()
        .strict();
}
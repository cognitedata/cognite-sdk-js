const { TypescriptParser } = require('typescript-parser');
const { readFileSync, writeFileSync } = require('fs');
const Comments = require('parse-comments');
const argv = require('yargs').argv;

const comments = new Comments();
const parser = new TypescriptParser();

const FILENAME = argv.i;
const HEADER = argv.h;

(async () => {
    try {
        const original = readFileSync(FILENAME).toString();
        const parsedCode = await parser.parseFile(FILENAME);
        let result = HEADER + '\n';
        const parsedComments = comments.parse(original);
        const mapCodeToComment = {};
        for (comment of parsedComments) {
            mapCodeToComment[comment.codeStart] = comment.raw;
        }
        parsedCode.declarations.sort((a, b) => (a.name < b.name) ? -1 : 1);
        for (declaration of parsedCode.declarations) {
            const { start, end } = declaration;
            if (mapCodeToComment[start]) {
                result += '\n/*' + mapCodeToComment[start] + '*/';
            }
            result += '\n' + original.substring(start, end) + '\n';
        }
        writeFileSync(FILENAME, result);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();

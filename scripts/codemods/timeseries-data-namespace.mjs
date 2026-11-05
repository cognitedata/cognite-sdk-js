#!/usr/bin/env node
/**
 * Codemod: move data point and synthetic query calls under `client.timeseries`.
 *
 *   client.datapoints.<insert|retrieve|retrieveLatest|delete>
 *     -> client.timeseries.data.<...>
 *   client.timeseries.syntheticQuery(...)
 *     -> client.timeseries.synthetic.query(...)
 *
 * Only the access path is rewritten. Request bodies are NOT touched: moving from
 * `id` / `externalId` to `instanceId` needs a space and cannot be inferred. See
 * guides/DEPRECATIONS.md.
 *
 * Usage:
 *   node timeseries-data-namespace.mjs [--dry] [--client-names=a,b] <file|dir>...
 *
 * `typescript` is resolved from the current working directory first.
 *
 * To avoid rewriting unrelated `.datapoints` properties (for example on a
 * retrieve response), the receiver must look like an SDK client: its last
 * identifier is `client`, `cogniteClient`, or matches /client/i, or is listed
 * in --client-names. Anything else is left alone.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function loadTypescript() {
  try {
    return createRequire(path.join(process.cwd(), 'noop.js'))('typescript');
  } catch {
    return (await import('typescript')).default;
  }
}

const ts = await loadTypescript();

const DATAPOINT_METHODS = new Set([
  'insert',
  'retrieve',
  'retrieveLatest',
  'delete',
]);
const EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
]);
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  'build',
  'coverage',
]);

function scriptKindFor(fileName) {
  switch (path.extname(fileName)) {
    case '.tsx':
      return ts.ScriptKind.TSX;
    case '.jsx':
      return ts.ScriptKind.JSX;
    case '.js':
    case '.mjs':
    case '.cjs':
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.TS;
  }
}

/** Last identifier of an expression such as `a.b.client` or `this.client`. */
function lastName(expr) {
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
  if (ts.isNonNullExpression(expr) || ts.isParenthesizedExpression(expr)) {
    return lastName(expr.expression);
  }
  return undefined;
}

/**
 * @param {string} source
 * @param {string} fileName
 * @param {{ clientNames?: string[] }} [options]
 * @returns {{ output: string, changes: number, warnings: string[] }}
 */
export function transform(source, fileName, options = {}) {
  const extra = new Set(options.clientNames ?? []);
  const isClient = (expr) => {
    const name = lastName(expr);
    return name !== undefined && (extra.has(name) || /client/i.test(name));
  };

  const sf = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(fileName)
  );
  const edits = [];
  const warnings = [];
  const where = (node) => {
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    return `${fileName}:${line + 1}`;
  };

  const visit = (node) => {
    if (ts.isPropertyAccessExpression(node)) {
      const name = node.name.text;
      const parent = node.parent;
      // <client>.datapoints, with a known method or used as a value
      if (name === 'datapoints' && isClient(node.expression)) {
        const isMethodCall =
          ts.isPropertyAccessExpression(parent) &&
          parent.expression === node &&
          DATAPOINT_METHODS.has(parent.name.text);
        const isBareValue = !(
          ts.isPropertyAccessExpression(parent) && parent.expression === node
        );
        if (isMethodCall || isBareValue) {
          edits.push([
            node.name.getStart(sf),
            node.name.getEnd(),
            'timeseries.data',
          ]);
        }
      }
      // <client>.timeseries.syntheticQuery
      if (
        name === 'syntheticQuery' &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === 'timeseries' &&
        isClient(node.expression.expression)
      ) {
        edits.push([
          node.name.getStart(sf),
          node.name.getEnd(),
          'synthetic.query',
        ]);
      }
    }
    // const { datapoints } = client  /  const { syntheticQuery } = client.timeseries
    if (
      ts.isVariableDeclaration(node) &&
      ts.isObjectBindingPattern(node.name) &&
      node.initializer
    ) {
      for (const el of node.name.elements) {
        const prop = (el.propertyName ?? el.name).getText(sf);
        const init = node.initializer;
        if (
          (prop === 'datapoints' && isClient(init)) ||
          (prop === 'syntheticQuery' &&
            ts.isPropertyAccessExpression(init) &&
            init.name.text === 'timeseries' &&
            isClient(init.expression))
        ) {
          warnings.push(
            `${where(el)}: destructured '${prop}' not rewritten, migrate by hand`
          );
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  let output = source;
  for (const [start, end, text] of edits.sort((a, b) => b[0] - a[0])) {
    output = output.slice(0, start) + text + output.slice(end);
  }
  return { output, changes: edits.length, warnings };
}

function* walk(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (EXTENSIONS.has(path.extname(target)) && !target.endsWith('.d.ts')) {
      yield target;
    }
    return;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    yield* walk(path.join(target, entry.name));
  }
}

function main(argv) {
  const dry = argv.includes('--dry');
  const clientNames = argv
    .filter((a) => a.startsWith('--client-names='))
    .flatMap((a) => a.slice('--client-names='.length).split(','))
    .filter(Boolean);
  const targets = argv.filter((a) => !a.startsWith('--'));
  if (targets.length === 0) {
    console.error(
      'Usage: node timeseries-data-namespace.mjs [--dry] [--client-names=a,b] <file|dir>...'
    );
    process.exit(2);
  }
  let files = 0;
  let changes = 0;
  for (const target of targets) {
    for (const file of walk(target)) {
      const source = fs.readFileSync(file, 'utf8');
      const result = transform(source, file, { clientNames });
      for (const w of result.warnings) console.warn(`warning: ${w}`);
      if (result.changes === 0) continue;
      files++;
      changes += result.changes;
      console.log(
        `${dry ? 'would update' : 'updated'} ${file} (${result.changes})`
      );
      if (!dry) fs.writeFileSync(file, result.output);
    }
  }
  console.log(
    `${changes} change(s) in ${files} file(s)${dry ? ' (dry run)' : ''}`
  );
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  main(process.argv.slice(2));
}

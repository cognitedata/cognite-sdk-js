#!/usr/bin/env node
/**
 * Codemod: move data point and synthetic query calls under `client.timeseries`.
 *
 *   client.datapoints.<insert|retrieve|retrieveLatest|
 *                      retrieveDatapointMonthlyAggregates|delete>
 *     -> client.timeseries.data.<...>
 *   client.timeseries.syntheticQuery(...)
 *     -> client.timeseries.synthetic.query(...)
 *
 * Only the access path is rewritten. Request bodies are NOT touched: moving from
 * `id` / `externalId` to `instanceId` needs a space and cannot be inferred. See
 * guides/DEPRECATIONS.md.
 *
 * Type-level references to the client are rewritten the same way:
 *   CogniteClient['datapoints']
 *     -> CogniteClient['timeseries']['data']
 *   CogniteClient['timeseries']['syntheticQuery']
 *     -> CogniteClient['timeseries']['synthetic']['query']
 *   typeof client.datapoints.retrieve
 *     -> typeof client.timeseries.data.retrieve
 *
 * Reported as warnings, and left for you to migrate by hand:
 *   - a `datapoints` member of your own client type that is typed from the old
 *     path, for example `{ datapoints: Pick<CogniteClient['datapoints'], 'retrieve'> }`:
 *     it has to move under `timeseries.data`, which is not a rename;
 *   - `<x>.datapoints.<method>` and `<x>.timeseries.syntheticQuery` on a receiver
 *     that is not recognized as a client (see below): it is not rewritten, because
 *     `x.datapoints.delete(...)` may be a Map, but the old path still compiles and
 *     nothing else would point it out.
 * Mock objects such as `{ datapoints: { retrieve: vi.fn() } }` are not detected:
 * migrate them by hand.
 *
 * The codemod keeps your formatting but does not format. The new access path is
 * longer, so run your formatter (for example `prettier --write`) on the changed
 * files afterwards. Symlinks are not followed.
 *
 * Usage:
 *   node timeseries-data-namespace.mjs [--dry] [--client-names=a,b] <file|dir>...
 *
 * `typescript` is resolved from the current working directory first.
 *
 * Which receivers are rewritten. By default by name, so that an unrelated
 * `.datapoints` property (for example on a retrieve response) is left alone: the
 * receiver's last identifier matches /client/i or is listed in --client-names, or
 * it is a call to a client accessor such as `useSDK()`, `getClient()` or
 * `useCogniteClient()`.
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

// The methods of the data points API, which `client.datapoints` and
// `client.timeseries.data` share.
const DATAPOINT_METHODS = new Set([
  'insert',
  'retrieve',
  'retrieveLatest',
  'retrieveDatapointMonthlyAggregates',
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

function entityLastName(name) {
  return ts.isIdentifier(name) ? name.text : name.right.text;
}

/** Last identifier of a type such as `CogniteClient` or `typeof this.client`. */
function typeLastName(type) {
  if (ts.isTypeReferenceNode(type)) return entityLastName(type.typeName);
  if (ts.isTypeQueryNode(type)) return entityLastName(type.exprName);
  if (ts.isParenthesizedTypeNode(type)) return typeLastName(type.type);
  return undefined;
}

/** The string literal of `T['key']`, or undefined for any other type node. */
function indexLiteral(node) {
  return ts.isIndexedAccessTypeNode(node) &&
    ts.isLiteralTypeNode(node.indexType) &&
    ts.isStringLiteral(node.indexType.literal)
    ? node.indexType.literal
    : undefined;
}

/** Whether a qualified name is the operand of a `typeof` type: `typeof a.b.c`. */
function inTypeQuery(name) {
  let parent = name.parent;
  while (ts.isQualifiedName(parent)) parent = parent.parent;
  return ts.isTypeQueryNode(parent);
}

/** `x.name` or `x['name']`; undefined for any other expression. */
function memberOf(node) {
  if (ts.isPropertyAccessExpression(node)) {
    return { name: node.name.text, nameNode: node.name, element: false };
  }
  if (
    ts.isElementAccessExpression(node) &&
    ts.isStringLiteralLike(node.argumentExpression)
  ) {
    return {
      name: node.argumentExpression.text,
      nameNode: node.argumentExpression,
      element: true,
    };
  }
  return undefined;
}

/**
 * How `node` is used when it is the receiver of a member access: `{ name }`
 * (`name` is undefined for a computed key). Undefined when it is used as a value.
 */
function accessedAs(node) {
  const parent = node.parent;
  const isAccess =
    (ts.isPropertyAccessExpression(parent) ||
      ts.isElementAccessExpression(parent)) &&
    parent.expression === node;
  return isAccess ? { name: memberOf(parent)?.name } : undefined;
}

const unwrap = (expr) =>
  ts.isNonNullExpression(expr) || ts.isParenthesizedExpression(expr)
    ? unwrap(expr.expression)
    : expr;

/**
 * @param {string} source
 * @param {string} fileName
 * @param {{ clientNames?: string[] }} [options]
 * @returns {{ output: string, changes: number, warnings: string[] }}
 */
export function transform(source, fileName, options = {}) {
  const sf = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(fileName)
  );

  const extra = new Set(options.clientNames ?? []);
  const isClientName = (name) =>
    name !== undefined && (extra.has(name) || /client/i.test(name));
  // A call such as `useSDK()` or `getClient()`: judged by the function's name,
  // which has to be an accessor for the client (`useSDK`, `getClient`,
  // `useCogniteClient`, `createClient`), not just contain the word: a function
  // like `getClientData()` returns something else.
  const CLIENT_ACCESSOR = /^(use|get|create)?(cognite)?(client|sdk)$/i;
  const isClient = (expr) => {
    const inner = unwrap(expr);
    if (ts.isCallExpression(inner)) {
      const name = lastName(inner.expression);
      return (
        name !== undefined && (extra.has(name) || CLIENT_ACCESSOR.test(name))
      );
    }
    return isClientName(lastName(inner));
  };
  const isClientType = (type) => isClientName(typeLastName(type));

  const isClientOwner = (typeNode) => isClientType(typeNode);

  // Type-level forms. `<Client>['datapoints']` and `<Client>['timeseries']['data']`
  // are the same member before and after the rewrite, so the warning below stays
  // visible when the codemod is run again.
  const isTimeseriesOf = (node) =>
    indexLiteral(node)?.text === 'timeseries' && isClientOwner(node.objectType);
  const isDatapointsType = (node) =>
    indexLiteral(node)?.text === 'datapoints' && isClientOwner(node.objectType);
  const isTimeseriesDataType = (node) =>
    indexLiteral(node)?.text === 'data' && isTimeseriesOf(node.objectType);
  const isSyntheticQueryType = (node) =>
    indexLiteral(node)?.text === 'syntheticQuery' &&
    isTimeseriesOf(node.objectType);
  const containsClientDataType = (node) =>
    isDatapointsType(node) ||
    isTimeseriesDataType(node) ||
    ts.forEachChild(node, containsClientDataType) === true;

  const edits = [];
  const warnings = [];
  const where = (node) => {
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    return `${fileName}:${line + 1}`;
  };

  // Replaces the member name of `x.name` / `x['name']` with a path, keeping the
  // quote style of an element access: ['datapoints'] -> ['timeseries']['data'].
  const rewriteMember = (m, keys) => {
    const q = m.nameNode.getText(sf)[0];
    const text = m.element
      ? keys.map((key) => `${q}${key}${q}`).join('][')
      : keys.join('.');
    edits.push([m.nameNode.getStart(sf), m.nameNode.getEnd(), text]);
  };
  // A receiver that is not recognized as a client is never rewritten, because
  // `x.datapoints.delete(...)` may be a Map. It is reported so that it is not
  // lost, since the old path still compiles and nothing else would flag it.
  const warnUnrecognized = (node, what, receiver) => {
    const text = unwrap(receiver).getText(sf);
    const shown = text.length > 40 ? `${text.slice(0, 37)}...` : text;
    warnings.push(
      `${where(node)}: ${what} looks like the SDK, but '${shown}' is not recognized as a client and was left alone. Add its name to --client-names or migrate it by hand`
    );
  };

  const visit = (node) => {
    const m = memberOf(node);
    // <client>.datapoints, with a known method or used as a value
    if (m?.name === 'datapoints') {
      const accessed = accessedAs(node);
      const isMethodCall =
        accessed?.name !== undefined && DATAPOINT_METHODS.has(accessed.name);
      const isBareValue = accessed === undefined;
      if (isMethodCall || isBareValue) {
        if (isClient(node.expression)) {
          rewriteMember(m, ['timeseries', 'data']);
        } else if (isMethodCall) {
          warnUnrecognized(
            node,
            `.datapoints.${accessed.name}`,
            node.expression
          );
        }
      }
    }
    // <client>.timeseries.syntheticQuery
    if (
      m?.name === 'syntheticQuery' &&
      memberOf(node.expression)?.name === 'timeseries'
    ) {
      if (isClient(node.expression.expression)) {
        rewriteMember(m, ['synthetic', 'query']);
      } else {
        warnUnrecognized(
          node,
          '.timeseries.syntheticQuery',
          node.expression.expression
        );
      }
    }
    // typeof client.datapoints.retrieve -> typeof client.timeseries.data.retrieve
    if (ts.isQualifiedName(node) && inTypeQuery(node)) {
      if (
        node.right.text === 'datapoints' &&
        isClientName(entityLastName(node.left))
      ) {
        edits.push([
          node.right.getStart(sf),
          node.right.getEnd(),
          'timeseries.data',
        ]);
      }
      if (
        node.right.text === 'syntheticQuery' &&
        ts.isQualifiedName(node.left) &&
        node.left.right.text === 'timeseries' &&
        isClientName(entityLastName(node.left.left))
      ) {
        edits.push([
          node.right.getStart(sf),
          node.right.getEnd(),
          'synthetic.query',
        ]);
      }
    }
    // CogniteClient['datapoints'] -> CogniteClient['timeseries']['data']
    // CogniteClient['timeseries']['syntheticQuery']
    //   -> CogniteClient['timeseries']['synthetic']['query']
    for (const [matches, keys] of [
      [isDatapointsType, ['timeseries', 'data']],
      [isSyntheticQueryType, ['synthetic', 'query']],
    ]) {
      if (matches(node)) {
        const literal = indexLiteral(node);
        const q = literal.getText(sf)[0];
        edits.push([
          literal.getStart(sf),
          literal.getEnd(),
          keys.map((key) => `${q}${key}${q}`).join(']['),
        ]);
      }
    }
    // { datapoints: Pick<CogniteClient['datapoints'], ...> }: the member itself
    // has to move under `timeseries.data`, which cannot be done mechanically.
    if (
      ts.isPropertySignature(node) &&
      node.type &&
      (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) &&
      node.name.text === 'datapoints' &&
      containsClientDataType(node.type)
    ) {
      warnings.push(
        `${where(node)}: member 'datapoints' of a client type not renamed, move it under timeseries.data by hand`
      );
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
    // `Dirent.isDirectory()` is false for a symlink, so the skip list is matched
    // by name, and symlinks are never followed: a linked `node_modules` or a
    // dangling link must not be walked, and a linked file must not be written
    // through.
    if (SKIP_DIRS.has(entry.name) || entry.isSymbolicLink()) continue;
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
  // Check every target before touching any file, so a typo cannot leave a
  // half-applied run behind.
  for (const target of targets) {
    if (!fs.existsSync(target)) {
      console.error(`error: ${target} does not exist`);
      process.exit(2);
    }
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
  if (changes > 0 && !dry) {
    console.log(
      'Run your formatter (for example prettier --write) on the changed files: the new access path is longer.'
    );
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  main(process.argv.slice(2));
}

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
 *   - `Pick` / `Omit` over the client that names a moved key, and destructuring
 *     (`const { datapoints } = client`, `({ datapoints }: CogniteClient)`);
 *   - `<x>.datapoints.<method>` and `<x>.timeseries.syntheticQuery` on a receiver
 *     that is not recognized as a client (see below): it is not rewritten, because
 *     `x.datapoints.delete(...)` may be a Map, but the old path still compiles and
 *     nothing else would point it out.
 * Mock objects such as `{ datapoints: { retrieve: vi.fn() } }` are not detected:
 * migrate them by hand.
 *
 * The codemod keeps your formatting but does not format. The new access path is
 * longer, so run your formatter (for example `prettier --write`) on the changed
 * files afterwards. Files are parsed with ts-morph and edited as text, only at the
 * property name. Symlinks are not followed.
 *
 * Usage:
 *   node timeseries-data-namespace.mjs [--dry] [--client-names=a,b] <file|dir>...
 *
 * Which receivers are rewritten. By default by name, so that an unrelated
 * `.datapoints` property (for example on a retrieve response) is left alone: the
 * receiver's last identifier matches /client/i or is listed in --client-names, or
 * it is a call to a client accessor such as `useSDK()`, `getClient()` or
 * `useCogniteClient()`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Node, Project } from 'ts-morph';

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

// Files are read and written by this script, so ts-morph only parses: an in-memory
// file system, and no type checking or module resolution.
const project = new Project({
  useInMemoryFileSystem: true,
  skipAddingFilesFromTsConfig: true,
  skipFileDependencyResolution: true,
  compilerOptions: { allowJs: true },
});

/** Last identifier of an expression such as `a.b.client` or `this.client`. */
function lastName(expr) {
  if (Node.isIdentifier(expr)) return expr.getText();
  if (Node.isPropertyAccessExpression(expr)) return expr.getName();
  if (Node.isNonNullExpression(expr) || Node.isParenthesizedExpression(expr)) {
    return lastName(expr.getExpression());
  }
  return undefined;
}

const unwrap = (expr) =>
  Node.isNonNullExpression(expr) || Node.isParenthesizedExpression(expr)
    ? unwrap(expr.getExpression())
    : expr;

function entityLastName(name) {
  return Node.isIdentifier(name) ? name.getText() : name.getRight().getText();
}

/** Last identifier of a type such as `CogniteClient` or `typeof this.client`. */
function typeLastName(type) {
  if (Node.isTypeReference(type)) return entityLastName(type.getTypeName());
  if (Node.isTypeQuery(type)) return entityLastName(type.getExprName());
  if (Node.isParenthesizedTypeNode(type)) {
    return typeLastName(type.getTypeNode());
  }
  return undefined;
}

/** The string literal of `T['key']`, or undefined for any other type node. */
function indexLiteral(node) {
  if (!Node.isIndexedAccessTypeNode(node)) return undefined;
  const index = node.getIndexTypeNode();
  if (!Node.isLiteralTypeNode(index)) return undefined;
  const literal = index.getLiteral();
  return Node.isStringLiteral(literal) ? literal : undefined;
}

/** Whether a qualified name is the operand of a `typeof` type: `typeof a.b.c`. */
function inTypeQuery(name) {
  let parent = name.getParent();
  while (Node.isQualifiedName(parent)) parent = parent.getParent();
  return Node.isTypeQuery(parent);
}

/** The string literals of a key type such as `'a' | 'b'`. */
function keyLiterals(type) {
  if (Node.isLiteralTypeNode(type)) {
    const literal = type.getLiteral();
    return Node.isStringLiteral(literal) ? [literal.getLiteralText()] : [];
  }
  if (Node.isUnionTypeNode(type)) {
    return type.getTypeNodes().flatMap(keyLiterals);
  }
  if (Node.isParenthesizedTypeNode(type)) {
    return keyLiterals(type.getTypeNode());
  }
  return [];
}

/** `x.name` or `x['name']`; undefined for any other expression. */
function memberOf(node) {
  if (Node.isPropertyAccessExpression(node)) {
    return {
      name: node.getName(),
      nameNode: node.getNameNode(),
      element: false,
    };
  }
  if (Node.isElementAccessExpression(node)) {
    const key = node.getArgumentExpression();
    if (
      key &&
      (Node.isStringLiteral(key) || Node.isNoSubstitutionTemplateLiteral(key))
    ) {
      return { name: key.getLiteralText(), nameNode: key, element: true };
    }
  }
  return undefined;
}

/**
 * How `node` is used when it is the receiver of a member access: `{ name }`
 * (`name` is undefined for a computed key). Undefined when it is used as a value.
 */
function accessedAs(node) {
  const parent = node.getParent();
  const isAccess =
    (Node.isPropertyAccessExpression(parent) ||
      Node.isElementAccessExpression(parent)) &&
    parent.getExpression() === node;
  return isAccess ? { name: memberOf(parent)?.name } : undefined;
}

/**
 * @param {string} source
 * @param {string} fileName
 * @param {{ clientNames?: string[] }} [options]
 * @returns {{ output: string, changes: number, warnings: string[] }}
 */
export function transform(source, fileName, options = {}) {
  const sf = project.createSourceFile(
    path.posix.join('/', fileName.split(path.sep).join('/')),
    source,
    { overwrite: true }
  );
  try {
    return transformSourceFile(sf, source, fileName, options);
  } finally {
    project.removeSourceFile(sf);
  }
}

function transformSourceFile(sf, source, fileName, options) {
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
    if (Node.isCallExpression(inner)) {
      const name = lastName(inner.getExpression());
      return (
        name !== undefined && (extra.has(name) || CLIENT_ACCESSOR.test(name))
      );
    }
    return isClientName(lastName(inner));
  };
  const isClientType = (type) => isClientName(typeLastName(type));

  const isClientOwner = (typeNode) => isClientType(typeNode);
  const keysOf = (typeNode) => keyLiterals(typeNode);

  // Type-level forms. `<Client>['datapoints']` and `<Client>['timeseries']['data']`
  // are the same member before and after the rewrite, so the warning below stays
  // visible when the codemod is run again.
  const indexKey = (node) => indexLiteral(node)?.getLiteralText();
  const isTimeseriesOf = (node) =>
    indexKey(node) === 'timeseries' && isClientOwner(node.getObjectTypeNode());
  const isDatapointsType = (node) =>
    indexKey(node) === 'datapoints' && isClientOwner(node.getObjectTypeNode());
  const isTimeseriesDataType = (node) =>
    indexKey(node) === 'data' && isTimeseriesOf(node.getObjectTypeNode());
  const isSyntheticQueryType = (node) =>
    indexKey(node) === 'syntheticQuery' &&
    isTimeseriesOf(node.getObjectTypeNode());
  const isClientDataType = (node) =>
    isDatapointsType(node) || isTimeseriesDataType(node);
  const containsClientDataType = (node) =>
    isClientDataType(node) ||
    node.forEachDescendant((child) =>
      isClientDataType(child) ? true : undefined
    ) === true;

  const edits = [];
  const warnings = [];
  const where = (node) =>
    `${fileName}:${sf.getLineAndColumnAtPos(node.getStart()).line}`;

  // Replaces the member name of `x.name` / `x['name']` with a path, keeping the
  // quote style of an element access: ['datapoints'] -> ['timeseries']['data'].
  const rewriteMember = (m, keys) => {
    const q = m.nameNode.getText()[0];
    const text = m.element
      ? keys.map((key) => `${q}${key}${q}`).join('][')
      : keys.join('.');
    edits.push([m.nameNode.getStart(), m.nameNode.getEnd(), text]);
  };
  // A receiver that is not recognized as a client is never rewritten, because
  // `x.datapoints.delete(...)` may be a Map. It is reported so that it is not
  // lost, since the old path still compiles and nothing else would flag it.
  const warnUnrecognized = (node, what, receiver) => {
    const text = unwrap(receiver).getText();
    const shown = text.length > 40 ? `${text.slice(0, 37)}...` : text;
    warnings.push(
      `${where(node)}: ${what} looks like the SDK, but '${shown}' is not recognized as a client and was left alone. Add its name to --client-names or migrate it by hand`
    );
  };

  sf.forEachDescendant((node) => {
    const m = memberOf(node);
    // <client>.datapoints, with a known method or used as a value
    if (m?.name === 'datapoints') {
      const accessed = accessedAs(node);
      const isMethodCall =
        accessed?.name !== undefined && DATAPOINT_METHODS.has(accessed.name);
      const isBareValue = accessed === undefined;
      if (isMethodCall || isBareValue) {
        if (isClient(node.getExpression())) {
          rewriteMember(m, ['timeseries', 'data']);
        } else if (isMethodCall) {
          warnUnrecognized(
            node,
            `.datapoints.${accessed.name}`,
            node.getExpression()
          );
        }
      }
    }
    // <client>.timeseries.syntheticQuery
    if (
      m?.name === 'syntheticQuery' &&
      memberOf(node.getExpression())?.name === 'timeseries'
    ) {
      const receiver = node.getExpression().getExpression();
      if (isClient(receiver)) {
        rewriteMember(m, ['synthetic', 'query']);
      } else {
        warnUnrecognized(node, '.timeseries.syntheticQuery', receiver);
      }
    }
    // typeof client.datapoints.retrieve -> typeof client.timeseries.data.retrieve
    if (Node.isQualifiedName(node) && inTypeQuery(node)) {
      const right = node.getRight();
      const left = node.getLeft();
      if (
        right.getText() === 'datapoints' &&
        isClientName(entityLastName(left))
      ) {
        edits.push([right.getStart(), right.getEnd(), 'timeseries.data']);
      }
      if (
        right.getText() === 'syntheticQuery' &&
        Node.isQualifiedName(left) &&
        left.getRight().getText() === 'timeseries' &&
        isClientName(entityLastName(left.getLeft()))
      ) {
        edits.push([right.getStart(), right.getEnd(), 'synthetic.query']);
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
        const q = literal.getText()[0];
        edits.push([
          literal.getStart(),
          literal.getEnd(),
          keys.map((key) => `${q}${key}${q}`).join(']['),
        ]);
      }
    }
    // { datapoints: Pick<CogniteClient['datapoints'], ...> }: the member itself
    // has to move under `timeseries.data`, which cannot be done mechanically.
    if (Node.isPropertySignature(node)) {
      const nameNode = node.getNameNode();
      const typeNode = node.getTypeNode();
      const name = Node.isIdentifier(nameNode)
        ? nameNode.getText()
        : Node.isStringLiteral(nameNode)
          ? nameNode.getLiteralText()
          : undefined;
      if (
        typeNode &&
        name === 'datapoints' &&
        containsClientDataType(typeNode)
      ) {
        warnings.push(
          `${where(node)}: member 'datapoints' of a client type not renamed, move it under timeseries.data by hand`
        );
      }
    }
    // const { datapoints } = client  /  const { syntheticQuery } = client.timeseries
    // function f({ datapoints }: CogniteClient)
    if (Node.isObjectBindingPattern(node)) {
      const owner = node.getParent();
      const init = Node.isVariableDeclaration(owner)
        ? owner.getInitializer()
        : undefined;
      const type = Node.isParameterDeclaration(owner)
        ? owner.getTypeNode()
        : undefined;
      const fromClient = init
        ? isClient(init)
        : type !== undefined && isClientType(type);
      const fromTimeseries = init
        ? memberOf(init)?.name === 'timeseries' &&
          isClient(init.getExpression())
        : type !== undefined && isTimeseriesOf(type);
      for (const el of node.getElements()) {
        const key = el.getPropertyNameNode() ?? el.getNameNode();
        const prop = Node.isIdentifier(key)
          ? key.getText()
          : Node.isStringLiteral(key) ||
              Node.isNoSubstitutionTemplateLiteral(key)
            ? key.getLiteralText()
            : undefined;
        if (
          (prop === 'datapoints' && fromClient) ||
          (prop === 'syntheticQuery' && fromTimeseries)
        ) {
          warnings.push(
            `${where(el)}: destructured '${prop}' not rewritten, migrate by hand`
          );
        }
      }
    }
    // Pick<CogniteClient, 'datapoints'>: the key moved, which is not a rename.
    if (Node.isTypeReference(node)) {
      const typeName = node.getTypeName();
      const typeArgs = node.getTypeArguments();
      if (
        Node.isIdentifier(typeName) &&
        (typeName.getText() === 'Pick' || typeName.getText() === 'Omit') &&
        typeArgs.length === 2
      ) {
        const [owner, keys] = typeArgs;
        const moved = keysOf(keys);
        for (const [key, matches, moveTo] of [
          ['datapoints', isClientOwner(owner), 'timeseries.data'],
          [
            'syntheticQuery',
            isTimeseriesOf(owner),
            'timeseries.synthetic.query',
          ],
        ]) {
          if (matches && moved.includes(key)) {
            warnings.push(
              `${where(node)}: '${key}' in ${typeName.getText()}<...> not renamed, it moved to ${moveTo}: change the type by hand`
            );
          }
        }
      }
    }
  });

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

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
 * files afterwards. Symlinks are not followed.
 *
 * Usage:
 *   node timeseries-data-namespace.mjs [--dry] [--client-names=a,b]
 *        [--project=tsconfig.json]... <file|dir>...
 *
 * `typescript` is resolved from the current working directory first.
 *
 * Which receivers are rewritten. By default by name, so that an unrelated
 * `.datapoints` property (for example on a retrieve response) is left alone: the
 * receiver's last identifier matches /client/i or is listed in --client-names, or
 * it is a call to a client accessor such as `useSDK()`, `getClient()` or
 * `useCogniteClient()`.
 *
 * With `--project=<tsconfig>` (repeatable) the TypeScript type checker decides
 * instead of the name: a member is rewritten when it is the SDK's own, whatever
 * the receiver is called (`sdk.datapoints`, `useThing().datapoints`, an alias, a
 * type alias of CogniteClient). The SDK's response types also have a `datapoints`
 * member, and those are left alone. It needs the project's dependencies installed
 * so that `@cognite/sdk` resolves; where the checker cannot tell (an `any`
 * receiver, a file outside the project) the name rules above apply. Pass the
 * tsconfig that includes your sources, for example `tsconfig.app.json` and
 * `tsconfig.spec.json`, not a solution-style one that only has "references".
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

// Files of the SDK package, as the type checker sees them (the real path, so
// this also holds for pnpm's `.pnpm/@cognite+sdk@x/node_modules/@cognite/sdk`).
const SDK_FILE = /[\\/]node_modules[\\/]@cognite[\\/]sdk(-beta|-alpha)?[\\/]/;

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

/** The string literals of a key type such as `'a' | 'b'`. */
function keyLiterals(type) {
  if (ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal)) {
    return [type.literal.text];
  }
  if (ts.isUnionTypeNode(type)) return type.types.flatMap(keyLiterals);
  if (ts.isParenthesizedTypeNode(type)) return keyLiterals(type.type);
  return [];
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
 * @param {{ clientNames?: string[], program?: import('typescript').Program }} [options]
 *   `program` is a program that contains `fileName`: the type checker then
 *   recognizes the SDK's `datapoints` and `syntheticQuery` by where they are
 *   declared, whatever the receiver is called.
 * @returns {{ output: string, changes: number, warnings: string[] }}
 */
export function transform(source, fileName, options = {}) {
  // With a program the checker only works on the program's own source file, and
  // only if the file has not changed since the program read it.
  const programFile = options.program?.getSourceFile(path.resolve(fileName));
  const semantic = programFile !== undefined && programFile.text === source;
  const sf = semantic
    ? programFile
    : ts.createSourceFile(
        fileName,
        source,
        ts.ScriptTarget.Latest,
        true,
        scriptKindFor(fileName)
      );
  const checker = semantic ? options.program.getTypeChecker() : undefined;

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

  // With a program, the checker knows where a member or type is declared, so
  // the SDK is recognized by what it is and not by what it is called. It has to
  // be the right SDK class: the SDK also declares a `datapoints` member on its
  // response types (`DatapointAggregates`), and that one must not be touched.
  // `true` and `false` are answers; undefined means the checker cannot tell (an
  // `any` receiver, or the SDK's types are not installed), and the name decides.
  // `false` only silences the warning for an unrecognized receiver: an app's
  // own injected client type declares its own `datapoints`, so it is still
  // rewritten when its name looks like a client.
  const OWNER = new Map([
    ['datapoints', 'CogniteClient'],
    ['syntheticQuery', 'TimeSeriesAPI'],
  ]);
  const ownedBySdk = (symbol, owner) => {
    const declarations = symbol?.declarations;
    return declarations?.length
      ? declarations.some(
          (d) =>
            SDK_FILE.test(d.getSourceFile().fileName) &&
            d.parent?.name?.text === owner
        )
      : undefined;
  };
  const memberInSdk = (access, owner) => {
    const m = memberOf(access);
    if (!checker || !m) return undefined;
    return ownedBySdk(
      checker.getSymbolAtLocation(m.nameNode) ??
        checker.getPropertyOfType(
          checker.getNonNullableType(
            checker.getTypeAtLocation(access.expression)
          ),
          m.name
        ),
      owner
    );
  };
  // The SDK class a type node resolves to, through aliases: 'CogniteClient'.
  // (The class is `export default`, so its symbol is called 'default'; the name
  // is on the declaration.)
  const sdkClassName = (typeNode) => {
    if (!checker) return undefined;
    const type = checker.getTypeFromTypeNode(typeNode);
    const symbol = type.getSymbol() ?? type.aliasSymbol;
    return symbol?.declarations?.find((d) =>
      SDK_FILE.test(d.getSourceFile().fileName)
    )?.name?.text;
  };
  const isClientOwner = (typeNode) =>
    isClientType(typeNode) || sdkClassName(typeNode) === 'CogniteClient';
  // The string literals of a key type, resolved through aliases when possible.
  const keysOf = (typeNode) => {
    const keys = keyLiterals(typeNode);
    if (checker) {
      const type = checker.getTypeFromTypeNode(typeNode);
      for (const part of type.isUnion() ? type.types : [type]) {
        if (part.isStringLiteral()) keys.push(part.value);
      }
    }
    return keys;
  };

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
        const inSdk = memberInSdk(node, OWNER.get('datapoints'));
        if (inSdk === true || isClient(node.expression)) {
          rewriteMember(m, ['timeseries', 'data']);
        } else if (isMethodCall && inSdk === undefined) {
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
      const inSdk = memberInSdk(node, OWNER.get('syntheticQuery'));
      if (inSdk === true || isClient(node.expression.expression)) {
        rewriteMember(m, ['synthetic', 'query']);
      } else if (inSdk === undefined) {
        warnUnrecognized(
          node,
          '.timeseries.syntheticQuery',
          node.expression.expression
        );
      }
    }
    // typeof client.datapoints.retrieve -> typeof client.timeseries.data.retrieve
    if (ts.isQualifiedName(node) && inTypeQuery(node)) {
      const owner = OWNER.get(node.right.text);
      const inSdk =
        checker && owner
          ? ownedBySdk(checker.getSymbolAtLocation(node.right), owner)
          : undefined;
      if (
        node.right.text === 'datapoints' &&
        (inSdk === true || isClientName(entityLastName(node.left)))
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
        (inSdk === true || isClientName(entityLastName(node.left.left)))
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
    // const { datapoints } = client  /  const { syntheticQuery } = client.timeseries
    // function f({ datapoints }: CogniteClient)
    if (ts.isObjectBindingPattern(node)) {
      const owner = node.parent;
      const init = ts.isVariableDeclaration(owner)
        ? owner.initializer
        : undefined;
      const type = ts.isParameter(owner) ? owner.type : undefined;
      const fromClient = init
        ? isClient(init)
        : type !== undefined && isClientType(type);
      const fromTimeseries = init
        ? memberOf(init)?.name === 'timeseries' && isClient(init.expression)
        : type !== undefined && isTimeseriesOf(type);
      // What is destructured, according to the checker.
      const patternType = checker
        ? checker.getNonNullableType(checker.getTypeAtLocation(node))
        : undefined;
      for (const el of node.elements) {
        const key = el.propertyName ?? el.name;
        const prop =
          ts.isIdentifier(key) || ts.isStringLiteralLike(key)
            ? key.text
            : undefined;
        const inSdk =
          patternType !== undefined &&
          OWNER.has(prop) &&
          ownedBySdk(
            checker.getPropertyOfType(patternType, prop),
            OWNER.get(prop)
          ) === true;
        if (
          (prop === 'datapoints' && (fromClient || inSdk)) ||
          (prop === 'syntheticQuery' && (fromTimeseries || inSdk))
        ) {
          warnings.push(
            `${where(el)}: destructured '${prop}' not rewritten, migrate by hand`
          );
        }
      }
    }
    // Pick<CogniteClient, 'datapoints'>: the key moved, which is not a rename.
    if (
      ts.isTypeReferenceNode(node) &&
      ts.isIdentifier(node.typeName) &&
      (node.typeName.text === 'Pick' || node.typeName.text === 'Omit') &&
      node.typeArguments?.length === 2
    ) {
      const [owner, keys] = node.typeArguments;
      const moved = keysOf(keys);
      for (const [key, matches, moveTo] of [
        ['datapoints', isClientOwner(owner), 'timeseries.data'],
        ['syntheticQuery', isTimeseriesOf(owner), 'timeseries.synthetic.query'],
      ]) {
        if (matches && moved.includes(key)) {
          warnings.push(
            `${where(node)}: '${key}' in ${node.typeName.text}<...> not renamed, it moved to ${moveTo}: change the type by hand`
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
    // `Dirent.isDirectory()` is false for a symlink, so the skip list is matched
    // by name, and symlinks are never followed: a linked `node_modules` or a
    // dangling link must not be walked, and a linked file must not be written
    // through.
    if (SKIP_DIRS.has(entry.name) || entry.isSymbolicLink()) continue;
    yield* walk(path.join(target, entry.name));
  }
}

function loadPrograms(projects) {
  return projects.map((project) => {
    const configPath = path.resolve(project);
    if (!fs.existsSync(configPath)) {
      console.error(`error: ${project} does not exist`);
      process.exit(2);
    }
    const config = ts.getParsedCommandLineOfConfigFile(
      configPath,
      {},
      {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic: (d) => {
          const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
          console.error(`error: ${project}: ${message}`);
          process.exit(2);
        },
      }
    );
    const program = ts.createProgram({
      rootNames: config.fileNames,
      options: config.options,
      projectReferences: config.projectReferences,
    });
    if (config.fileNames.length === 0) {
      console.warn(
        `warning: ${project} lists no files (does it only have "references"?). Pass the tsconfig that includes your sources.`
      );
    } else if (
      !program.getSourceFiles().some((f) => SDK_FILE.test(f.fileName))
    ) {
      console.warn(
        `warning: ${project}: no @cognite/sdk types found (are the dependencies installed?), so its files are matched by name only`
      );
    }
    return program;
  });
}

function main(argv) {
  const dry = argv.includes('--dry');
  const clientNames = argv
    .filter((a) => a.startsWith('--client-names='))
    .flatMap((a) => a.slice('--client-names='.length).split(','))
    .filter(Boolean);
  const projects = argv
    .filter((a) => a.startsWith('--project='))
    .map((a) => a.slice('--project='.length))
    .filter(Boolean);
  const targets = argv.filter((a) => !a.startsWith('--'));
  if (targets.length === 0) {
    console.error(
      'Usage: node timeseries-data-namespace.mjs [--dry] [--client-names=a,b] [--project=tsconfig.json]... <file|dir>...'
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
  const programs = loadPrograms(projects);
  let files = 0;
  let changes = 0;
  let uncovered = 0;
  for (const target of targets) {
    for (const file of walk(target)) {
      const source = fs.readFileSync(file, 'utf8');
      const program = programs.find((p) => p.getSourceFile(path.resolve(file)));
      if (programs.length > 0 && !program) uncovered++;
      const result = transform(source, file, { clientNames, program });
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
  if (uncovered > 0) {
    console.log(
      `${uncovered} file(s) are not part of any --project and were matched by name only`
    );
  }
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

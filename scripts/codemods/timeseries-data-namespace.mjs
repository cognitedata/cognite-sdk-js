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
 *   node timeseries-data-namespace.mjs [--dry] [--client-names=a,b]
 *        [--project=tsconfig.json]... <file|dir>...
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

// Files of the SDK package, as the type checker sees them (the real path, so
// this also holds for pnpm's `.pnpm/@cognite+sdk@x/node_modules/@cognite/sdk`).
const SDK_FILE = /[\\/]node_modules[\\/]@cognite[\\/]sdk(-beta|-alpha)?[\\/]/;

// Files are read and written by this script, so without --project ts-morph only
// parses: an in-memory file system, and no type checking or module resolution.
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
 * @param {{ clientNames?: string[], typedProject?: Project }} [options]
 *   `typedProject` is a project loaded from a tsconfig that contains `fileName`:
 *   the type checker then recognizes the SDK's `datapoints` and `syntheticQuery`
 *   by where they are declared, whatever the receiver is called.
 * @returns {{ output: string, changes: number, warnings: string[] }}
 */
export function transform(source, fileName, options = {}) {
  // With a project the checker only works on the project's own source file, and
  // only if the file has not changed since the project read it.
  const typedFile = options.typedProject?.getSourceFile(path.resolve(fileName));
  if (typedFile !== undefined && typedFile.getFullText() === source) {
    const checker = options.typedProject.getTypeChecker().compilerObject;
    return transformSourceFile(typedFile, source, fileName, options, checker);
  }
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

/**
 * `checker` is the compiler's type checker for the program that contains `sf`,
 * or undefined when the file is only parsed.
 */
function transformSourceFile(sf, source, fileName, options, checker) {
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

  // With a project, the checker knows where a member or type is declared, so
  // the SDK is recognized by what it is and not by what it is called. It has to
  // be the right SDK class: the SDK also declares a `datapoints` member on its
  // response types (`DatapointAggregates`), and that one must not be touched.
  // `true` and `false` are answers; undefined means the checker cannot tell (an
  // `any` receiver, or the SDK's types are not installed), and the name decides.
  // `false` only silences the warning for an unrecognized receiver: an app's
  // own injected client type declares its own `datapoints`, so it is still
  // rewritten when its name looks like a client.
  // The checker works on compiler nodes, so ts-morph nodes are passed to it as
  // `.compilerNode`.
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
      checker.getSymbolAtLocation(m.nameNode.compilerNode) ??
        checker.getPropertyOfType(
          checker.getNonNullableType(
            checker.getTypeAtLocation(access.getExpression().compilerNode)
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
    const type = checker.getTypeFromTypeNode(typeNode.compilerNode);
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
      const type = checker.getTypeFromTypeNode(typeNode.compilerNode);
      for (const part of type.isUnion() ? type.types : [type]) {
        if (part.isStringLiteral()) keys.push(part.value);
      }
    }
    return keys;
  };

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
        const inSdk = memberInSdk(node, OWNER.get('datapoints'));
        if (inSdk === true || isClient(node.getExpression())) {
          rewriteMember(m, ['timeseries', 'data']);
        } else if (isMethodCall && inSdk === undefined) {
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
      const inSdk = memberInSdk(node, OWNER.get('syntheticQuery'));
      if (inSdk === true || isClient(receiver)) {
        rewriteMember(m, ['synthetic', 'query']);
      } else if (inSdk === undefined) {
        warnUnrecognized(node, '.timeseries.syntheticQuery', receiver);
      }
    }
    // typeof client.datapoints.retrieve -> typeof client.timeseries.data.retrieve
    if (Node.isQualifiedName(node) && inTypeQuery(node)) {
      const right = node.getRight();
      const left = node.getLeft();
      const owner = OWNER.get(right.getText());
      const inSdk =
        checker && owner
          ? ownedBySdk(checker.getSymbolAtLocation(right.compilerNode), owner)
          : undefined;
      if (
        right.getText() === 'datapoints' &&
        (inSdk === true || isClientName(entityLastName(left)))
      ) {
        edits.push([right.getStart(), right.getEnd(), 'timeseries.data']);
      }
      if (
        right.getText() === 'syntheticQuery' &&
        Node.isQualifiedName(left) &&
        left.getRight().getText() === 'timeseries' &&
        (inSdk === true || isClientName(entityLastName(left.getLeft())))
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
      // What is destructured, according to the checker.
      const patternType = checker
        ? checker.getNonNullableType(
            checker.getTypeAtLocation(node.compilerNode)
          )
        : undefined;
      for (const el of node.getElements()) {
        const key = el.getPropertyNameNode() ?? el.getNameNode();
        const prop = Node.isIdentifier(key)
          ? key.getText()
          : Node.isStringLiteral(key) ||
              Node.isNoSubstitutionTemplateLiteral(key)
            ? key.getLiteralText()
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

// Loads each tsconfig as a ts-morph project with its source files, for the type
// checker. Imports such as `@cognite/sdk` are resolved by the checker's program.
function loadProjects(projects) {
  return projects.map((project) => {
    const configPath = path.resolve(project);
    if (!fs.existsSync(configPath)) {
      console.error(`error: ${project} does not exist`);
      process.exit(2);
    }
    let typedProject;
    try {
      typedProject = new Project({
        tsConfigFilePath: configPath,
        skipFileDependencyResolution: true,
      });
    } catch (e) {
      console.error(`error: ${project}: ${e.message}`);
      process.exit(2);
    }
    if (typedProject.getSourceFiles().length === 0) {
      console.warn(
        `warning: ${project} lists no files (does it only have "references"?). Pass the tsconfig that includes your sources.`
      );
    } else if (
      !typedProject
        .getProgram()
        .compilerObject.getSourceFiles()
        .some((f) => SDK_FILE.test(f.fileName))
    ) {
      console.warn(
        `warning: ${project}: no @cognite/sdk types found (are the dependencies installed?), so its files are matched by name only`
      );
    }
    return typedProject;
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
  const typedProjects = loadProjects(projects);
  let files = 0;
  let changes = 0;
  let uncovered = 0;
  for (const target of targets) {
    for (const file of walk(target)) {
      const source = fs.readFileSync(file, 'utf8');
      const typedProject = typedProjects.find((p) =>
        p.getSourceFile(path.resolve(file))
      );
      if (typedProjects.length > 0 && !typedProject) uncovered++;
      const result = transform(source, file, { clientNames, typedProject });
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

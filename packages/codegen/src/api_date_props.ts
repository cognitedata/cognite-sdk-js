// Copyright 2026 Cognite AS
import { promises as fs } from 'node:fs';
import * as pathUtil from 'node:path';
import * as ts from 'typescript';

/**
 * Whether a timestamp is converted to a `Date` is decided by the API class, not
 * by the OpenAPI document: a resource API overrides `getDateProps()` and names
 * the fields its responses carry, e.g.
 *
 *     protected getDateProps() {
 *       return this.pickDateProps(['items'], ['createdTime']);
 *     }
 *
 * Rather than restating that in `codegen.json`, where it would quietly drift
 * out of sync, read it back out of the service's own source. The second
 * argument to `pickDateProps` is the list we want; the first is the path used
 * to walk into the response and does not affect the emitted types.
 */

const PICK_DATE_PROPS = 'pickDateProps';

const stringLiteralsIn = (node: ts.Node): string[] => {
  if (!ts.isArrayLiteralExpression(node)) {
    return [];
  }
  return node.elements
    .filter((element): element is ts.StringLiteral =>
      ts.isStringLiteral(element)
    )
    .map((element) => element.text);
};

const isPickDatePropsCall = (node: ts.Node): node is ts.CallExpression => {
  if (!ts.isCallExpression(node)) {
    return false;
  }
  const { expression } = node;
  // `this.pickDateProps(...)`, or a bare `pickDateProps(...)`
  if (ts.isPropertyAccessExpression(expression)) {
    return expression.name.escapedText === PICK_DATE_PROPS;
  }
  return (
    ts.isIdentifier(expression) && expression.escapedText === PICK_DATE_PROPS
  );
};

const datePropsInSource = (code: string, fileName: string): string[] => {
  const source = ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.ES2015,
    true,
    ts.ScriptKind.TS
  );

  const found: string[] = [];
  const visit = (node: ts.Node): void => {
    if (isPickDatePropsCall(node) && node.arguments.length >= 2) {
      found.push(...stringLiteralsIn(node.arguments[1]));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  return found;
};

const isCandidate = (fileName: string): boolean =>
  fileName.endsWith('.ts') &&
  !fileName.endsWith('.gen.ts') &&
  !fileName.endsWith('.spec.ts');

/**
 * Collects the timestamp fields every API class in a service directory converts
 * to `Date`. Returns them sorted, with duplicates removed.
 */
export const datePropsForService = async (
  directory: string
): Promise<string[]> => {
  let entries: string[];
  try {
    entries = await fs.readdir(directory);
  } catch (error) {
    return [];
  }

  const props = new Set<string>();
  for (const entry of entries.filter(isCandidate)) {
    const path = pathUtil.resolve(directory, entry);
    let code: string;
    try {
      code = await fs.readFile(path, 'utf-8');
    } catch (error) {
      continue;
    }
    for (const prop of datePropsInSource(code, entry)) {
      props.add(prop);
    }
  }

  return Array.from(props).sort();
};

export default datePropsForService;

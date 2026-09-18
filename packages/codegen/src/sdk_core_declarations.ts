import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as ts from 'typescript';

const SDK_CORE_TYPES_PATH = path.resolve(__dirname, '../../core/src/types.ts');

type SdkCoreExportDeclaration =
  | ts.TypeAliasDeclaration
  | ts.InterfaceDeclaration;

let cachedSdkCoreDeclarations: Map<string, SdkCoreExportDeclaration> | null =
  null;

const printer = ts.createPrinter({ removeComments: true });

const hasExportModifier = (node: ts.Node): boolean => {
  return (
    ts.canHaveModifiers(node) &&
    (ts
      .getModifiers(node)
      ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ??
      false)
  );
};

const printNode = (node: ts.Node, sourceFile: ts.SourceFile): string => {
  return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
};

const normalizePrinted = (value: string): string => {
  return value.replace(/\s+/g, ' ').trim();
};

const typeNodesEquivalent = (
  left: ts.TypeNode,
  right: ts.TypeNode,
  leftSourceFile: ts.SourceFile,
  rightSourceFile: ts.SourceFile
): boolean => {
  return (
    normalizePrinted(printNode(left, leftSourceFile)) ===
    normalizePrinted(printNode(right, rightSourceFile))
  );
};

const memberName = (member: ts.TypeElement): string | undefined => {
  if (member.name == null || !ts.isIdentifier(member.name)) {
    return undefined;
  }
  return member.name.text;
};

const interfaceMembersEquivalent = (
  left: ts.InterfaceDeclaration,
  right: ts.InterfaceDeclaration
): boolean => {
  const leftMembers = new Map<string, ts.TypeElement>();
  for (const member of left.members) {
    const name = memberName(member);
    if (name != null) {
      leftMembers.set(name, member);
    }
  }

  const rightMembers = new Map<string, ts.TypeElement>();
  for (const member of right.members) {
    const name = memberName(member);
    if (name != null) {
      rightMembers.set(name, member);
    }
  }

  if (leftMembers.size !== rightMembers.size) {
    return false;
  }

  for (const [name, leftMember] of leftMembers) {
    const rightMember = rightMembers.get(name);
    if (rightMember == null) {
      return false;
    }
    if (
      normalizePrinted(printNode(leftMember, left.getSourceFile())) !==
      normalizePrinted(printNode(rightMember, right.getSourceFile()))
    ) {
      return false;
    }
  }

  return true;
};

const getSdkCoreDeclarations = (): Map<string, SdkCoreExportDeclaration> => {
  if (cachedSdkCoreDeclarations != null) {
    return cachedSdkCoreDeclarations;
  }

  const content = readFileSync(SDK_CORE_TYPES_PATH, 'utf8');
  const sourceFile = ts.createSourceFile(
    SDK_CORE_TYPES_PATH,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  cachedSdkCoreDeclarations = new Map();
  for (const statement of sourceFile.statements) {
    if (
      (ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement)) &&
      hasExportModifier(statement)
    ) {
      cachedSdkCoreDeclarations.set(statement.name.text, statement);
    }
  }

  return cachedSdkCoreDeclarations;
};

export const isDuplicateOfSdkCoreDeclaration = (
  statement: ts.Statement,
  coreDeclarations: Map<
    string,
    SdkCoreExportDeclaration
  > = getSdkCoreDeclarations()
): boolean => {
  if (
    !hasExportModifier(statement) ||
    (!ts.isTypeAliasDeclaration(statement) &&
      !ts.isInterfaceDeclaration(statement))
  ) {
    return false;
  }

  const coreDeclaration = coreDeclarations.get(statement.name.text);
  if (coreDeclaration == null) {
    return false;
  }

  if (
    ts.isTypeAliasDeclaration(statement) &&
    ts.isTypeAliasDeclaration(coreDeclaration)
  ) {
    return typeNodesEquivalent(
      statement.type,
      coreDeclaration.type,
      statement.getSourceFile(),
      coreDeclaration.getSourceFile()
    );
  }

  if (
    ts.isInterfaceDeclaration(statement) &&
    ts.isInterfaceDeclaration(coreDeclaration)
  ) {
    return interfaceMembersEquivalent(statement, coreDeclaration);
  }

  return false;
};

export const extractExportedTypeNames = (code: string): string[] => {
  const sourceFile = ts.createSourceFile(
    'generated.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const names: string[] = [];
  for (const statement of sourceFile.statements) {
    if (
      (ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement)) &&
      hasExportModifier(statement)
    ) {
      names.push(statement.name.text);
    }
  }

  return names.sort();
};

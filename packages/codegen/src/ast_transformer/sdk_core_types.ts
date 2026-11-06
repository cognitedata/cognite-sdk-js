import * as ts from 'typescript';

import { isDuplicateOfSdkCoreDeclaration } from '../sdk_core_declarations';

const SDK_CORE_MODULE = '@cognite/sdk-core';

const isSdkCoreImport = (
  statement: ts.Statement
): statement is ts.ImportDeclaration => {
  if (!ts.isImportDeclaration(statement)) {
    return false;
  }
  if (!ts.isStringLiteral(statement.moduleSpecifier)) {
    return false;
  }
  return statement.moduleSpecifier.text === SDK_CORE_MODULE;
};

const getImportedTypeNames = (
  importDeclaration: ts.ImportDeclaration
): Set<string> => {
  const imported = new Set<string>();
  const namedBindings = importDeclaration.importClause?.namedBindings;
  if (namedBindings == null || !ts.isNamedImports(namedBindings)) {
    return imported;
  }

  for (const element of namedBindings.elements) {
    imported.add(element.name.text);
  }
  return imported;
};

const createSdkCoreImport = (typeNames: string[]): ts.ImportDeclaration => {
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports(
        [...typeNames]
          .sort()
          .map((name) =>
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier(name)
            )
          )
      )
    ),
    ts.factory.createStringLiteral(SDK_CORE_MODULE)
  );
};

const collectReferencedTypeNames = (
  node: ts.Node,
  referenced: Set<string>
): void => {
  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    referenced.add(node.typeName.text);
  }
  ts.forEachChild(node, (child) =>
    collectReferencedTypeNames(child, referenced)
  );
};

const sdkCoreTypesTransformer: ts.TransformerFactory<ts.SourceFile> = () => {
  return (sourceFile) => {
    const removedTypeNames = new Set<string>();
    const statementsWithoutDuplicates = sourceFile.statements.filter(
      (statement) => {
        if (!isDuplicateOfSdkCoreDeclaration(statement)) {
          return true;
        }
        if (
          ts.isTypeAliasDeclaration(statement) ||
          ts.isInterfaceDeclaration(statement)
        ) {
          removedTypeNames.add(statement.name.text);
        }
        return false;
      }
    );

    if (removedTypeNames.size === 0) {
      return sourceFile;
    }

    const referencedTypeNames = new Set<string>();
    for (const statement of statementsWithoutDuplicates) {
      collectReferencedTypeNames(statement, referencedTypeNames);
    }

    const typesToImport = [...referencedTypeNames].filter((name) =>
      removedTypeNames.has(name)
    );

    const existingSdkCoreImport = sourceFile.statements.find(isSdkCoreImport);
    const importedTypeNames = existingSdkCoreImport
      ? getImportedTypeNames(existingSdkCoreImport)
      : new Set<string>();

    const allImportedTypeNames = [
      ...new Set([...importedTypeNames, ...typesToImport]),
    ].sort();

    const remainingStatements = statementsWithoutDuplicates.filter(
      (statement) => !isSdkCoreImport(statement)
    );

    if (allImportedTypeNames.length === 0) {
      return ts.factory.updateSourceFile(sourceFile, remainingStatements);
    }

    return ts.factory.updateSourceFile(sourceFile, [
      createSdkCoreImport(allImportedTypeNames),
      ...remainingStatements,
    ]);
  };
};

export default sdkCoreTypesTransformer;

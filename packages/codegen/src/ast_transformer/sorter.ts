import * as ts from 'typescript';

const getIdentifier = (statement: ts.Statement): ts.Identifier | null => {
  if (ts.isTypeAliasDeclaration(statement)) {
    return statement.name;
  }
  if (ts.isInterfaceDeclaration(statement)) {
    return statement.name;
  }
  return null;
};

const identifierName = (id: ts.Identifier | null | undefined): string => {
  return (id?.escapedText as string) || '';
};

const statementName = (statement: ts.Statement): string => {
  const nameIdentifier = getIdentifier(statement);
  return identifierName(nameIdentifier);
};

const sortElementsByName = (
  elements: ts.NodeArray<ts.TypeElement>
): ts.NodeArray<ts.TypeElement> => {
  const sorted = Array.from(elements).sort((a, b) => {
    if (
      a.name !== undefined &&
      ts.isIdentifier(a.name) &&
      b.name !== undefined &&
      ts.isIdentifier(b.name)
    ) {
      return identifierName(a.name).localeCompare(identifierName(b.name));
    }

    throw new TypeError('expected identifiers...');
  });
  return ts.factory.createNodeArray(sorted);
};

/** sorterTransformer sorts all the declarations alphabetically to produce deterministic outputs. */
const sorterTransformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile) => {
    const visitor = (node: ts.Node): ts.Node => {
      if (ts.isInterfaceDeclaration(node)) {
        // sort every field alphabetically
        const interfaceDeclaration: ts.InterfaceDeclaration = {
          ...node,
          members: sortElementsByName(node.members),
        };
        return interfaceDeclaration;
      }
      return ts.visitEachChild(node, visitor, context);
    };

    const transformedSourceFile = ts.visitNode(
      sourceFile,
      visitor
    ) as ts.SourceFile;
    const sortedStatements = Array.from(transformedSourceFile.statements).sort(
      (a, b) => {
        return statementName(a).localeCompare(statementName(b));
      }
    );
    return {
      ...sourceFile,
      statements: ts.factory.createNodeArray(sortedStatements),
    };
  };
};

export default sorterTransformer;

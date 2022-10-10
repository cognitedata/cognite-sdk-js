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

/** sorterTransformer sorts all the declarations alphabetically to avoid horrible git diffs. */
const sorterTransformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile) => {
    const visitor = (node: ts.Node): ts.Node => {
      if (ts.isInterfaceDeclaration(node)) {
        const sortedMembers = Array.from(node.members).sort((a, b) => {
          if (
            a.name != undefined &&
            ts.isIdentifier(a.name) &&
            b.name != undefined &&
            ts.isIdentifier(b.name)
          ) {
            return identifierName(a.name).localeCompare(identifierName(b.name));
          }

          throw new TypeError('expected identifiers...');
        });
        node.members = ts.createNodeArray(sortedMembers);
        return node;
      }
      return ts.visitEachChild(node, visitor, context);
    };

    const transformedSourceFile = ts.visitNode(sourceFile, visitor);
    const sortedStatements = Array.from(transformedSourceFile.statements).sort(
      (a, b) => {
        return statementName(a).localeCompare(statementName(b));
      }
    );
    sourceFile.statements = ts.createNodeArray(sortedStatements);
    return sourceFile;
  };
};

export default sorterTransformer;

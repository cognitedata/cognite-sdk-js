import * as ts from 'typescript';
import isEqual from 'lodash/isEqual';

const targetMemberNames = new Set(['items', 'nextCursor']);

const memberName = (member: ts.TypeElement): string | undefined => {
  if (member.name === null) {
    return undefined;
  }
  if (!ts.isPropertySignature(member!)) {
    return undefined;
  }
  if (!ts.isIdentifier(member.name!)) {
    return undefined;
  }
  if (typeof member.name.escapedText !== 'string') {
    return undefined;
  }

  return member.name.escapedText;
};

const interfaceDeclarationHasRequiredMembers = (
  node: ts.InterfaceDeclaration
): boolean => {
  const memberNames = node.members
    .map(memberName)
    .filter(
      (member) =>
        member != undefined && Array.from(targetMemberNames).includes(member)
    );
  return isEqual(targetMemberNames, new Set(memberNames));
};

const cursorAndAsyncIteratorTransformer: ts.TransformerFactory<
  ts.SourceFile
> = (context) => {
  return (sourceFile) => {
    const removeTargetMembers = (node: ts.Node): ts.Node | undefined => {
      if (ts.isPropertySignature(node) && ts.isIdentifier(node.name)) {
        if (targetMemberNames.has(node.name.escapedText!)) {
          return undefined;
        }
      }
      return node;
    };
    const getItemsType = (node: ts.InterfaceDeclaration): ts.TypeNode => {
      for (const member of node.members) {
        if (
          ts.isPropertySignature(member) &&
          member.type != null &&
          ts.isIdentifier(member.name) &&
          ts.isArrayTypeNode(member.type)
        ) {
          if (
            member.name.escapedText == 'items' &&
            ts.isTypeReferenceNode(member.type.elementType) &&
            ts.isIdentifier(member.type.elementType.typeName)
          ) {
            const typeName = member.type.elementType.typeName
              .escapedText as string;
            return ts.createTypeReferenceNode(typeName, undefined);
          }
        }
      }
      throw new TypeError('missing items');
    };
    const visitor = (node: ts.Node): ts.Node => {
      if (
        ts.isInterfaceDeclaration(node) &&
        interfaceDeclarationHasRequiredMembers(node)
      ) {
        const itemsType = getItemsType(node);
        const id = ts.createIdentifier('CursorAndAsyncIterator');
        const types = ts.createExpressionWithTypeArguments([itemsType], id);
        const hc = ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
          types,
        ]);
        const existingHeritageClauses = node.heritageClauses || [];
        const transformedNode = ts.visitEachChild(
          node,
          removeTargetMembers,
          context
        );
        const newNode = ts.updateInterfaceDeclaration(
          transformedNode,
          transformedNode.decorators,
          transformedNode.modifiers,
          transformedNode.name,
          transformedNode.typeParameters,
          [hc, ...existingHeritageClauses],
          transformedNode.members
        );

        return newNode;
      }

      return ts.visitEachChild(node, visitor, context);
    };

    const containsCursorAndAsyncIteratorDeclaration = (): boolean => {
      for (const statement of sourceFile.statements) {
        if (
          ts.isInterfaceDeclaration(statement) &&
          interfaceDeclarationHasRequiredMembers(statement)
        ) {
          return true;
        }
      }
      return false;
    };

    const cursorAndAsyncIteratorImport = ts.createImportDeclaration(
      /* decorators */ undefined,
      /* modifiers */ undefined,
      ts.createImportClause(
        undefined,
        ts.createNamedImports([
          ts.createImportSpecifier(
            undefined,
            ts.createIdentifier('CursorAndAsyncIterator')
          ),
        ])
      ),
      ts.createLiteral('@cognite/sdk-core')
    );

    const additionalImports = containsCursorAndAsyncIteratorDeclaration()
      ? [cursorAndAsyncIteratorImport]
      : [];
    const transformedSourceFile = ts.visitNode(sourceFile, visitor);
    return ts.updateSourceFileNode(transformedSourceFile, [
      ...additionalImports,
      ...transformedSourceFile.statements,
    ]);
  };
};

export default cursorAndAsyncIteratorTransformer;

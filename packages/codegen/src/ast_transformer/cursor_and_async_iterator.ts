import isEqual from 'lodash/isEqual';
import * as ts from 'typescript';

const targetMemberNames = new Set(['items', 'nextCursor']);

const memberName = (member: ts.TypeElement): string | undefined => {
  if (member.name === null) {
    return undefined;
  }
  if (!ts.isPropertySignature(member)) {
    return undefined;
  }
  if (!ts.isIdentifier(member.name)) {
    return undefined;
  }
  if (typeof member.name.escapedText !== 'string') {
    return undefined;
  }

  return member.name.escapedText;
};

const interfaceDeclarationHasRequiredMembers = (
  node: ts.InterfaceDeclaration,
): boolean => {
  const memberNames = node.members.map(memberName);
  return isEqual(targetMemberNames, new Set(memberNames));
};

const cursorAndAsyncIteratorTransformer: ts.TransformerFactory<
  ts.SourceFile
> = (context) => {
  return (sourceFile) => {
    const removeTargetMembers = (node: ts.Node): ts.Node | undefined => {
      if (ts.isPropertySignature(node) && ts.isIdentifier(node.name)) {
        if (targetMemberNames.has(node.name.escapedText as string)) {
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
            member.name.escapedText === 'items' &&
            ts.isTypeReferenceNode(member.type.elementType) &&
            ts.isIdentifier(member.type.elementType.typeName)
          ) {
            const typeName = member.type.elementType.typeName
              .escapedText as string;
            return ts.factory.createTypeReferenceNode(typeName, undefined);
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
        const id = ts.factory.createIdentifier('CursorAndAsyncIterator');
        const types = ts.factory.createExpressionWithTypeArguments(id, [
          itemsType,
        ]);
        const hc = ts.factory.createHeritageClause(
          ts.SyntaxKind.ExtendsKeyword,
          [types],
        );
        const existingHeritageClauses = node.heritageClauses || [];
        const transformedNode = ts.visitEachChild(
          node,
          removeTargetMembers,
          context,
        );
        return ts.factory.updateInterfaceDeclaration(
          transformedNode,
          transformedNode.modifiers,
          transformedNode.name,
          transformedNode.typeParameters,
          [hc, ...existingHeritageClauses],
          transformedNode.members,
        );
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

    const cursorAndAsyncIteratorImport = ts.factory.createImportDeclaration(
      /* modifiers */ undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier('CursorAndAsyncIterator'),
          ),
        ]),
      ),
      ts.factory.createStringLiteral('@cognite/sdk-core'),
    );

    const additionalImports = containsCursorAndAsyncIteratorDeclaration()
      ? [cursorAndAsyncIteratorImport]
      : [];
    const transformedSourceFile = ts.visitNode(
      sourceFile,
      visitor,
    ) as ts.SourceFile;
    return ts.factory.updateSourceFile(transformedSourceFile, [
      ...additionalImports,
      ...transformedSourceFile.statements,
    ]);
  };
};

export default cursorAndAsyncIteratorTransformer;

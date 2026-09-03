import * as ts from 'typescript';

/**
 * The API sends timestamps as milliseconds since the epoch, so codegen types
 * them as numbers. Services that run `getDateProps()` convert them to `Date`
 * before handing them back, which leaves the generated type describing
 * something the SDK never returns.
 *
 * This transformer removes those members from the generated interface and
 * mixes in the matching interface from `@cognite/sdk-core` instead, so
 * `createdTime: EpochTimestamp` becomes `extends CreatedTime`.
 *
 * Which fields to convert is read out of the service's own `getDateProps()`,
 * so there is nothing to keep in sync by hand - see `api_date_props.ts`.
 *
 * `createdTime` and `lastUpdatedTime` have shared interfaces in
 * `@cognite/sdk-core` and are mixed in. Any other converted field (say
 * `deletedTime`) simply has its type rewritten to `Date` in place.
 */

const CREATED_TIME = 'createdTime';
const LAST_UPDATED_TIME = 'lastUpdatedTime';

const SDK_CORE_MODULE = '@cognite/sdk-core';

const memberName = (member: ts.TypeElement): string | undefined => {
  if (!ts.isPropertySignature(member) || !ts.isIdentifier(member.name)) {
    return undefined;
  }
  return member.name.escapedText as string;
};

/**
 * Only rewrite members that actually hold an epoch timestamp. Anything already
 * typed as a `Date`, or left optional, is left alone - the mixins declare their
 * fields as required, so widening an optional member would be wrong.
 */
const isEpochTimestamp = (member: ts.TypeElement): boolean => {
  if (!ts.isPropertySignature(member) || member.questionToken != null) {
    return false;
  }
  const { type } = member;
  if (type == null) {
    return false;
  }
  if (type.kind === ts.SyntaxKind.NumberKeyword) {
    return true;
  }
  return (
    ts.isTypeReferenceNode(type) &&
    ts.isIdentifier(type.typeName) &&
    type.typeName.escapedText === 'EpochTimestamp'
  );
};

const MIXIN_PROPS = [CREATED_TIME, LAST_UPDATED_TIME];

const mixinFor = (converted: Set<string>): string | undefined => {
  const created = converted.has(CREATED_TIME);
  const lastUpdated = converted.has(LAST_UPDATED_TIME);
  if (created && lastUpdated) {
    return 'CreatedAndLastUpdatedTime';
  }
  if (created) {
    return 'CreatedTime';
  }
  if (lastUpdated) {
    return 'LastUpdatedTime';
  }
  return undefined;
};

/** `createdTime: EpochTimestamp` -> `createdTime: Date` */
const asDate = (member: ts.PropertySignature): ts.PropertySignature =>
  ts.factory.updatePropertySignature(
    member,
    member.modifiers,
    member.name,
    member.questionToken,
    ts.factory.createTypeReferenceNode('Date', undefined)
  );

/**
 * Adds `specifiers` to the existing `@cognite/sdk-core` import when there is
 * one, so we do not emit a second import from the same module.
 */
const mergeIntoExistingImport = (
  statements: readonly ts.Statement[],
  specifiers: string[]
): { statements: ts.Statement[]; merged: boolean } => {
  let merged = false;
  const updated = statements.map((statement) => {
    if (
      merged ||
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== SDK_CORE_MODULE
    ) {
      return statement;
    }
    const bindings = statement.importClause?.namedBindings;
    if (bindings == null || !ts.isNamedImports(bindings)) {
      return statement;
    }

    merged = true;
    const existing = new Set(
      bindings.elements.map((element) => element.name.escapedText as string)
    );
    const additional = specifiers
      .filter((name) => !existing.has(name))
      .map((name) =>
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier(name)
        )
      );

    return ts.factory.updateImportDeclaration(
      statement,
      statement.modifiers,
      ts.factory.updateImportClause(
        // biome-ignore lint/style/noNonNullAssertion: guarded by the namedBindings check above
        statement.importClause!,
        // biome-ignore lint/style/noNonNullAssertion: same
        statement.importClause!.isTypeOnly,
        undefined,
        ts.factory.updateNamedImports(bindings, [
          ...bindings.elements,
          ...additional,
        ])
      ),
      statement.moduleSpecifier,
      statement.attributes
    );
  });

  return { statements: updated, merged };
};

const createImport = (specifiers: string[]): ts.ImportDeclaration =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports(
        specifiers.map((name) =>
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

const createDatePropsTransformer = (
  dateProps: string[]
): ts.TransformerFactory<ts.SourceFile> => {
  const wanted = new Set(dateProps);

  return (context) => (sourceFile) => {
    const mixinsUsed = new Set<string>();

    const visitor = (node: ts.Node): ts.Node => {
      if (!ts.isInterfaceDeclaration(node)) {
        return ts.visitEachChild(node, visitor, context);
      }

      const mixedIn = new Set<string>();
      let rewroteInPlace = false;

      const members: ts.TypeElement[] = [];
      for (const member of node.members) {
        const name = memberName(member);
        if (name == null || !wanted.has(name) || !isEpochTimestamp(member)) {
          members.push(member);
          continue;
        }
        if (MIXIN_PROPS.includes(name)) {
          // dropped from the body; supplied by the heritage clause below
          mixedIn.add(name);
          continue;
        }
        members.push(asDate(member as ts.PropertySignature));
        rewroteInPlace = true;
      }

      const mixin = mixinFor(mixedIn);
      if (mixin == null) {
        return rewroteInPlace
          ? ts.factory.updateInterfaceDeclaration(
              node,
              node.modifiers,
              node.name,
              node.typeParameters,
              node.heritageClauses,
              members
            )
          : node;
      }
      mixinsUsed.add(mixin);

      const heritage = ts.factory.createHeritageClause(
        ts.SyntaxKind.ExtendsKeyword,
        [
          ts.factory.createExpressionWithTypeArguments(
            ts.factory.createIdentifier(mixin),
            undefined
          ),
        ]
      );

      return ts.factory.updateInterfaceDeclaration(
        node,
        node.modifiers,
        node.name,
        node.typeParameters,
        [...(node.heritageClauses || []), heritage],
        members
      );
    };

    const transformed = ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    if (mixinsUsed.size === 0) {
      return transformed;
    }

    const specifiers = Array.from(mixinsUsed).sort();
    const { statements, merged } = mergeIntoExistingImport(
      transformed.statements,
      specifiers
    );

    return ts.factory.updateSourceFile(
      transformed,
      merged ? statements : [createImport(specifiers), ...statements]
    );
  };
};

export default createDatePropsTransformer;

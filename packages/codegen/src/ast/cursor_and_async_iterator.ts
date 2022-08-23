import * as ts from 'typescript';

export class CursorAndAsyncIteratorProcessor {
    public filter = (statement: ts.Statement): boolean => {
      if (statement.kind !== ts.SyntaxKind.InterfaceDeclaration) {
        return false;
      }

      const decl = statement as ts.InterfaceDeclaration;
      if (decl.members.length < 2) {
        return false;
      }

      const matches = decl.members.filter(this.memberIsRelevant);
      return matches.length == 2;
    }

    public memberIsRelevant = (member: ts.TypeElement): boolean => {
        if (member.name === null) {
            return false;
        }
        if (!ts.isPropertySignature(member!)) {
            return false;
        }
        if (!ts.isIdentifier(member.name!)) {
            return false;
        }
        if (typeof member.name.escapedText !== "string") {
            return false;
        }

        return ['items', 'nextCursor'].includes(member.name.escapedText);
    }

    public createParent = (args: ts.TypeNode[] | undefined): ts.ExpressionWithTypeArguments => {
        const id = ts.createIdentifier('CursorAndAsyncIterator');
        return ts.createExpressionWithTypeArguments(args, id);
    }

    public process = (source: ts.SourceFile): ts.SourceFile => {
        const statements = source.statements.filter(this.filter).map(stmt => stmt as ts.InterfaceDeclaration);
        for (let statement of statements) {
            statement.members = statement.members.filter(member => !this.memberIsRelevant(member));
            const hc = ts.createHeritageClause(
                ts.SyntaxKind.ExtendsKeyword,
                this.createParent(undefined)
            );

            ts.updateInterfaceDeclaration(statement,
        }


        return source;
    };
}
import ts from "typescript";

export interface AstPostProcessor {
    process(source: ts.SourceFile): ts.SourceFile;
}

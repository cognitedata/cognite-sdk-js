export interface TypeGeneratorResult {
  typeNames: string[];
  code: string;
  astProcessedCode: string;
}

export interface TypeGenerator {
  generateTypes(openApiJson: string): Promise<TypeGeneratorResult>;
}

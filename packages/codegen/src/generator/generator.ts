export interface TypeGeneratorResult {
  typeNames: string[];
  code: string;
}

export interface TypeGenerator {
  generateTypes(openApiJson: string): Promise<TypeGeneratorResult>;
}

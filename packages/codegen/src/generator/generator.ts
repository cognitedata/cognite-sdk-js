import type { Hooks } from 'swagger-typescript-api-nextgen';

export interface TypeGeneratorResult {
  typeNames: string[];
  code: string;
  astProcessedCode: string;
}

export interface TypeGenerator {
  generateTypes(
    openApiJson: string,
    codeGenHooks: Partial<Hooks>
  ): Promise<TypeGeneratorResult>;
}

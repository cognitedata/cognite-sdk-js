// Copyright 2022 Cognite AS
import { promises as fs } from 'node:fs';
import * as tmp from 'tmp-promise';

import { generateApi } from 'swagger-typescript-api-nextgen';
import type { TypeGeneratorResult } from './generator';

export class AcacodeOpenApiGenerator {
  public generateTypes = async (
    openApiJson: string,
  ): Promise<TypeGeneratorResult> => {
    const file = await tmp.file({ postfix: '.json' });
    await fs.writeFile(file.path, openApiJson);

    // prettier config is automatically loaded from project config
    const generated = await generateApi({
      name: await tmp.tmpName(),
      input: file.path,
      silent: true,
      generateClient: false,
      toJS: false,
      generateResponses: false,
      extractRequestParams: false,
      extractRequestBody: false,
      generateUnionEnums: true,
      cleanOutput: false,
      enumNamesAsValues: true,
    });

    const typeNames = generated.configuration.modelTypes
      .map((modelType) => modelType.name)
      .sort();

    const code = generated.files.length > 0 ? generated.files[0].content : '';
    const result: TypeGeneratorResult = {
      typeNames: typeNames,
      code: code,
      astProcessedCode: '',
    };

    await file.cleanup();
    return result;
  };
}

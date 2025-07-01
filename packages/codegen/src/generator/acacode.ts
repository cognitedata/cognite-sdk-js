// Copyright 2022 Cognite AS
import { promises as fs } from 'node:fs';
import * as tmp from 'tmp-promise';

import {
  type SchemaComponent,
  type SchemaTypePrimitiveContent,
  generateApi,
} from 'swagger-typescript-api-nextgen';
import type { TypeGeneratorResult } from './generator';

/**
 * Due to service-contracts having removed backwards compatibility
 * with OpenAPI v2 spec, and the swagger-typescript-api-nextgen
 * lacking support for at least the "const" concept introduced in
 * the OpenAPI v3 spec, we need to manually transform consts into
 * enums such that the type gen will correctly handle const properties.
 */
const hotfixConstsAsEnums = (component: SchemaComponent) => {
  const properties = component.rawTypeData?.properties;
  if (component.rawTypeData && properties) {
    const patchedProperties = Object.entries(properties).reduce(
      (newProps, [key, value]) => {
        // The types exported from the lib are wrong
        const valueAsRecord = value as Record<string, unknown>;
        if ('const' in valueAsRecord) {
          valueAsRecord.enum = valueAsRecord.enum ?? [valueAsRecord.const];
        }
        newProps[key] = value;
        return newProps;
      },
      {} as Record<
        string,
        {
          name?: string | undefined;
          type: string;
          required: boolean;
          $parsed?: SchemaTypePrimitiveContent | undefined;
        }
      >
    );

    component.rawTypeData.properties = patchedProperties;
  }

  return component;
};

export class AcacodeOpenApiGenerator {
  public generateTypes = async (
    openApiJson: string
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
      hooks: {
        onCreateComponent: hotfixConstsAsEnums,
      },
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

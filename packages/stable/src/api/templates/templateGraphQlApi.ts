// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { GraphQlResponse } from '../../types';

export class TemplateGraphQlApi extends BaseResourceAPI<unknown> {
  /**
   * [Run a GraphQL query](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionGraphql)
   *
   * ```js
   * client.templates.group("myGroup").versions(1).runQuery({ query: `
   *   wellList {
   *     name
   *   }
   * `});
   * ```
   */
  runQuery = async <TVariables extends Record<string, unknown>>({
    query,
    variables,
    operationName,
  }: {
    query: string;
    variables?: TVariables;
    operationName?: string;
  }): Promise<GraphQlResponse> => {
    const res = await this.post(this.url(), {
      data: {
        query,
        variables,
        operationName,
      },
    });
    return res.data as GraphQlResponse;
  };
}

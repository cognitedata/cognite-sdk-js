// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import { GraphQlResponse } from '../../types';

export class TemplateGraphQlApi extends BaseResourceAPI<any> {
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
  runQuery = async <TVariables extends Record<string, unknown>>(graphQlParams: {
    query: string;
    variables?: TVariables;
    operationName?: string;
  }): Promise<GraphQlResponse> => {
    const res = await this.post(this.url(), {
      data: {
        query: graphQlParams.query,
        variables: graphQlParams.variables,
        operationName: graphQlParams.operationName,
      },
    });
    return res.data as GraphQlResponse;
  };
}

// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { GraphQlResponse } from '../../types';

/**
 * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release. See https://docs.cognite.com/cdf/deprecated#deprecated-and-retired-features for more details.
 */
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
   *
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release.
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

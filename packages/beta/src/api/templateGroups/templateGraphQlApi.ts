// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import { GraphQlResponse } from '../../types';

export class TemplateGraphQlApi extends BaseResourceAPI<any> {
  /**
   * [Run a GraphQL query](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionGraphql)
   *
   * ```js
   * client.templates.group("myGroup").versions(1).runQuery(`
   *   wellList {
   *     name
   *   }
   * `);
   * ```
   */
  runQuery = (query: string): Promise<GraphQlResponse> => {
    return this.post(this.url(), {
      data: {
        query,
      },
    }).then(res => res.data as GraphQlResponse);
  };
}

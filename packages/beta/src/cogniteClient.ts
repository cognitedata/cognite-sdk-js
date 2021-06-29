// Copyright 2020 Cognite AS

import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@cognite/sdk';
import { accessApi } from '@cognite/sdk-core';
import { version } from '../package.json';
import { TemplateGraphQlApi } from './api/templateGroups/templateGraphQlApi';
import { TemplateGroupsApi } from './api/templateGroups/templateGroupsApi';
import { TemplateGroupVersionsApi } from './api/templateGroups/templateGroupVersionsApi';
import { TemplateInstancesApi } from './api/templateGroups/templateInstancesApi';
import { DocumentsAPI } from './api/documents/documentsApi';
import { ViewsApi } from './api/templateGroups/viewsApi';

class CogniteClientCleaned extends CogniteClientStable {
  // Remove type restrictions
}

export default class CogniteClient extends CogniteClientCleaned {
  private templateGroupsApi?: TemplateGroupsApi;
  private documentsApi?: DocumentsAPI;

  /**
   * Create a new SDK client (beta)
   *
   * For smooth transition between stable sdk and beta, you may create an alias
   * `"@cognite/sdk": "@cognite/sdk-beta@^<version>"` in `package.json`
   * The beta SDK exports the client with the same name as stable, meaning you don't need to change any imports.
   * ```js
   * import { CogniteClient } from '@cognite/sdk';
   *
   * const client = new CogniteClient({ appId: 'YOUR APPLICATION NAME' });
   *
   * // can also specify a base URL
   * const client = new CogniteClient({ ..., baseUrl: 'https://greenfield.cognitedata.com' });
   * ```
   *
   * @param options Client options
   */
  constructor(options: ClientOptions) {
    super(options);
  }

  public get templates() {
    return {
      groups: accessApi(this.templateGroupsApi),
      group: (externalId: string) => {
        const urlsafeExternalId = CogniteClient.urlEncodeExternalId(externalId);
        const baseVersionsUrl = `templategroups/${urlsafeExternalId}/versions`;
        return {
          versions: accessApi(
            this.apiFactory(TemplateGroupVersionsApi, baseVersionsUrl)
          ),
          version: (version: number) => {
            const baseGroupUrl = `${baseVersionsUrl}/${version}`;
            const graphQlApi = this.apiFactory(
              TemplateGraphQlApi,
              `${baseGroupUrl}/graphql`
            );
            return {
              instances: accessApi(
                this.apiFactory(
                  TemplateInstancesApi,
                  `${baseGroupUrl}/instances`
                )
              ),
              runQuery: async <
                TVariables extends Record<string, unknown>
              >(graphQlParams: {
                query: string;
                variables?: TVariables;
                operationName?: string;
              }) => graphQlApi.runQuery(graphQlParams),
              views: accessApi(
                this.apiFactory(ViewsApi, `${baseGroupUrl}/views`)
              ),
            };
          },
        };
      },
    };
  }
  // TODO: uncomment when playground is supported
  // public get documents() {
  //   return accessApi(this.documentsApi);
  // }

  protected get version() {
    return `${version}-beta`;
  }

  protected initAPIs() {
    super.initAPIs();

    // Lock version to the following date
    this.httpClient.setDefaultHeader('cdf-version', 'V20210406');
    this.templateGroupsApi = this.apiFactory(
      TemplateGroupsApi,
      'templategroups'
    );
    this.documentsApi = this.apiFactory(DocumentsAPI, 'documents');
  }
  static urlEncodeExternalId(externalId: string): string {
    return encodeURIComponent(externalId);
  }
}

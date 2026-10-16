// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  ExternalTemplateGroupVersion,
  TemplateGroupVersion,
  TemplateGroupVersionFilterQuery,
} from '../../types';

/**
 * @deprecated Templates API was retired 2025-05-31 and will be removed in the next major release. See https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md for details.
 */
export class TemplateGroupVersionsApi extends BaseResourceAPI<TemplateGroupVersion> {
  /**
   * [Upsert a Template Group version](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsUpsert)
Create or update a Template Group version.
   *
   * ```js
   * const version = { schema: "type MyType @template { someField: String }", conflictMode: ConflictMode.Patch };
   * const newVersion = await client.group("myGroup").versions.upsert(version);
   * ```
   *
   * @deprecated Templates API was retired 2025-05-31 and will be removed in the next major release.
   */
  public upsert = (
    item: ExternalTemplateGroupVersion
  ): Promise<TemplateGroupVersion> => {
    return this.post(this.url('upsert'), {
      data: item,
    }).then((res) => res.data as TemplateGroupVersion);
  };

  /**
   * [List Template Group versions](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsList)
   *
   * ```js
   * const versions = await client.templates.group("myGroup").versions.list( { minVersion: 1, maxVersion: 4 } );
   * ```
   *
   * @deprecated Templates API was retired 2025-05-31 and will be removed in the next major release.
   */
  public list = (
    query?: TemplateGroupVersionFilterQuery
  ): CursorAndAsyncIterator<TemplateGroupVersion> => {
    return super.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Delete a Template Group version](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsDelete)
   *
   * ```js
   * await client.templates.group("myGroup").versions.delete(1);
   * ```
   *
   * @deprecated Templates API was retired 2025-05-31 and will be removed in the next major release.
   */
  public delete = (version: number) => {
    return this.post(this.url('delete'), {
      data: {
        version: version,
      },
    });
  };
}

// Copyright 2020 Cognite AS

import { BaseResourceAPI, HttpResponseType } from '@cognite/sdk-core';
import type { CogniteInternalId } from '../../types';

/**
 * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
 */
export class Files3DAPI extends BaseResourceAPI<unknown> {
  /**
   * [Retrieve a 3D file"](https://doc.cognitedata.com/api/v1/#operation/get3DFile)
   *
   * ```js
   * await client.files3D.retrieve(3744350296805509);
   * ```
   *
   * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
   */
  public retrieve = async (fileId: CogniteInternalId): Promise<ArrayBuffer> => {
    const path = this.url(`${fileId}`);
    const response = await this.get<ArrayBuffer>(path, {
      responseType: HttpResponseType.ArrayBuffer,
    });
    return this.addToMapAndReturn(response.data, response);
  };
}

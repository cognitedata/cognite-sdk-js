// Copyright 2020 Cognite AS

import { BaseResourceAPI, HttpResponseType } from '@cognite/sdk-core';
import type { CogniteInternalId } from '../../types';

/**
 * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release. See https://docs.cognite.com/cdf/deprecated#deprecated-and-retired-features for more details.
 */
export class Files3DAPI extends BaseResourceAPI<unknown> {
  /**
   * [Retrieve a 3D file"](https://doc.cognitedata.com/api/v1/#operation/get3DFile)
   *
   * ```js
   * await client.files3D.retrieve(3744350296805509);
   * ```
   *
   * @deprecated Asset-centric API, to be retired end of 2027. May move to `client.legacy` in the next major release.
   */
  public retrieve = async (fileId: CogniteInternalId): Promise<ArrayBuffer> => {
    const path = this.url(`${fileId}`);
    const response = await this.get<ArrayBuffer>(path, {
      responseType: HttpResponseType.ArrayBuffer,
    });
    return this.addToMapAndReturn(response.data, response);
  };
}

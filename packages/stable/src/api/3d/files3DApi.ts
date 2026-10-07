// Copyright 2020 Cognite AS

import { BaseResourceAPI, HttpResponseType } from '@cognite/sdk-core';
import type { CogniteInternalId } from '../../types';

export class Files3DAPI extends BaseResourceAPI<unknown> {
  /**
   * [Retrieve a 3D file"](https://doc.cognitedata.com/api/v1/#operation/get3DFile)
   *
   * ```js
   * await client.files3D.retrieve(3744350296805509);
   * ```
   */
  public retrieve = async (fileId: CogniteInternalId): Promise<ArrayBuffer> => {
    const path = this.url(`${fileId}`);
    const response = await this.get<ArrayBuffer>(path, {
      responseType: HttpResponseType.ArrayBuffer,
    });
    return this.addToMapAndReturn(response.data, response);
  };
}

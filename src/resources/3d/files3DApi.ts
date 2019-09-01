// Copyright 2019 Cognite AS

import { CogniteInternalId } from '@/types/types';
import { HttpResponseType } from '@/utils/http/basicHttpClient';
import { BaseResourceAPI } from '../baseResourceApi';

export class Files3DAPI extends BaseResourceAPI<any> {
  /**
   * [Retrieve a 3D file"](https://doc.cognitedata.com/api/v1/#operation/get3DFile)
   *
   * ```js
   * await client.files3D.retrieve(3744350296805509);
   * ```
   */
  public async retrieve(fileId: CogniteInternalId): Promise<ArrayBuffer> {
    const path = this.url(`${fileId}`);
    const response = await this.httpClient.get<ArrayBuffer>(path, {
      responseType: HttpResponseType.ArrayBuffer,
    });
    return this.addToMapAndReturn(response.data, response);
  }
}

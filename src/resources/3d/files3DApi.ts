// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { rawRequest } from '../../axiosWrappers';
import { MetadataMap } from '../../metadata';
import { CogniteInternalId } from '../../types';
import { projectUrl } from '../../utils';

export class Files3DAPI {
  private path: string;
  private instance: AxiosInstance;
  private map: MetadataMap;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    this.path = projectUrl(project) + '/3d/files';
    this.instance = instance;
    this.map = map;
  }

  /**
   * [Retrieve a 3D file"](https://doc.cognitedata.com/api/v1/#operation/get3DFile)
   *
   * ```js
   * await client.files3D.retrieve(3744350296805509);
   * ```
   */
  public retrieve: Files3DRetrieveEndpoint = async file3DId => {
    const response = await rawRequest<ArrayBuffer>(this.instance, {
      url: `${this.path}/${encodeURIComponent('' + file3DId)}`,
      method: 'get',
      responseType: 'arraybuffer',
    });
    return this.map.addAndReturn(response.data, response);
  };
}

export type Files3DRetrieveEndpoint = (
  id: CogniteInternalId
) => Promise<ArrayBuffer>;

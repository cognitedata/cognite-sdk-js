// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { rawRequest } from '../axiosWrappers';
import { MetadataMap } from '../metadata';
import { CogniteInternalId } from '../types/types';
import { projectUrl } from '../utils';

export interface Files3DAPI {
  /**
   * [Retrieve a 3D file"](https://doc.cognitedata.com/api/v1/#operation/get3DFile)
   *
   * ```js
   * await client.files3D.retrieve(3744350296805509);
   * ```
   */
  retrieve: (id: CogniteInternalId) => Promise<ArrayBuffer>;
}

/** @hidden */
export function generateFiles3DObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): Files3DAPI {
  const path = projectUrl(project) + '/3d/files';
  return {
    retrieve: async (file3DId: CogniteInternalId) => {
      const response = await rawRequest<ArrayBuffer>(instance, {
        url: `${path}/${encodeURIComponent('' + file3DId)}`,
        method: 'get',
        responseType: 'arraybuffer',
      });
      return map.addAndReturn<ArrayBuffer>(response.data, response);
    },
  };
}

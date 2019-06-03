// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { rawRequest } from '../../axiosWrappers';
import { MetadataMap } from '../../metadata';
import { generateRetrieveSingleEndpoint } from '../../standardMethods';
import {
  CogniteInternalId,
  FileContent,
  ItemsResponse,
  UploadFileMetadataResponse,
} from '../../types/custom';
import { ExternalFilesMetadata, FilesMetadata } from '../../types/types';

/** @hidden */
export function waitUntilFileIsUploaded(
  fileId: CogniteInternalId,
  axiosInstance: AxiosInstance,
  resourcePath: string,
  frequencyInMs: number = 1000,
  maxTime: number = 2 * 60 * 1000
): Promise<FilesMetadata> {
  return new Promise((resolve, reject) => {
    try {
      const retrieve = generateRetrieveSingleEndpoint<
        CogniteInternalId,
        FilesMetadata
      >(axiosInstance, resourcePath, new MetadataMap());

      const startTime = Date.now();
      const myInterval = setInterval(async () => {
        const now = Date.now();
        if (now - startTime > maxTime) {
          clearInterval(myInterval);
          reject(new Error(`File never marked as 'uploaded'`));
        }
        const fileInfo = await retrieve(fileId);
        if (fileInfo.uploaded) {
          clearInterval(myInterval);
          resolve(fileInfo);
        }
      }, frequencyInMs);
    } catch (e) {
      reject(e);
    }
  });
}

/** @hidden */
export function generateUploadEndpoint(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function upload(
    fileMetadata: ExternalFilesMetadata,
    fileContent?: FileContent,
    overwrite: boolean = false,
    waitUntilAcknowledged: boolean = false
  ): Promise<UploadFileMetadataResponse | FilesMetadata> {
    const params: { [key: string]: any } = {};
    if (overwrite) {
      params.overwrite = true;
    }
    const response = await rawRequest<UploadFileMetadataResponse>(
      axiosInstance,
      {
        method: 'post',
        url: resourcePath,
        data: fileMetadata,
        params,
      }
    );
    const file = response.data;
    if (fileContent != null) {
      const { uploadUrl } = file;
      const headers: any = {};
      if (fileMetadata.mimeType != null) {
        headers['Content-Type'] = fileMetadata.mimeType;
      }
      await rawRequest(axiosInstance, {
        method: 'put',
        url: uploadUrl,
        headers,
        data: fileContent,
      });
    }
    if (waitUntilAcknowledged) {
      const fileInfo = await waitUntilFileIsUploaded(
        file.id,
        axiosInstance,
        resourcePath
      );
      return metadataMap.addAndReturn(fileInfo, response);
    }
    return metadataMap.addAndReturn(file, response);
  };
}

/** @hidden */
export function generateDownloadUrlEndpoint<RequestType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function downloadUrl(
    items: RequestType[]
  ): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'post',
        url: `${resourcePath}/downloadlink`,
        data: { items },
      },
      true
    );
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

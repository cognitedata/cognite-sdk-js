// Copyright 2020 Cognite AS

import { CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import {
  FilesAPI as FilesAPIStable,
  MultiPartFileUploadResponse,
} from '../../types';
import { ExternalFileInfo } from '@cognite/sdk/src/types';
import { FilesMultipartUploadSessionAPI } from './filesMultipartUploadSessionApi';

export class FilesAPI extends FilesAPIStable {
  private limits = {
    minimumNumberOfParts: 1,
    maxNumberOfParts: 250,
  };
  private _client: CDFHttpClient;
  private _map: MetadataMap;
  private _baseUrl: string;
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
    [this._baseUrl, this._client, this._map] = args;
  }

  /**
   * [Init a multipart file upload](https://api-docs.cognite.com/20230101/tag/Files/operation/initMultiPartUpload)
   *
   * ```js
   * const numberOfParts = 5;
   * // automatic upload:
   * const multiPartUploadApi = await client.files.upload({name: 'examplefile.jpg', mimeType: 'image/jpeg'}, numberOfParts);
   * ```
   */
  public async multipartUploadSession(
    fileInfo: ExternalFileInfo,
    parts: number,
    overwrite: boolean = false
  ) {
    const response = await this.getMultipartUploadSession(
      fileInfo,
      parts,
      overwrite
    );
    const multipartUploadSession = new FilesMultipartUploadSessionAPI(
      this._baseUrl,
      this._client,
      this._map,
      response.data
    );
    return this.addToMapAndReturn(multipartUploadSession, response);
  }
  private async getMultipartUploadSession(
    fileInfo: ExternalFileInfo,
    parts: number,
    overwrite: boolean = false
  ) {
    if (
      parts < this.limits.minimumNumberOfParts ||
      parts > this.limits.maxNumberOfParts
    ) {
      throw Error('parts must be greater than 0 and less than 250');
    }
    const path = this.url('initmultipartupload');
    const params = { overwrite: overwrite, parts: parts };
    const response = await this.post<MultiPartFileUploadResponse>(path, {
      params,
      data: fileInfo,
    });
    return response;
  }
}

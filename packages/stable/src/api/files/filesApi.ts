// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  HttpHeaders,
  sleepPromise,
} from '@cognite/sdk-core';
import {
  CogniteInternalId,
  ExternalFileInfo,
  FileAggregate,
  FileAggregateQuery,
  FileChangeUpdate,
  FileContent,
  FileLink,
  FileRequestFilter,
  FileInfo,
  FilesSearchFilter,
  IdEither,
  IgnoreUnknownIds,
  ItemsWrapper,
  FileUploadResponse,
} from '../../types';

export class FilesAPI extends BaseResourceAPI<FileInfo> {
  private limits = {
    minimumNumberOfParts: 1,
    maxNumberOfParts: 250,
  };
  /**
   * Specify that dates should be parsed in requests and responses
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(
      ['items'],
      [
        'createdTime',
        'lastUpdatedTime',
        'sourceCreatedTime',
        'sourceModifiedTime',
        'uploadedTime',
      ]
    );
  }

  /**
   * [Upload a file](https://doc.cognitedata.com/api/v1/#operation/initFileUpload)
   *
   * ```js
   * const fileContent = 'file data here'; // can also be of type ArrayBuffer, Buffer, Blob, File or any
   * // automatic upload:
   * const file = await client.files.upload({name: 'examplefile.jpg', mimeType: 'image/jpeg'}, fileContent);
   *
   * // manual with uploadUrl:
   * const file2 = await client.files.upload({name: 'examplefile.jpg', mimeType: 'image/jpeg'});
   * // then upload using the file.uploadUrl
   * ```
   */
  public upload = (
    fileInfo: ExternalFileInfo,
    fileContent?: FileContent,
    overwrite: boolean = false,
    waitUntilAcknowledged: boolean = false
  ): Promise<FileUploadResponse | FileInfo> => {
    return this.uploadEndpoint(
      fileInfo,
      fileContent,
      overwrite,
      waitUntilAcknowledged
    );
  };

  /**
   * [List files](https://doc.cognitedata.com/api/v1/#operation/advancedListFiles)
   * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/listFiles) -->
   *
   * ```js
   * const files = await client.files.list({filter: {mimeType: 'image/png'}});
   * ```
   */
  public list = (
    scope?: FileRequestFilter
  ): CursorAndAsyncIterator<FileInfo> => {
    return super.listEndpoint(this.callListEndpointWithPost, scope);
  };

  /**
   * [Aggregate files](https://docs.cognite.com/api/v1/#operation/aggregateFiles)
   *
   * ```js
   * const aggregates = await client.files.aggregate({ filter: { uploaded: true } });
   * console.log('Number of uploaded files: ', aggregates[0].count)
   * ```
   */
  public aggregate = (query: FileAggregateQuery): Promise<FileAggregate[]> => {
    return super.aggregateEndpoint(query);
  };

  /**
   * [Retrieve files](https://doc.cognitedata.com/api/v1/#operation/byIdsFiles)
   * <!-- or [just one](https://doc.cognitedata.com/api/v1/#operation/getFileByInternalId) -->
   *
   * ```js
   * const files = await client.files.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve = (
    ids: IdEither[],
    params: FileRetrieveParams = {}
  ): Promise<FileInfo[]> => {
    return super.retrieveEndpoint(ids, params);
  };

  /**
   * [Update files](https://doc.cognitedata.com/api/v1/#operation/updateFiles)
   *
   * ```js
   * const files = await client.files.update([{
   *   id: 123,
   *   update: {
   *     source: { set: 'new source' }
   *   }
   * }]);
   * ```
   */
  public update = (changes: FileChangeUpdate[]) => {
    return super.updateEndpoint(changes);
  };

  /**
   * [Search for files](https://doc.cognitedata.com/api/v1/#operation/searchFiles)
   *
   * ```js
   * const files = await client.files.search({
   *   filter: {
   *     mimeType: 'image/jpeg',
   *   },
   *   search: {
   *     name: 'Pump'
   *   }
   * });
   * ```
   */
  public search = (query: FilesSearchFilter) => {
    return super.searchEndpoint(query);
  };

  /**
   * [Delete files](https://doc.cognitedata.com/api/v1/#operation/deleteFiles)
   *
   * ```js
   * await client.files.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public delete = (ids: IdEither[]) => {
    return super.deleteEndpoint(ids);
  };

  /**
   * [Get download urls](https://doc.cognitedata.com/api/v1/#operation/downloadLinks)
   *
   * ```js
   * await client.files.getDownloadUrls([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public getDownloadUrls = (
    ids: IdEither[]
  ): Promise<(FileLink & IdEither)[]> => {
    return this.getDownloadUrlsEndpoint(ids);
  };

  private async uploadEndpoint(
    fileInfo: ExternalFileInfo,
    fileContent?: FileContent,
    overwrite: boolean = false,
    waitUntilAcknowledged: boolean = false
  ) {
    const hasFileContent = fileContent != null;
    if (!hasFileContent && waitUntilAcknowledged) {
      throw Error(
        "Don't set waitUntilAcknowledged to true when you are not uploading a file"
      );
    }

    const params = { overwrite };
    const path = this.url();
    const response = await this.post<FileUploadResponse>(path, {
      params,
      data: fileInfo,
    });
    const file = response.data;
    if (fileContent != null) {
      await this.uploadFile(file.uploadUrl, fileContent, fileInfo.mimeType);
    }
    if (waitUntilAcknowledged) {
      const uploadedFile = await this.waitUntilFileIsUploaded(file.id);
      return this.addToMapAndReturn(uploadedFile, response);
    }
    return this.addToMapAndReturn(file, response);
  }

  private uploadFile(url: string, fileContent: FileContent, mimeType?: string) {
    const headers: HttpHeaders = {
      'Content-Type': mimeType || 'application/octet-stream',
    };
    return this.put(url, {
      headers,
      data: fileContent,
    });
  }

  // TODO: refactor - similar to RetryableHttpClient.rawRequest
  private async waitUntilFileIsUploaded(
    fileId: CogniteInternalId
  ): Promise<FileInfo> {
    const MAX_RETRIES = 10;
    const DELAY_IN_MS = 500;
    let retryCount = 0;
    do {
      const [fileInfo] = await this.retrieve([{ id: fileId }]);
      if (fileInfo.uploaded) {
        return fileInfo;
      }
      retryCount++;
      await sleepPromise(DELAY_IN_MS);
    } while (retryCount < MAX_RETRIES);
    throw Error(`File never marked as 'uploaded'`);
  }

  private async getDownloadUrlsEndpoint(items: IdEither[]) {
    const path = this.url('downloadlink');
    const response = await this.post<ItemsWrapper<(FileLink & IdEither)[]>>(
      path,
      { data: { items } }
    );
    return this.addToMapAndReturn(response.data.items, response);
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

export type FileRetrieveParams = IgnoreUnknownIds;

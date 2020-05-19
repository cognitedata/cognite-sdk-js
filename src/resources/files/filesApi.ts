// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator } from '../../autoPagination';
import { BaseResourceAPI } from '../../resources/baseResourceApi';
import {
  CogniteInternalId,
  ExternalFilesMetadata,
  FileAggregate,
  FileAggregateQuery,
  FileChangeUpdate,
  FileContent,
  FileLink,
  FileRequestFilter,
  FilesMetadata,
  FilesSearchFilter,
  IdEither,
  IgnoreUnknownIds,
  ItemsWrapper,
  UploadFileMetadataResponse,
} from '../../types/types';
import { sleepPromise } from '../../utils';
import { HttpHeaders } from '../../utils/http/basicHttpClient';

export class FilesAPI extends BaseResourceAPI<FilesMetadata> {
  /**
   * [Upload a file](https://doc.cognitedata.com/api/v1/#operation/initFileUpload)
   *
   * ```js
   * const fileContent = 'file data here'; // can also be of type ArrayBuffer, Buffer, Blob, File or any
   * // automatic upload:
   * const file = await client.files.upload({name: 'examplefile.jpg', mimeType: 'image/jpg'}, fileContent);
   *
   * // manual with uploadUrl:
   * const file2 = await client.files.upload({name: 'examplefile.jpg', mimeType: 'image/jpg'});
   * // then upload using the file.uploadUrl
   * ```
   */
  public upload = (
    metadata: ExternalFilesMetadata,
    fileContent?: FileContent,
    overwrite: boolean = false,
    waitUntilAcknowledged: boolean = false
  ): Promise<UploadFileMetadataResponse | FilesMetadata> => {
    return this.uploadEndpoint(
      metadata,
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
  ): CursorAndAsyncIterator<FilesMetadata> => {
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
  ): Promise<FilesMetadata[]> => {
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
   *     mimeType: 'image/jpg',
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
    metadata: ExternalFilesMetadata,
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
    const response = await this.httpClient.post<UploadFileMetadataResponse>(
      path,
      {
        params,
        data: metadata,
      }
    );
    const file = response.data;
    if (fileContent != null) {
      await this.uploadFile(file.uploadUrl, fileContent, metadata.mimeType);
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
    return this.httpClient.put(url, {
      headers,
      data: fileContent,
    });
  }

  // TODO: refactor - similar to RetryableHttpClient.rawRequest
  private async waitUntilFileIsUploaded(
    fileId: CogniteInternalId
  ): Promise<FilesMetadata> {
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
    const response = await this.httpClient.post<
      ItemsWrapper<(FileLink & IdEither)[]>
    >(path, { data: { items } });
    return this.addToMapAndReturn(response.data.items, response);
  }
}

export type FileRetrieveParams = IgnoreUnknownIds;

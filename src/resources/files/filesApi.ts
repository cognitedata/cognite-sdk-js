// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../../autoPagination';
import { MetadataMap } from '../../metadata';
import {
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveEndpoint,
  generateSearchEndpoint,
  generateUpdateEndpoint,
} from '../../standardMethods';
import {
  ExternalFilesMetadata,
  FileChangeUpdate,
  FileContent,
  FileLink,
  FileRequestFilter,
  FilesMetadata,
  FilesSearchFilter,
  IdEither,
  UploadFileMetadataResponse,
} from '../../types/types';
import { projectUrl } from '../../utils';
import {
  generateDownloadUrlEndpoint,
  generateUploadEndpoint,
} from './filesUtils';

export class FilesAPI {
  private listEndpoint: FilesListEndpoint;
  private uploadEndpoint: FilesUploadEndpoint;
  private retrieveEndpoint: FilesRetrieveEndpoint;
  private searchEndpoint: FilesSearchEndpoint;
  private deleteEndpoint: FilesDeleteEndpoint;
  private getDownloadUrlsEndpoint: FilesGetDownloadUrlsEndpoint;
  private updateEndpoint: FilesUpdateEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/files';
    this.listEndpoint = generateListEndpoint(instance, path, map, true);
    this.uploadEndpoint = generateUploadEndpoint(instance, path, map);
    this.retrieveEndpoint = generateRetrieveEndpoint(instance, path, map);
    this.searchEndpoint = generateSearchEndpoint(instance, path, map);
    this.deleteEndpoint = generateDeleteEndpoint(instance, path, map);
    this.getDownloadUrlsEndpoint = generateDownloadUrlEndpoint(
      instance,
      path,
      map
    );
    this.updateEndpoint = generateUpdateEndpoint(instance, path, map);
  }

  /**
   * [List files](https://doc.cognitedata.com/api/v1/#operation/advancedListFiles)
   *
   * ```js
   * const files = await client.files.list({filter: {mimeType: 'image/png'}});
   * ```
   */
  public list: FilesListEndpoint = scope => {
    return this.listEndpoint(scope);
  };

  /**
   * [Upload a file](https://doc.cognitedata.com/api/v1/#operation/initFileUpload)
   *
   * ```js
   * // automatic upload:
   * const file = await client.files.upload({name: 'examplefile.jpg', mimeType: 'image/jpg'}, fileContent);
   *
   * // manual with uploadUrl:
   * const file = await client.files.upload({name: 'examplefile.jpg', mimeType: 'image/jpg'});
   * // then upload using the file.uploadUrl
   * ```
   */
  public upload: FilesUploadEndpoint = (
    metadata,
    fileContent,
    overwrite,
    waitUntilAcknowledged
  ) => {
    return this.uploadEndpoint(
      metadata,
      fileContent,
      overwrite,
      waitUntilAcknowledged
    );
  };

  /**
   * [Retrieve files](https://doc.cognitedata.com/api/v1/#operation/byIdsFiles)
   *
   * ```js
   * const files = await client.files.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve: FilesRetrieveEndpoint = ids => {
    return this.retrieveEndpoint(ids);
  };

  /**
   * [Search for files](https://doc.cognitedata.com/api/v1/#operation/searchFiles)
   *
   * ```js
   * const files = await client.files.search([{
   *   filter: {
   *     mimeType: 'image/jpg',
   *   },
   *   search: {
   *     name: 'Pump'
   *   }
   * }]);
   * ```
   */
  public search: FilesSearchEndpoint = query => {
    return this.searchEndpoint(query);
  };

  /**
   * [Delete files](https://doc.cognitedata.com/api/v1/#operation/deleteFiles)
   *
   * ```js
   * await client.files.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public delete: FilesDeleteEndpoint = ids => {
    return this.deleteEndpoint(ids);
  };

  /**
   * [Get download urls](https://doc.cognitedata.com/api/v1/#operation/deleteFiles)
   *
   * ```js
   * await client.files.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public getDownloadUrls: FilesGetDownloadUrlsEndpoint = ids => {
    return this.getDownloadUrlsEndpoint(ids);
  };

  /**
   * [Update files](https://doc.cognitedata.com/api/v1/#operation/updateFiles)
   *
   * ```js
   * const files = await client.files.update([{id: 123, update: {description: {set: 'New description'}}}]);
   * ```
   */
  public update: FilesUpdateEndpoint = changes => {
    return this.updateEndpoint(changes);
  };
}

export type FilesListEndpoint = (
  scope?: FileRequestFilter
) => CogniteAsyncIterator<FilesMetadata>;

export type FilesUploadEndpoint = (
  metadata: ExternalFilesMetadata,
  fileContent?: FileContent,
  // tslint:disable-next-line:bool-param-default
  overwrite?: boolean,
  // tslint:disable-next-line:bool-param-default
  waitUntilAcknowledged?: boolean
) => Promise<UploadFileMetadataResponse | FilesMetadata>;

export type FilesRetrieveEndpoint = (
  ids: IdEither[]
) => Promise<FilesMetadata[]>;

export type FilesSearchEndpoint = (
  query: FilesSearchFilter
) => Promise<FilesMetadata[]>;

export type FilesDeleteEndpoint = (ids: IdEither[]) => Promise<{}>;

export type FilesGetDownloadUrlsEndpoint = (
  ids: IdEither[]
) => Promise<(FileLink & IdEither)[]>;

export type FilesUpdateEndpoint = (
  changes: FileChangeUpdate[]
) => Promise<FilesMetadata[]>;

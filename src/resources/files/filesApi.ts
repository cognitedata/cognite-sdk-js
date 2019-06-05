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
  FileContent,
  FileRequestFilter,
  IdEither,
  UploadFileMetadataResponse,
} from '../../types/custom';
import {
  ExternalFilesMetadata,
  FileChangeUpdate,
  FileLink,
  FilesMetadata,
  FilesSearchFilter,
} from '../../types/types';
import { projectUrl } from '../../utils';
import {
  generateDownloadUrlEndpoint,
  generateUploadEndpoint,
} from './filesUtils';

export class FilesAPI {
  /**
   * [List files](https://doc.cognitedata.com/api/v1/#operation/advancedListFiles)
   *
   * ```js
   * const files = await client.files.list({filter: {mimeType: 'image/png'}});
   * ```
   */
  public list: FilesListEndpoint;

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
  public upload: FilesUploadEndpoint;

  /**
   * [Retrieve files](https://doc.cognitedata.com/api/v1/#operation/byIdsFiles)
   *
   * ```js
   * const files = await client.files.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve: FilesRetrieveEndpoint;

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
  public search: FilesSearchEndpoint;

  /**
   * [Delete files](https://doc.cognitedata.com/api/v1/#operation/deleteFiles)
   *
   * ```js
   * await client.files.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public delete: FilesDeleteEndpoint;

  /**
   * [Get download urls](https://doc.cognitedata.com/api/v1/#operation/deleteFiles)
   *
   * ```js
   * await client.files.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public getDownloadUrls: FilesGetDownloadUrlsEndpoint;

  /**
   * [Update files](https://doc.cognitedata.com/api/v1/#operation/updateFiles)
   *
   * ```js
   * const files = await client.files.update([{id: 123, update: {description: {set: 'New description'}}}]);
   * ```
   */
  public update: FilesUpdateEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/files';
    this.list = generateListEndpoint(instance, path, map, true);
    this.upload = generateUploadEndpoint(instance, path, map);
    this.retrieve = generateRetrieveEndpoint(instance, path, map);
    this.search = generateSearchEndpoint(instance, path, map);
    this.delete = generateDeleteEndpoint(instance, path, map);
    this.getDownloadUrls = generateDownloadUrlEndpoint(instance, path, map);
    this.update = generateUpdateEndpoint(instance, path, map);
  }
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

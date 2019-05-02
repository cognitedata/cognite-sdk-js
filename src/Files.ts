// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, metadataMap, projectUrl, rawGet, rawPost } from './core';

export interface File {
  id: number;
  fileName: string;
  directory?: string;
  source?: string;
  sourceId?: string;
  fileType?: string;
  assetIds?: number[];
  metadata?: { [key: string]: string };
  uploadedAt?: number;
  createdTime?: number;
  lastUpdatedTime?: number;
  uploaded?: boolean;
}

interface FileMetadataResponse {
  data: {
    items: File[];
  };
}

export interface FileMetadataWithCursor {
  previousCursor?: string;
  nextCursor?: string;
  items: File[];
}

interface FileMetadataWithCursorResponse {
  data: FileMetadataWithCursor;
}

export interface FileUploadParams {
  contentType?: string;
  origin?: string;
  resumable?: boolean;
  overwrite?: boolean;
}

export interface FileUploadResponse {
  fileId: number;
  uploadURL: string;
}

export interface FileDeleteResponse {
  deleted: number[];
  failed: number[];
}

export interface FileListParams {
  assetId?: number;
  dir?: string;
  name?: string;
  type?: string;
  source?: string;
  isUploaded?: boolean;
  limit?: number;
  sort?: string;
  cursor?: string;
}

export interface FileSearchParams {
  name?: string;
  directory?: string;
  type?: string;
  uploaded?: boolean;
  minUploadedAt?: number;
  maxUploadedAt?: number;
  minCreatedTime?: number;
  maxCreatedTime?: number;
  minLastUpdatedTime?: number;
  maxLastUpdatedTime?: number;
  metadata?: { [k: string]: string };
  assetIds?: number[];
  assetSubtrees?: number[];
  sort?: string;
  dir?: string;
  limit?: number;
  offset?: number;
}

/**
 * @hidden
 */
const filesUrl = (): string => `${apiUrl(0.5)}/${projectUrl()}/files`;

export class Files {
  public static async upload(
    file: Partial<File>,
    params: FileUploadParams = {}
  ): Promise<FileUploadResponse> {
    interface RequestParams {
      resumable?: boolean;
      overwrite?: boolean;
    }
    const reqParams: RequestParams = {};
    if (params.resumable !== undefined) {
      reqParams.resumable = params.resumable;
    }
    if (params.overwrite !== undefined) {
      reqParams.overwrite = params.overwrite;
    }
    interface RequestHeaders {
      'X-Upload-Content-Type'?: string;
      Origin?: string;
    }
    const headers: RequestHeaders = {};
    if (params.contentType !== undefined) {
      headers['X-Upload-Content-Type'] = params.contentType;
    }
    if (params.origin !== undefined) {
      headers.Origin = params.origin;
    }
    const url = `${filesUrl()}/initupload`;
    const response = (await rawPost(url, {
      data: file,
      params: reqParams,
      headers,
    })) as AxiosResponse<any>;
    return response.data.data;
  }

  public static async download(fileId: number): Promise<string> {
    const url = `${filesUrl()}/${fileId}/downloadlink`;
    const response = (await rawGet(url)) as AxiosResponse<any>;
    return response.data.data;
  }

  public static async retrieveMetadata(fileId: number): Promise<File> {
    const url = `${filesUrl()}/${fileId}`;
    const response = (await rawGet(url)) as AxiosResponse<FileMetadataResponse>;
    return response.data.data.items[0];
  }

  public static async retrieveMultipleMetadata(
    fileIds: number[]
  ): Promise<File[]> {
    const url = `${filesUrl()}/byids`;
    const body = { items: fileIds };
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      FileMetadataResponse
    >;
    return response.data.data.items;
  }

  public static async updateMetadata(
    fileId: number,
    changes: object
  ): Promise<File> {
    const url = `${filesUrl()}/${fileId}/update`;
    const response = (await rawPost(url, { data: changes })) as AxiosResponse<
      FileMetadataResponse
    >;
    return response.data.data.items[0];
  }

  public static async updateMultipleMetadata(changes: object): Promise<void> {
    const url = `${filesUrl()}/update`;
    const body = { items: changes };
    await rawPost(url, { data: body });
  }

  public static async delete(fileIds: number[]): Promise<FileDeleteResponse> {
    const url = `${filesUrl()}/delete`;
    const body = { items: fileIds };
    const response = (await rawPost(url, { data: body })) as AxiosResponse<any>;
    return response.data.data;
  }

  public static async list(
    params?: FileListParams
  ): Promise<FileMetadataWithCursor> {
    const url = `${filesUrl()}`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      FileMetadataWithCursorResponse
    >;
    return response.data.data;
  }

  public static async search(
    params: FileSearchParams
  ): Promise<FileMetadataWithCursor> {
    const url = `${filesUrl()}/search`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      FileMetadataWithCursorResponse
    >;
    return metadataMap.addAndReturn(response.data.data, response);
  }

  public static async replaceMetadata(files: File[]): Promise<void> {
    const url = `${filesUrl()}`;
    const body = { items: files };
    await rawPost(url, { data: body });
  }
}

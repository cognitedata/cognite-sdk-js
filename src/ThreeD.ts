// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, projectUrl, rawGet, rawPost, rawPut } from './core';

export interface AssetMapping {
  nodeId: number;
  assetId: number;
  treeIndex?: number;
  subtreeSize?: number;
}

export interface Model {
  name: string;
  id: number;
  createdTime: number;
}

export type DONE = 'Done';
export type FAILED = 'Failed';
export type QUEUED = 'Queued';
export type PROCESSING = 'Processing';
export type RevisionStatus = DONE | FAILED | QUEUED | PROCESSING;
export interface Revision {
  published: boolean;
  rotation?: number[];
  camera?: Camera;
  id: number;
  fileId: number;
  status: RevisionStatus;
  thumbnailThreedFileId?: number;
  thumbnailURL?: string;
  sceneThreedFileId?: number;
  sceneThreedFiles?: VersionedThreedFile[];
  assetMappingCount: number;
  createdTime: number;
}

export interface NodeMetadata {
  [key: string]: string;
}

export interface Node {
  id: number;
  treeIndex: number;
  parentId: number | null;
  depth: number;
  name: string;
  subtreeSize: number;
  boundingBox?: BoundingBox;
  sectorId?: number;
  metadata: NodeMetadata;
}

export interface Sector {
  id: number;
  parentId: number | null;
  path: string;
  depth: number;
  boundingBox: BoundingBox;
  threedFileId: number;
  threedFiles: VersionedThreedFile[];
}

export interface BoundingBox {
  min: number[];
  max: number[];
}

interface DataResponse<T> {
  data: {
    items: T[];
  };
}

export interface DataWithCursor<T> {
  previousCursor?: string;
  nextCursor?: string;
  items: T[];
}

interface DataResponseWithCursor<T> {
  data: DataWithCursor<T>;
}

export interface Camera {
  target: number[];
  position: number[];
}

export interface VersionedThreedFile {
  version: number;
  fileId: number;
}

export interface CreateRevision {
  fileId: number;
  rotation?: number[];
  camera?: Camera;
}

export interface ThreeDListAssetMappingsParams {
  cursor?: string;
  limit?: number;
  nodeId?: number;
  assetId?: number;
}

export interface ThreeDListModelsParams {
  cursor?: string;
  limit?: number;
  published?: boolean;
}

export interface ThreeDListNodesParams {
  cursor?: string;
  limit?: number;
  depth?: number;
  nodeId?: number;
  includeAncestors?: boolean;
  metadata?: NodeMetadata;
}

export interface ThreeDListNodeAncestorsParams {
  nodeId: number;
  cursor?: string;
  limit?: number;
}

export interface ThreeDListRevisionsParams {
  cursor?: string;
  limit?: number;
  published?: boolean;
}

export interface ThreeDListSectorsParams {
  boundingBox?: BoundingBox;
  cursor?: string;
  limit?: number;
}

export type ResponseType =
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'text'
  | 'stream';
export type DownloadProgress = (progressEvent: any) => void;

/**
 * @hidden
 */
const threeDUrl = (): string => `${apiUrl(0.6)}/${projectUrl()}/3d`;

export class ThreeD {
  public static async createAssetMappings(
    modelId: number,
    revisionId: number,
    assetMappings: AssetMapping[]
  ): Promise<AssetMapping[]> {
    const body = {
      items: assetMappings,
    };
    const url = `${threeDUrl()}/models/${modelId}/revisions/${revisionId}/mappings`;
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      DataResponse<AssetMapping>
    >;
    return response.data.data.items;
  }

  public static async createModels(names: string[]): Promise<Model[]> {
    const body = {
      items: names.map(name => ({ name })),
    };
    const url = `${threeDUrl()}/models`;
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      DataResponse<Model>
    >;
    return response.data.data.items;
  }

  public static async createRevisions(
    modelId: number,
    revisions: CreateRevision[]
  ): Promise<Revision[]> {
    const body = {
      items: revisions,
    };
    const url = `${threeDUrl()}/models/${modelId}/revisions`;
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      DataResponse<Revision>
    >;
    return response.data.data.items;
  }

  public static async retrieveFile(
    fileId: number,
    responseType: ResponseType,
    // tslint:disable-next-line:no-empty
    onProgress: DownloadProgress = () => {}
  ): Promise<any> {
    const url = `${threeDUrl()}/files/${fileId}`;
    const response = (await rawGet(url, {
      onDownloadProgress: onProgress,
      responseType,
    })) as AxiosResponse<any>;
    return response.data;
  }

  public static async retrieveModel(modelId: number): Promise<Model> {
    const url = `${threeDUrl()}/models/${modelId}`;
    const response = (await rawGet(url)) as AxiosResponse<any>;
    return response.data.data;
  }

  public static async retrieveRevision(
    modelId: number,
    revisionId: number
  ): Promise<Revision> {
    const url = `${threeDUrl()}/models/${modelId}/revisions/${revisionId}`;
    const response = (await rawGet(url)) as AxiosResponse<any>;
    return response.data.data;
  }

  public static async updateModels(models: Partial<Model>[]): Promise<Model[]> {
    const body = {
      items: models,
    };
    const url = `${threeDUrl()}/models`;
    const response = (await rawPut(url, { data: body })) as AxiosResponse<
      DataResponse<Model>
    >;
    return response.data.data.items;
  }

  public static async updateRevisions(
    modelId: number,
    revisions: Partial<Revision>[]
  ): Promise<Revision[]> {
    const body = {
      items: revisions,
    };
    const url = `${threeDUrl()}/models/${modelId}/revisions`;
    const response = (await rawPut(url, { data: body })) as AxiosResponse<
      DataResponse<Revision>
    >;
    return response.data.data.items;
  }

  public static async updateRevisionThumbnail(
    modelId: number,
    revisionId: number,
    fileId: number
  ): Promise<void> {
    const url = `${threeDUrl()}/models/${modelId}/revisions/${revisionId}/thumbnail`;
    const body = { fileId };
    await rawPost(url, { data: body });
  }

  public static async deleteModels(modelIds: number[]): Promise<void> {
    const url = `${threeDUrl()}/models/delete`;
    const body = { items: modelIds };
    await rawPost(url, { data: body });
  }

  public static async deleteRevisions(
    modelId: number,
    revisionIds: number[]
  ): Promise<void> {
    const url = `${threeDUrl()}/models/${modelId}/revisions/delete`;
    const body = { items: revisionIds };
    await rawPost(url, { data: body });
  }

  public static async deleteAssetMappings(
    modelId: number,
    revisionId: number,
    mappings: AssetMapping[]
  ): Promise<void> {
    const url = `${threeDUrl()}/models/${modelId}/revisions/${revisionId}/mappings/delete`;
    const body = { items: mappings };
    await rawPost(url, { data: body });
  }

  public static async listAssetMappings(
    modelId: number,
    revisionId: number,
    params?: ThreeDListAssetMappingsParams
  ): Promise<DataWithCursor<AssetMapping>> {
    const url = `${threeDUrl()}/models/${modelId}/revisions/${revisionId}/mappings`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      DataResponseWithCursor<AssetMapping>
    >;
    return response.data.data;
  }

  public static async listModels(
    params?: ThreeDListModelsParams
  ): Promise<DataWithCursor<Model>> {
    const url = `${threeDUrl()}/models`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      DataResponseWithCursor<Model>
    >;
    return response.data.data;
  }

  public static async listNodes(
    modelId: number,
    revisionId: number,
    params?: ThreeDListNodesParams
  ): Promise<DataWithCursor<Node>> {
    const url = `${threeDUrl()}/models/${modelId}/revisions/${revisionId}/nodes`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      DataResponseWithCursor<Node>
    >;
    return response.data.data;
  }

  public static async listNodeAncestors(
    modelId: number,
    revisionId: number,
    params: ThreeDListNodeAncestorsParams
  ): Promise<DataWithCursor<Node>> {
    const url = `${threeDUrl()}/models/${modelId}/revisions/${revisionId}/nodes/ancestors`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      DataResponseWithCursor<Node>
    >;
    return response.data.data;
  }

  public static async listRevisions(
    modelId: number,
    params?: ThreeDListRevisionsParams
  ): Promise<DataWithCursor<Revision>> {
    const url = `${threeDUrl()}/models/${modelId}/revisions`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      DataResponseWithCursor<Revision>
    >;
    return response.data.data;
  }

  public static async listSectors(
    modelId: number,
    revisionId: number,
    params: ThreeDListSectorsParams = {}
  ): Promise<DataWithCursor<Sector>> {
    interface RequestParams {
      cursor?: string;
      limit?: number;
      boundingBox?: string;
    }
    const reqParams: RequestParams = {};
    if (params.cursor !== undefined) {
      reqParams.cursor = params.cursor;
    }
    if (params.limit !== undefined) {
      reqParams.limit = params.limit;
    }
    if (params.boundingBox !== undefined) {
      const bbox = params.boundingBox;
      reqParams.boundingBox = `${bbox.min.join(',')},${bbox.max.join(',')}`;
    }
    const url = `${threeDUrl()}/models/${modelId}/revisions/${revisionId}/sectors`;
    const response = (await rawGet(url, {
      params: reqParams,
    })) as AxiosResponse<DataResponseWithCursor<Sector>>;
    return response.data.data;
  }
}

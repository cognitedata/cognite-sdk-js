// Copyright 2019 Cognite AS
import {
  AssetIdEither,
  AzureADConfigurationDTO,
  BoundingBox3D,
  Cursor,
  ExternalAsset,
  FileFilter,
  FilesMetadata,
  OAuth2ConfigurationDTO,
} from './types';

export interface FileRequestFilter extends Cursor, FileFilter {}

export type CogniteInternalId = number;

export type CogniteExternalId = string;

export interface ApiKeyListScope {
  /**
   * Only available with users:list acl, returns all api keys for this project.
   */
  all?: boolean;
  /**
   * Get api keys for a specific service account, only available to admin users.
   */
  serviceAccountId?: CogniteInternalId;
  /**
   * Whether to include deleted api keys
   */
  includeDeleted?: boolean;
}

export type FileContent = ArrayBuffer | Buffer | any;

export interface UploadFileMetadataResponse extends FilesMetadata {
  uploadUrl: string;
}

export type IdEither = AssetIdEither;

export interface ApiKeyListScope {
  /**
   * Only available with users:list acl, returns all api keys for this project.
   */
  all?: boolean;
  /**
   * Get api keys for a specific service account, only available to admin users.
   */
  serviceAccountId?: CogniteInternalId;
  /**
   * Whether to include deleted api keys
   */
  includeDeleted?: boolean;
}

export interface ListRevealSectors3DQuery extends Cursor, Limit {
  /**
   * Bounding box to restrict search to. If given, only return sectors that intersect the given bounding box. Given as a JSON-encoded object of two arrays \"min\" and \"max\" with 3 coordinates each.
   */
  boundingBox?: BoundingBox3D;
}

export interface List3DNodesQuery extends Cursor, Limit {
  /**
   * Get sub nodes up to this many levels below the specified node. Depth 0 is the root node.
   */
  depth?: number;
  /**
   * ID of a node that are the root of the subtree you request (default is the root node).
   */
  nodeId?: CogniteInternalId;
}

export interface Limit {
  limit?: number;
}

export interface AssetMappings3DListFilter extends Cursor, Limit {
  nodeId?: CogniteInternalId;
  assetId?: CogniteInternalId;
}

export interface ItemsResponse<T> {
  items: T[];
}

export interface CursorResponse<T> extends ItemsResponse<T> {
  nextCursor: string;
}

export type Tuple3<T> = [T, T, T];

export interface ListRawDatabases extends Cursor, Limit {}

export interface ListRawTables extends Cursor, Limit {}

export interface ListRawRows extends Cursor, Limit {
  /**
   * Set this to true if you only want to fetch row keys
   */
  onlyRowKeys?: boolean;
  /**
   * Specify this to limit columns to retrieve. Array of column keys
   */
  columns?: string[];
  /**
   * Exclusive filter for last updated time. When specified only rows updated after this time will be returned
   */
  minLastUpdatedTime?: Date;
  /**
   * Inclusive filter for last updated time. When specified only rows updated before this time will be returned
   */
  maxLastUpdatedTime?: Date;
}

export interface Model3DListRequest extends Limit {
  /**
   * Filter based on whether or not it has published revisions.
   */
  published?: boolean;
}

export interface ListSecurityCategories extends Cursor, Limit {
  sort?: 'ASC' | 'DESC';
}

export interface TimeseriesFilter extends Limit {
  /**
   * Decide if the metadata field should be returned or not.
   */
  includeMetadata?: boolean;
  /**
   * Cursor for paging through time series.
   */
  cursor?: string;
  /**
   * Get time series related to these assets. Takes [ 1 .. 100 ] unique items.
   */
  assetIds?: number[];
}

export interface ListResponse<T> extends CursorResponse<T> {
  next?: () => Promise<ListResponse<T>>;
}

export interface Revision3DListRequest extends Limit {
  /**
   * Filter based on whether or not it has published revisions.
   */
  published?: boolean;
}

export interface ExternalAssetItem extends ExternalAsset {
  /**
   * External id to the parent asset
   */
  parentExternalId?: CogniteExternalId;
}

export interface GroupServiceAccount {
  /**
   * Unique name of the service account
   * @example some-internal-service@apple.com
   */
  name: string;
  id: CogniteInternalId;
  /**
   * List of group ids
   */
  groups: CogniteInternalId[];
  /**
   * If this service account has been logically deleted
   */
  isDeleted: boolean;
  /**
   * Time of deletion
   */
  deletedTime?: Date;
}

export interface ListGroups {
  /**
   * Whether to get all groups, only available with the groups:list acl.
   */
  all?: boolean;
}

/**
 * The display name of the project.
 * @example Open Industrial Data
 */
export type ProjectName = string;

/**
 * The url name of the project. This is used as part of API calls. It should only contain letters, digits and hyphens, as long as the hyphens are not at the start or end.
 * @example publicdata
 */
export type UrlName = string;

/**
 * Information about the project
 */
export interface ProjectResponse {
  name: ProjectName;
  urlName: UrlName;
  defaultGroupId?: DefaultGroupId;
  authentication?: OutputProjectAuthentication;
}

/**
 * A default group for all project users. Can be used to establish default capabilities. WARNING: this group may be logically deleted
 */
export type DefaultGroupId = number;

export interface ProjectUpdate {
  name?: ProjectName;
  defaultGroupId?: DefaultGroupId;
  authentication?: InputProjectAuthentication;
}

/**
 * Data about how to authenticate and authorize users. The authentication configuration is hidden.
 */
export interface OutputProjectAuthentication {
  validDomains?: ValidDomains;
}

/**
 * Data about how to authenticate and authorize users
 */
export interface InputProjectAuthentication {
  azureADConfiguration?: AzureADConfigurationDTO;
  validDomains?: ValidDomains;
  oAuth2Configuration?: OAuth2ConfigurationDTO;
}

/**
 * List of valid domains. If left empty, any user registered with the OAuth2 provider will get access.
 */
export type ValidDomains = string[];

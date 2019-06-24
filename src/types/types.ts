// Copyright 2019 Cognite AS
export type Aggregate =
  | 'average'
  | 'max'
  | 'min'
  | 'count'
  | 'sum'
  | 'interpolation'
  | 'stepInterpolation'
  | 'totalVariation'
  | 'continuousVariance'
  | 'discreteVariance';
export interface ApiKeyRequest {
  serviceAccountId: number; // int64
}
/**
 * ApiKeyResponse
 */
export interface ApiKeyResponse {
  items: {
    /**
     * id of the api key
     * example:
     * 91723917823
     */
    id: number; // int64
    /**
     * id of the service account
     * example:
     * 1283712837
     */
    serviceAccountId: number; // int64
    /**
     * Created time in unix milliseconds
     * example:
     * 1554897980221
     */
    createdTime: Date; // int64
    status: 'ACTIVE' | 'DELETED';
  }[];
}
/**
 * Change that will be applied to array object.
 */
export type ArrayPatchLong = ArrayPatchLongSet | ArrayPatchLongAddOrRemove;
export interface ArrayPatchLongAddOrRemove {
  add?: number /* int64 */[];
  remove?: number /* int64 */[];
}
export interface ArrayPatchLongSet {
  set: number /* int64 */[];
}
/**
 * Representation of a physical asset, e.g plant or piece of equipment
 */
export interface Asset {
  externalId?: CogniteExternalId;
  name: AssetName;
  parentId?: CogniteInternalId; // int64
  description?: AssetDescription;
  metadata?: AssetMetadata;
  source?: AssetSource;
  id: CogniteInternalId; // int64
  createdTime: EpochTimestamp; // int64
  lastUpdatedTime: EpochTimestamp; // int64
  /**
   * IDs of assets on the path to the asset.
   */
  path: number /* int64 */[];
  /**
   * Asset path depth (number of levels below root node).
   */
  depth: number; // int32
}
export type AssetChange = AssetChangeById | AssetChangeByExternalId;
/**
 * Changes applied to asset
 */
export interface AssetChangeByExternalId {
  update: {
    externalId?: SinglePatchString;
    name?: SinglePatchRequiredString;
    description?: SinglePatchString;
    metadata?: ObjectPatch;
    source?: SinglePatchString;
  };
  externalId: CogniteExternalId;
}
/**
 * Changes applied to asset
 */
export interface AssetChangeById {
  update: {
    externalId?: SinglePatchString;
    name?: SinglePatchRequiredString;
    description?: SinglePatchString;
    metadata?: ObjectPatch;
    source?: SinglePatchString;
  };
  id: CogniteInternalId; // int64
}
export type AssetDataResponse = DataAsset;
export type AssetDataWithCursorResponse = DataWithCursorAsset;
/**
 * Description of asset.
 */
export type AssetDescription = string;
export interface AssetExternalId {
  externalId: CogniteExternalId;
}
/**
 * Filter on assets with exact match
 */
export interface AssetFilter {
  filter?: {
    name?: AssetName;
    parentIds?: CogniteInternalId /* int64 */[];
    metadata?: AssetMetadata;
    source?: AssetSource;
    createdTime?: EpochTimestampRange;
    lastUpdatedTime?: EpochTimestampRange;
    /**
     * filtered assets are root assets or not
     */
    root?: boolean;
    externalIdPrefix?: CogniteExternalId;
  };
  /**
   * <- Limits the maximum number of results to be returned by single request. In case there are more results to the request 'nextCursor' attribute will be provided as part of response. Request may contain less results than request limit.
   */
  limit?: number; // int32
}
export type AssetIdEither = AssetInternalId | AssetExternalId;
/**
 * Only include files that reference these specific asset IDs.
 * example:
 * 363848954441724,793045462540095,1261042166839739
 */
export type AssetIds = CogniteInternalId /* int64 */[];
export interface AssetInternalId {
  id: CogniteInternalId; // int64
}
/**
 * Cursor for paging through results
 */
export interface AssetListScope {
  filter?: {
    name?: AssetName;
    parentIds?: CogniteInternalId /* int64 */[];
    metadata?: AssetMetadata;
    source?: AssetSource;
    createdTime?: EpochTimestampRange;
    lastUpdatedTime?: EpochTimestampRange;
    /**
     * filtered assets are root assets or not
     */
    root?: boolean;
    externalIdPrefix?: CogniteExternalId;
  };
  /**
   * <- Limits the maximum number of results to be returned by single request. In case there are more results to the request 'nextCursor' attribute will be provided as part of response. Request may contain less results than request limit.
   */
  limit?: number; // int32
  cursor?: string;
}
export interface AssetMapping3D {
  /**
   * The ID of the node.
   * example:
   * 1003
   */
  nodeId: number; // int64
  /**
   * The ID of the associated asset (Cognite's Assets API).
   * example:
   * 3001
   */
  assetId: number; // int64
  /**
   * A number describing the position of this node in the 3D hierarchy, starting from 0. The tree is traversed in a depth-first order.
   * example:
   * 5
   */
  treeIndex: number; // int64
  /**
   * The number of nodes in the subtree of this node (this number included the node itself).
   * example:
   * 7
   */
  subtreeSize: number; // int64
}
export interface AssetMapping3DList {
  items: AssetMapping3D[];
}
/**
 * Custom, application specific metadata. String key -> String value
 */
export interface AssetMetadata {
  [name: string]: string;
}
/**
 * Name of asset. Often referred to as tag.
 */
export type AssetName = string;
/**
 * Changes applied to asset
 */
export interface AssetPatch {
  update: {
    externalId?: SinglePatchString;
    name?: SinglePatchRequiredString;
    description?: SinglePatchString;
    metadata?: ObjectPatch;
    source?: SinglePatchString;
  };
}
export type AssetResponse = Asset;
export interface AssetSearch {
  search?: {
    name?: AssetName;
    description?: AssetDescription;
  };
}
/**
 * Filter on assets with exact match
 */
export interface AssetSearchFilter {
  filter?: {
    name?: AssetName;
    parentIds?: CogniteInternalId /* int64 */[];
    metadata?: AssetMetadata;
    source?: AssetSource;
    createdTime?: EpochTimestampRange;
    lastUpdatedTime?: EpochTimestampRange;
    /**
     * filtered assets are root assets or not
     */
    root?: boolean;
    externalIdPrefix?: CogniteExternalId;
  };
  /**
   * <- Limits the maximum number of results to be returned by single request. In case there are more results to the request 'nextCursor' attribute will be provided as part of response. Request may contain less results than request limit.
   */
  limit?: number; // int32
  search?: {
    name?: AssetName;
    description?: AssetDescription;
  };
}
/**
 * The source of this asset
 */
export type AssetSource = string;
/**
 * Data specific to Azure AD authentication
 */
export interface AzureADConfigurationDTO {
  /**
   * Azure application ID. You get this when creating the Azure app.
   */
  appId?: string;
  /**
   * Azure application secret. You get this when creating the Azure app.
   */
  appSecret?: string;
  /**
   * Azure tenant ID.
   */
  tenantId?: string;
  /**
   * Resource to grant access to. This is usually (always?) 00000002-0000-0000-c000-000000000000
   */
  appResourceId?: string;
}
/**
 * The bounding box of the subtree with this sector as the root sector. Is null if there are no geometries in the subtree.
 */
export interface BoundingBox3D {
  max: number /* double */[];
  min: number /* double */[];
}
/**
 * Capability
 */
export type CogniteCapability = (
  | {
      groupsAcl?: CognitegroupsAclAcl;
    }
  | {
      assetsAcl?: CogniteassetsAclAcl;
    }
  | {
      eventsAcl?: CogniteeventsAclAcl;
    }
  | {
      filesAcl?: CognitefilesAclAcl;
    }
  | {
      usersAcl?: CogniteusersAclAcl;
    }
  | {
      projectsAcl?: CogniteprojectsAclAcl;
    }
  | {
      securityCategoriesAcl?: CognitesecuritycategoriesAclAcl;
    }
  | {
      rawAcl?: CogniterawAclAcl;
    }
  | {
      timeSeriesAcl?: CognitetimeseriesAclAcl;
    }
  | {
      apikeysAcl?: CogniteapikeysAclAcl;
    }
  | {
      threedAcl?: CognitethreedAclAcl;
    }
  | {
      sequencesAcl?: CognitesequencesAclAcl;
    }
  | {
      analyticsAcl?: CogniteanalyticsAclAcl;
    })[];
/**
 * External Id provided by client. Should be unique within the project.
 */
export type CogniteExternalId = string;
/**
 * External Id provided by client. Should be unique within the project
 */
export type CogniteExternalIdType = string;
/**
 * Javascript friendly internal ID given to the object.
 */
export type CogniteInternalId = number; // int64
export declare namespace CogniteInternalId {
  export type Id = CogniteInternalId; // int64
}
/**
 * Javascript friendly internal ID given to the object.
 */
export type CogniteInternalIdType = number; // int64
/**
 * Acl:Analytics
 */
export interface CogniteanalyticsAclAcl {
  actions: CogniteanalyticsAclAction[];
  scope: CogniteanalyticsAclScope;
}
/**
 * Analytics:Action
 */
export type CogniteanalyticsAclAction = 'READ' | 'EXECUTE' | 'LIST';
/**
 * Analytics:Scope
 */
export interface CogniteanalyticsAclScope {
  all?: GenericAclAllScope;
}
/**
 * Acl:Apikey
 */
export interface CogniteapikeysAclAcl {
  actions: CogniteapikeysAclAction[];
  scope: CogniteapikeysAclScope;
}
/**
 * Apikey:Action
 */
export type CogniteapikeysAclAction = 'LIST' | 'CREATE' | 'DELETE';
/**
 * Apikey:Scope
 */
export type CogniteapikeysAclScope =
  | {
      all?: GenericAclAllScope;
    }
  | {
      /**
       * apikeys the user making the request has
       */
      currentuserscope?: GenericAclCurrentUserScope;
    };
/**
 * Acl:Asset
 */
export interface CogniteassetsAclAcl {
  actions: CogniteassetsAclAction[];
  scope: CogniteassetsAclScope;
}
/**
 * Asset:Action
 */
export type CogniteassetsAclAction = 'READ' | 'WRITE';
/**
 * Scope:AssetIdScope
 */
export interface CogniteassetsAclIdScope {
  /**
   * root asset id (subtrees)
   */
  subtreeIds?: string /* uint64 */[];
}
/**
 * Asset:Scope
 */
export interface CogniteassetsAclScope {
  all?: GenericAclAllScope;
}
/**
 * Acl:Event
 */
export interface CogniteeventsAclAcl {
  actions: CogniteeventsAclAction[];
  scope: CogniteeventsAclScope;
}
/**
 * Event:Action
 */
export type CogniteeventsAclAction = 'READ' | 'WRITE';
/**
 * Event:Scope
 */
export interface CogniteeventsAclScope {
  all?: GenericAclAllScope;
}
/**
 * Acl:File
 */
export interface CognitefilesAclAcl {
  actions: CognitefilesAclAction[];
  scope: CognitefilesAclScope;
}
/**
 * File:Action
 */
export type CognitefilesAclAction = 'READ' | 'WRITE';
/**
 * File:Scope
 */
export interface CognitefilesAclScope {
  all?: GenericAclAllScope;
}
/**
 * Acl:Group
 */
export interface CognitegroupsAclAcl {
  actions: CognitegroupsAclAction[];
  scope: CognitegroupsAclScope;
}
/**
 * Group:Action
 */
export type CognitegroupsAclAction =
  | 'LIST'
  | 'READ'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE';
/**
 * Group:Scope
 */
export type CognitegroupsAclScope =
  | {
      /**
       * all groups
       */
      all?: GenericAclAllScope;
    }
  | {
      /**
       * groups the current user is in
       */
      currentuserscope?: GenericAclCurrentUserScope;
    };
/**
 * Acl:Project
 */
export interface CogniteprojectsAclAcl {
  actions: CogniteprojectsAclAction[];
  scope: CogniteprojectsAclScope;
}
/**
 * Project:Action
 */
export type CogniteprojectsAclAction = 'LIST' | 'READ' | 'CREATE' | 'UPDATE';
/**
 * Project:Scope
 */
export interface CogniteprojectsAclScope {
  all?: GenericAclAllScope;
}
/**
 * Acl:Raw
 */
export interface CogniterawAclAcl {
  actions: CogniterawAclAction[];
  scope: CogniterawAclScope;
}
/**
 * Raw:Action
 */
export type CogniterawAclAction = 'READ' | 'WRITE' | 'LIST';
/**
 * Raw:Scope
 */
export interface CogniterawAclScope {
  all?: GenericAclAllScope;
}
/**
 * Acl:SecurityCategory
 */
export interface CognitesecuritycategoriesAclAcl {
  actions: CognitesecuritycategoriesAclAction[];
  scope: CognitesecuritycategoriesAclScope;
}
/**
 * SecurityCategory:Action
 */
export type CognitesecuritycategoriesAclAction =
  | 'MEMBEROF'
  | 'LIST'
  | 'CREATE'
  | 'DELETE';
/**
 * SecurityCategory:Scope
 */
export interface CognitesecuritycategoriesAclScope {
  all?: GenericAclAllScope;
}
/**
 * Acl:Sequences
 */
export interface CognitesequencesAclAcl {
  actions: CognitesequencesAclAction[];
  scope: CognitesequencesAclScope;
}
/**
 * Sequences:Action
 */
export type CognitesequencesAclAction = 'READ' | 'WRITE';
/**
 * Sequences:Scope
 */
export interface CognitesequencesAclScope {
  all?: GenericAclAllScope;
}
/**
 * Acl:Threed
 */
export interface CognitethreedAclAcl {
  actions: CognitethreedAclAction[];
  scope: CognitethreedAclScope;
}
/**
 * Threed:Action
 */
export type CognitethreedAclAction = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';
/**
 * Threed:Scope
 */
export interface CognitethreedAclScope {
  all?: GenericAclAllScope;
}
/**
 * Acl:Timeseries
 */
export interface CognitetimeseriesAclAcl {
  actions: CognitetimeseriesAclAction[];
  scope: CognitetimeseriesAclScope;
}
/**
 * Timeseries:Action
 */
export type CognitetimeseriesAclAction = 'READ' | 'WRITE';
/**
 * Timeseries:Scope
 */
export type CognitetimeseriesAclScope =
  | {
      all?: GenericAclAllScope;
    }
  | {
      assetIdScope?: CogniteassetsAclIdScope;
    };
/**
 * Acl:User
 */
export interface CogniteusersAclAcl {
  actions: CogniteusersAclAction[];
  scope: CogniteusersAclScope;
}
/**
 * User:Action
 */
export type CogniteusersAclAction = 'LIST' | 'CREATE' | 'DELETE';
/**
 * User:Scope
 */
export type CogniteusersAclScope =
  | {
      /**
       * all users
       */
      all?: GenericAclAllScope;
    }
  | {
      /**
       * the current user making the request
       */
      currentuserscope?: GenericAclCurrentUserScope;
    };
export interface CreateAssetMapping3D {
  /**
   * The ID of the node.
   * example:
   * 1003
   */
  nodeId: number; // int64
  /**
   * The ID of the associated asset (Cognite's Assets API).
   * example:
   * 3001
   */
  assetId: number; // int64
}
export interface CreateModel3D {
  /**
   * The name of the model.
   * example:
   * My Model
   */
  name: string;
  metadata?: Metadata3D;
}
export interface CreateRevision3D {
  /**
   * True if the revision is marked as published.
   */
  published?: boolean;
  rotation?: number /* double */[];
  metadata?: Metadata3D;
  camera?: RevisionCameraProperties;
  /**
   * The file id to a file uploaded to Cognite's Files API. Can only be set on revision creation, and can never be updated. _Only FBX files are supported_.
   */
  fileId: number; // int64
}
/**
 * The creation time of the resource, in milliseconds since January 1, 1970 at 00:00 UTC.
 * example:
 * 0
 */
export type CreatedTime = Date; // int64
/**
 * Cursor for paging through results
 */
export interface Cursor {
  cursor?: string;
}
export declare namespace Cursor {
  export type Cursor = string;
}
export interface DataApiKeyRequest {
  items: ApiKeyRequest[];
}
export interface DataAsset {
  items: Asset[];
}
export interface DataAssetChange {
  items: AssetChange[];
}
export interface DataEvent {
  items: Event[];
}
export interface DataEventChange {
  items: EventChange[];
}
export interface DataExternalAsset {
  items: DataExternalAssetItem[];
}
/**
 * Representation of a physical asset, e.g plant or piece of equipment
 */
export interface DataExternalAssetItem {
  externalId?: CogniteExternalId;
  name: AssetName;
  parentId?: CogniteInternalId; // int64
  description?: AssetDescription;
  metadata?: AssetMetadata;
  source?: AssetSource;
  parentExternalId?: CogniteExternalId;
}
export interface DataExternalEvent {
  items: ExternalEvent[];
}
export interface DataExternalFileMetadata {
  items?: ExternalFilesMetadata[];
}
export interface DataFileChange {
  items: FileChangeUpdate[];
}
export interface DataFileMetadata {
  items?: FilesMetadata[];
}
/**
 * List of responses. Order matches the requests order.
 */
export interface DataGetTimeSeriesMetadataDTO {
  items: GetTimeSeriesMetadataDTO[];
}
export interface DataGroup {
  items: Group[];
}
export interface DataGroupSpec {
  items: GroupSpec[];
}
export interface DataIdentifier {
  id: CogniteInternalId; // int64
}
export interface DataIdentifiers {
  /**
   * List of ID objects
   */
  items: DataIdentifier[];
}
export interface DataIds {
  items: AssetIdEither[];
}
export interface DataLong {
  /**
   * example:
   * 23872937137,1238712837,128371973
   */
  items: number /* int64 */[];
}
export interface DataRawDB {
  items?: RawDB[];
}
export interface DataRawDBRow {
  items?: RawDBRowInsert[];
}
export interface DataRawDBRowKey {
  items?: RawDBRowKey[];
}
export interface DataRawDBTable {
  items?: RawDBTable[];
}
export interface DataSecurityCategorySpecDTO {
  items: SecurityCategorySpecDTO[];
}
/**
 * A list of objects along with possible cursors to get the next page of results
 */
export interface DataWithCursor {
  items?: FilesMetadata[];
  /**
   * Cursor to get the next page of results (if available).
   */
  nextCursor?: string;
}
/**
 * A list of objects along with possible cursors to get the next, or previous, page of results
 */
export interface DataWithCursorAsset {
  items: Asset[];
  /**
   * Cursor to get the next page of results (if available).
   */
  nextCursor?: string;
}
/**
 * A list of objects along with possible cursors to get the next, or previous, page of results
 */
export interface DataWithCursorEvent {
  items: Event[];
  /**
   * Cursor to get the next page of results (if available).
   */
  nextCursor?: string;
}
/**
 * A list of objects along with possible cursors to get the next page of result
 */
export interface DataWithCursorGetTimeSeriesMetadataDTO {
  items: GetTimeSeriesMetadataDTO[];
  /**
   * Cursor to get the next page of results (if available).
   */
  nextCursor?: string;
}
/**
 * A list of objects along with possible cursors to get the next, or previous, page of results
 */
export interface DataWithCursorRawDB {
  items?: RawDB[];
  /**
   * Cursor to get the next page of results (if available).
   */
  nextCursor?: string;
}
/**
 * A list of objects along with possible cursors to get the next, or previous, page of results
 */
export interface DataWithCursorRawDBRow {
  items?: RawDBRow[];
  /**
   * Cursor to get the next page of results (if available).
   */
  nextCursor?: string;
}
/**
 * A list of objects along with possible cursors to get the next, or previous, page of results
 */
export interface DataWithCursorRawDBTable {
  items?: RawDBTable[];
  /**
   * Cursor to get the next page of results (if available).
   */
  nextCursor?: string;
}
export interface DataWithLinks {
  items?: (FileInternalId | FileExternalId)[];
}
export interface DatapointsDeleteQuery {
  /**
   * List of delete filters
   */
  items: DatapointsDeleteRequest[];
}
export interface DatapointsDeleteRange {
  /**
   * The timestamp of first datapoint to delete
   */
  inclusiveBegin: EpochTimestamp; // int64
  /**
   * If set, the timestamp of first datapoint after inclusiveBegin to not delete. If not set, only deletes the datapoint at inclusiveBegin.
   */
  exclusiveEnd?: EpochTimestamp; // int64
}
/**
 * Select timeseries and datapoints to delete.
 */
export type DatapointsDeleteRequest =
  | {
      /**
       * The timestamp of first datapoint to delete
       */
      inclusiveBegin: EpochTimestamp; // int64
      /**
       * If set, the timestamp of first datapoint after inclusiveBegin to not delete. If not set, only deletes the datapoint at inclusiveBegin.
       */
      exclusiveEnd?: EpochTimestamp; // int64
      id: CogniteInternalId; // int64
    }
  | {
      /**
       * The timestamp of first datapoint to delete
       */
      inclusiveBegin: EpochTimestamp; // int64
      /**
       * If set, the timestamp of first datapoint after inclusiveBegin to not delete. If not set, only deletes the datapoint at inclusiveBegin.
       */
      exclusiveEnd?: EpochTimestamp; // int64
      externalId: CogniteExternalId;
    };
export interface DatapointsGetAggregateDatapoint {
  /**
   * Id of the timeseries the datapoints belong to
   */
  id: CogniteInternalId; // int64
  /**
   * External id of the timeseries the datapoints belong to.
   */
  externalId?: string;
  /**
   * The list of datapoints
   */
  datapoints: GetAggregateDatapoint[];
}
export type DatapointsGetDatapoint =
  | DatapointsGetStringDatapoint
  | DatapointsGetDoubleDatapoint;
export interface DatapointsGetDoubleDatapoint {
  /**
   * Id of the timeseries the datapoints belong to
   */
  id: CogniteInternalId; // int64
  /**
   * External id of the timeseries the datapoints belong to.
   */
  externalId?: string;
  /**
   * Whether the time series is string valued or not.
   */
  isString: boolean;
  /**
   * The list of datapoints
   */
  datapoints: GetDoubleDatapoint[];
}
export interface DatapointsGetStringDatapoint {
  /**
   * Id of the timeseries the datapoints belong to
   */
  id: CogniteInternalId; // int64
  /**
   * External id of the timeseries the datapoints belong to.
   */
  externalId?: string;
  /**
   * Whether the time series is string valued or not.
   */
  isString: boolean;
  /**
   * The list of datapoints
   */
  datapoints: GetStringDatapoint[];
}
export interface DatapointsInsertProperties {
  /**
   * The list of datapoints. Total limit per request is 100000 datapoints.
   */
  datapoints: PostDatapoint[];
}
export interface DatapointsInsertQuery {
  items: DatapointsPostDatapoint[];
}
export interface DatapointsLatestQuery {
  /**
   * List of latest queries
   */
  items: LatestDataBeforeRequest[];
}
export interface DatapointsMetadata {
  /**
   * Id of the timeseries the datapoints belong to
   */
  id: CogniteInternalId; // int64
  /**
   * External id of the timeseries the datapoints belong to.
   */
  externalId?: string;
}
export interface DatapointsMultiQuery {
  items: DatapointsQuery[];
  start?: TimestampOrStringStart;
  end?: TimestampOrStringEnd;
  /**
   * Return up to this number of datapoints.
   */
  limit?: number; // int32
  /**
   * The aggregates to be returned. This value overrides top-level default aggregates list when set. Specify all aggregates to be retrieved here. Specify empty array if this sub-query needs to return datapoints without aggregation.
   */
  aggregates?: Aggregate[];
  /**
   * The time granularity size and unit to aggregate over.
   * example:
   * 1h
   */
  granularity?: string;
  /**
   * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
   */
  includeOutsidePoints?: boolean;
}
/**
 * List of responses. Order matches the requests order.
 */
export interface DatapointsOrAggregatesResponse {
  items: (DatapointsGetAggregateDatapoint | DatapointsGetDatapoint)[];
}
export type DatapointsPostDatapoint =
  | {
      /**
       * The list of datapoints. Total limit per request is 100000 datapoints.
       */
      datapoints: PostDatapoint[];
      id: CogniteInternalId; // int64
    }
  | {
      /**
       * The list of datapoints. Total limit per request is 100000 datapoints.
       */
      datapoints: PostDatapoint[];
      externalId: CogniteExternalId;
    };
/**
 * Parameters describing a query for datapoints.
 */
export type DatapointsQuery =
  | {
      start?: TimestampOrStringStart;
      end?: TimestampOrStringEnd;
      /**
       * Return up to this number of datapoints.
       */
      limit?: number; // int32
      /**
       * The aggregates to be returned.  Use default if null. An empty string must be sent to get raw data if the default is a set of aggregates.
       */
      aggregates?: Aggregate[];
      /**
       * The granularity size and granularity of the aggregates.
       * example:
       * 1h
       */
      granularity?: string;
      /**
       * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
       */
      includeOutsidePoints?: boolean;
      id: CogniteInternalId; // int64
    }
  | {
      start?: TimestampOrStringStart;
      end?: TimestampOrStringEnd;
      /**
       * Return up to this number of datapoints.
       */
      limit?: number; // int32
      /**
       * The aggregates to be returned.  Use default if null. An empty string must be sent to get raw data if the default is a set of aggregates.
       */
      aggregates?: Aggregate[];
      /**
       * The granularity size and granularity of the aggregates.
       * example:
       * 1h
       */
      granularity?: string;
      /**
       * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
       */
      includeOutsidePoints?: boolean;
      externalId: CogniteExternalId;
    };
export interface DatapointsQueryProperties {
  start?: TimestampOrStringStart;
  end?: TimestampOrStringEnd;
  /**
   * Return up to this number of datapoints.
   */
  limit?: number; // int32
  /**
   * The aggregates to be returned.  Use default if null. An empty string must be sent to get raw data if the default is a set of aggregates.
   */
  aggregates?: Aggregate[];
  /**
   * The granularity size and granularity of the aggregates.
   * example:
   * 1h
   */
  granularity?: string;
  /**
   * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
   */
  includeOutsidePoints?: boolean;
}
/**
 * List of responses. Order matches the requests order.
 */
export interface DatapointsResponse {
  items: DatapointsGetDatapoint[];
}
/**
 * A default group for all project users. Can be used to establish default capabilities.WARNING: this group may be logically deleted
 * example:
 * 123871937
 */
export type DefaultGroupId = number; // int64
export interface DeleteAssetMapping3D {
  /**
   * The ID of the node.
   * example:
   * 1003
   */
  nodeId: number; // int64
  /**
   * The ID of the associated asset (Cognite's Assets API).
   * example:
   * 3001
   */
  assetId: number; // int64
}
export interface DuplicatedIdsInRequestResponse {
  /**
   * Error details
   */
  error: {
    /**
     * HTTP status code
     * example:
     * 422
     */
    code: number; // int32
    /**
     * Error message
     */
    message: string;
    /**
     * Items which are duplicated
     */
    duplicated: (
      | {
          id: CogniteInternalId; // int64
        }
      | {
          externalId: CogniteExternalId;
        })[];
  };
}
export type EitherId = InternalId | ExternalId;
export interface EmptyResponse {}
/**
 * It is the number of milliseconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
 */
export type EpochTimestamp = Date; // int64
/**
 * Range between two timestamps
 */
export interface EpochTimestampRange {
  max?: EpochTimestamp; // int64
  min?: EpochTimestamp; // int64
}
/**
 * Cognite API error
 */
export interface Error {
  /**
   * HTTP status code
   * example:
   * 401
   */
  code: number; // int32
  /**
   * Error message
   * example:
   * Could not authenticate.
   */
  message: string;
  /**
   * List of lookup objects that have not matched any results.
   */
  missing?: {
    [name: string]: any;
  }[];
  /**
   * List of objects that violate the uniqueness constraint.
   */
  duplicated?: {
    [name: string]: any;
  }[];
}
export interface ErrorResponse {
  error: Error;
}
/**
 * An event represents something that happened at a given interval in time, e.g a failure, a work order etc.
 */
export interface Event {
  externalId?: CogniteExternalIdType;
  startTime?: EpochTimestamp; // int64
  endTime?: EpochTimestamp; // int64
  /**
   * Type of the event, e.g 'failure'.
   */
  type?: string;
  /**
   * Subtype of the event, e.g 'electrical'.
   */
  subtype?: string;
  /**
   * Textual description of the event.
   */
  description?: string;
  metadata?: EventMetadata;
  /**
   * Asset IDs of related equipment that this event relates to.
   */
  assetIds?: CogniteInternalIdType /* int64 */[];
  /**
   * The source of this event.
   */
  source?: string;
  id: CogniteInternalIdType; // int64
  lastUpdatedTime: EpochTimestamp; // int64
  createdTime: EpochTimestamp; // int64
}
export type EventChange = EventChangeById | EventChangeByExternalId;
/**
 * Changes will be applied to event.
 */
export interface EventChangeByExternalId {
  update: {
    externalId?: SinglePatchString;
    startTime?: SinglePatchLong;
    endTime?: SinglePatchLong;
    description?: SinglePatchString;
    metadata?: ObjectPatch;
    assetIds?: ArrayPatchLong;
    source?: SinglePatchString;
    type?: SinglePatchString;
    subtype?: SinglePatchString;
  };
  externalId: CogniteExternalIdType;
}
/**
 * Changes will be applied to event.
 */
export interface EventChangeById {
  update: {
    externalId?: SinglePatchString;
    startTime?: SinglePatchLong;
    endTime?: SinglePatchLong;
    description?: SinglePatchString;
    metadata?: ObjectPatch;
    assetIds?: ArrayPatchLong;
    source?: SinglePatchString;
    type?: SinglePatchString;
    subtype?: SinglePatchString;
  };
  id: CogniteInternalIdType; // int64
}
export type EventDataResponse = EventResponse;
export type EventDataWithCursorResponse = EventWithCursorResponse;
/**
 * Filter on events filter with exact match
 */
export interface EventFilter {
  startTime?: EpochTimestampRange;
  endTime?: EpochTimestampRange;
  metadata?: EventMetadata;
  /**
   * Asset IDs of related equipment that this event relates to.
   */
  assetIds?: CogniteInternalIdType /* int64 */[];
  /**
   * The source of this event.
   */
  source?: string;
  /**
   * The event type
   */
  type?: string;
  /**
   * The event subtype
   */
  subtype?: string;
  createdTime?: EpochTimestampRange;
  lastUpdatedTime?: EpochTimestampRange;
  externalIdPrefix?: CogniteExternalIdType;
}
/**
 * Cursor for paging through results
 */
export interface EventFilterRequest {
  filter?: EventFilter;
  /**
   * <- Limits the maximum number of results to be returned by single request. In case there are more results to the request 'nextCursor' attribute will be provided as part of response. Request may contain less results than request limit.
   */
  limit?: number; // int32
  cursor?: string;
}
/**
 * Custom, application specific metadata. String key -> String value
 */
export interface EventMetadata {
  [name: string]: string;
}
/**
 * Changes will be applied to event.
 */
export interface EventPatch {
  update: {
    externalId?: SinglePatchString;
    startTime?: SinglePatchLong;
    endTime?: SinglePatchLong;
    description?: SinglePatchString;
    metadata?: ObjectPatch;
    assetIds?: ArrayPatchLong;
    source?: SinglePatchString;
    type?: SinglePatchString;
    subtype?: SinglePatchString;
  };
}
export type EventResponse = Event;
export interface EventSearch {
  /**
   * text to search in description field across events
   */
  description?: string;
}
/**
 * Filter on events filter with exact match
 */
export interface EventSearchRequest {
  filter?: EventFilter;
  search?: EventSearch;
  /**
   * <- Limits the maximum number of results to be returned by single request. In case there are more results to the request 'nextCursor' attribute will be provided as part of response. Request may contain less results than request limit.
   */
  limit?: number; // int32
}
/**
 * A list of objects along with possible cursors to get the next, or previous, page of results
 */
export interface EventWithCursorResponse {
  items: Event[];
  /**
   * Cursor to get the next page of results (if available).
   */
  nextCursor?: string;
}
/**
 * Representation of a physical asset, e.g plant or piece of equipment
 */
export interface ExternalAsset {
  externalId?: CogniteExternalId;
  name: AssetName;
  parentId?: CogniteInternalId; // int64
  description?: AssetDescription;
  metadata?: AssetMetadata;
  source?: AssetSource;
}
/**
 * An event represents something that happened at a given interval in time, e.g a failure, a work order etc.
 */
export interface ExternalEvent {
  externalId?: CogniteExternalIdType;
  startTime?: EpochTimestamp; // int64
  endTime?: EpochTimestamp; // int64
  /**
   * Type of the event, e.g 'failure'.
   */
  type?: string;
  /**
   * Subtype of the event, e.g 'electrical'.
   */
  subtype?: string;
  /**
   * Textual description of the event.
   */
  description?: string;
  metadata?: EventMetadata;
  /**
   * Asset IDs of related equipment that this event relates to.
   */
  assetIds?: CogniteInternalIdType /* int64 */[];
  /**
   * The source of this event.
   */
  source?: string;
}
export interface ExternalFilesMetadata {
  externalId?: CogniteExternalId;
  name: FileName;
  source?: FileSource;
  mimeType?: MimeType;
  metadata?: FilesMetadataField;
  assetIds?: CogniteInternalId /* int64 */[];
}
export interface ExternalId {
  externalId: CogniteExternalIdType;
}
export interface ExternalIdsAlreadyExistResponse {
  /**
   * Error details
   */
  error: {
    /**
     * HTTP status code
     * example:
     * 409
     */
    code: number; // int32
    /**
     * Error message
     */
    message: string;
    /**
     * Items which are duplicated
     */
    duplicated: {
      externalId: CogniteExternalId;
    }[];
  };
}
/**
 * Changes will be applied to file.
 */
export interface FileChange {
  update: {
    externalId?: SinglePatchString;
    source?: SinglePatchString;
    metadata?: ObjectPatch;
    assetIds?: ArrayPatchLong;
  };
}
export type FileChangeUpdate =
  | FileChangeUpdateById
  | FileChangeUpdateByExternalId;
/**
 * Changes will be applied to file.
 */
export interface FileChangeUpdateByExternalId {
  externalId: CogniteExternalId;
  update: {
    externalId?: SinglePatchString;
    source?: SinglePatchString;
    metadata?: ObjectPatch;
    assetIds?: ArrayPatchLong;
  };
}
/**
 * Changes will be applied to file.
 */
export interface FileChangeUpdateById {
  id: CogniteInternalId; // int64
  update: {
    externalId?: SinglePatchString;
    source?: SinglePatchString;
    metadata?: ObjectPatch;
    assetIds?: ArrayPatchLong;
  };
}
export interface FileExternalId {
  externalId?: CogniteExternalId;
}
/**
 * Filter on files with exact match
 */
export interface FileFilter {
  filter?: {
    name?: FileName;
    mimeType?: MimeType;
    metadata?: FilesMetadataField;
    assetIds?: AssetIds;
    /**
     * The source of this event.
     */
    source?: string;
    createdTime?: EpochTimestampRange;
    lastUpdatedTime?: EpochTimestampRange;
    uploadedTime?: EpochTimestampRange;
    externalIdPrefix?: CogniteExternalId;
    /**
     * Whether or not the actual file is uploaded. This field is returned only by the API, it has no effect in a post body.
     * example:
     * true
     */
    uploaded?: boolean;
  };
  /**
   * <- Maximum number of items that the client want to get back.
   */
  limit?: number; // int32
}
export type FileIdEither = FileInternalId | FileExternalId;
export interface FileInternalId {
  id?: CogniteInternalId; // int64
}
export interface FileLink {
  downloadUrl?: string;
}
export interface FileLinkIds {
  items?: FileIdEither[];
}
export type FileMetadataResponse = FilesMetadata;
export type FileMetadataWithCursorResponse = DataWithCursor;
/**
 * Name of the file.
 */
export type FileName = string;
export type FileResponse = DataFileMetadata;
/**
 * The source of the file.
 */
export type FileSource = string;
export interface FilesMetadata {
  externalId?: CogniteExternalId;
  name: FileName;
  source?: FileSource;
  mimeType?: MimeType;
  metadata?: FilesMetadataField;
  assetIds?: CogniteInternalId /* int64 */[];
  id: CogniteInternalId; // int64
  /**
   * Whether or not the actual file is uploaded.  This field is returned only by the API, it has no effect in a post body.
   * example:
   * true
   */
  uploaded: boolean;
  uploadedTime?: EpochTimestamp; // int64
  createdTime: EpochTimestamp; // int64
  lastUpdatedTime: EpochTimestamp; // int64
}
/**
 * Custom, application specific metadata. String key -> String value
 */
export interface FilesMetadataField {
  [name: string]: string;
}
/**
 * Filter on files with exact match
 */
export interface FilesSearchFilter {
  filter?: {
    name?: FileName;
    mimeType?: MimeType;
    metadata?: FilesMetadataField;
    assetIds?: AssetIds;
    /**
     * The source of this event.
     */
    source?: string;
    createdTime?: EpochTimestampRange;
    lastUpdatedTime?: EpochTimestampRange;
    uploadedTime?: EpochTimestampRange;
    externalIdPrefix?: CogniteExternalId;
    /**
     * Whether or not the actual file is uploaded. This field is returned only by the API, it has no effect in a post body.
     * example:
     * true
     */
    uploaded?: boolean;
  };
  /**
   * <- Maximum number of items that the client want to get back.
   */
  limit?: number; // int32
  search?: {
    name?: FileName;
  };
}
export interface Filter {
  /**
   * Filter on unit (case-sensitive).
   */
  unit?: string;
  /**
   * Filter on isString.
   */
  isString?: boolean;
  /**
   * Filter on isStep.
   */
  isStep?: boolean;
  /**
   * Filter out timeseries that do not match these metadata fields and values (case-sensitive). Format is {"key1":"value1","key2":"value2"}.
   * example:
   * [object Object]
   */
  metadata?: TimeSeriesMetadata;
  /**
   * Filter out time series that are not linked to any of these assets.
   * example:
   * 363848954441724,793045462540095,1261042166839739
   */
  assetIds?: CogniteInternalId /* int64 */[];
  /**
   * Filter out time series with createdTime outside this range.
   */
  createdTime?: EpochTimestampRange;
  /**
   * Filter out time series with lastUpdatedTime outside this range.
   */
  lastUpdatedTime?: EpochTimestampRange;
}
/**
 * Scope:All
 */
export interface GenericAclAllScope {}
/**
 * Scope:CurrentUser
 */
export interface GenericAclCurrentUserScope {}
export interface GetAggregateDatapoint {
  /**
   * The data timestamp in milliseconds since the epoch (Jan 1, 1970).
   */
  timestamp: EpochTimestamp; // int64
  /**
   * The integral average value in the aggregate period
   */
  average?: number; // double
  /**
   * The maximum value in the aggregate period
   */
  max?: number; // double
  /**
   * The minimum value in the aggregate period
   */
  min?: number; // double
  /**
   * The number of datapoints in the aggregate period
   */
  count?: number; // int32
  /**
   * The sum of the datapoints in the aggregate period
   */
  sum?: number; // double
  /**
   * The interpolated value of the series in the beginning of the aggregate
   */
  interpolation?: number; // double
  /**
   * The last value before or at the beginning of the aggregate.
   */
  stepInterpolation?: number; // double
  /**
   * The variance of the interpolated underlying function.
   */
  continuousVariance?: number; // double
  /**
   * The variance of the datapoint values.
   */
  discreteVariance?: number; // double
  /**
   * The total variation of the interpolated underlying function.
   */
  totalVariation?: number; // double
}
export interface GetDatapointMetadata {
  /**
   * The data timestamp in milliseconds since the epoch (Jan 1, 1970).
   */
  timestamp: EpochTimestamp; // int64
}
export interface GetDoubleDatapoint {
  /**
   * The data timestamp in milliseconds since the epoch (Jan 1, 1970).
   */
  timestamp: EpochTimestamp; // int64
  /**
   * The data value.
   */
  value: number;
}
export interface GetStringDatapoint {
  /**
   * The data timestamp in milliseconds since the epoch (Jan 1, 1970).
   */
  timestamp: EpochTimestamp; // int64
  /**
   * The data value.
   */
  value: string;
}
export interface GetTimeSeriesMetadataDTO {
  /**
   * Generated id of the time series
   */
  id: CogniteInternalId; // int64
  /**
   * Externally supplied id of the time series
   */
  externalId?: string;
  /**
   * Name of time series
   */
  name?: string;
  /**
   * Whether the time series is string valued or not.
   */
  isString: boolean;
  metadata?: TimeSeriesMetadata;
  /**
   * The physical unit of the time series.
   */
  unit?: string;
  /**
   * Asset that this time series belongs to.
   */
  assetId?: CogniteInternalId; // int64
  /**
   * Whether the time series is a step series or not.
   */
  isStep: boolean;
  /**
   * Description of the time series.
   */
  description?: string;
  /**
   * Security categories required in order to access this time series.
   */
  securityCategories?: number /* int64 */[];
  /**
   * Time when this time-series is created in CDF in milliseconds since Jan 1, 1970.
   */
  createdTime: EpochTimestamp; // int64
  /**
   * The latest time when this time-series is updated in CDF in milliseconds since Jan 1, 1970.
   */
  lastUpdatedTime: EpochTimestamp; // int64
}
export interface Group {
  name: GroupName;
  sourceId?: GroupSourceId;
  capabilities?: CogniteCapability;
  id: number; // int64
  isDeleted: boolean;
  deletedTime?: Date; // int64
}
/**
 * Name of the group
 * example:
 * Production Engineers
 */
export type GroupName = string;
export type GroupResponse = DataGroup;
/**
 * ID of the group in the source. If this is the same ID as a group in the IDP, a user in that group will implicitly be a part of this group as well.
 * example:
 * b7c9a5a4-99c2-4785-bed3-5e6ad9a78603
 */
export type GroupSourceId = string;
/**
 * A specification for creating a new group
 */
export interface GroupSpec {
  name: GroupName;
  sourceId?: GroupSourceId;
  capabilities?: CogniteCapability;
}
/**
 * List of group ids
 * example:
 * 238712387,1283712837,1238712387
 */
export type Groups = number /* int64 */[];
export interface HeaderParameters {
  Origin?: Parameters.Origin;
}
/**
 * An ID JWT token
 */
export interface IdToken {
  /**
   * The subject of the token
   * example:
   * tim@apple.com
   */
  sub: string;
  /**
   * Which CDF project the subject is in
   * example:
   * apple
   */
  project_name: string;
  /**
   * Which groups (by id) the subject is in
   * example:
   * 123982398,123981283723,7283273927
   */
  groups: number /* int64 */[];
  /**
   * The signing key id
   * example:
   * a769f8ef-d5e3-4cf7-b914-2a6de189d942
   */
  signing_key: string;
  /**
   * The expiration time of the token in seconds (unix)
   * example:
   * 1554897484
   */
  exp: number; // int64
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
 * An event represents something that happened at a given interval in time, e.g a failure, a work order etc.
 */
export interface InternalEvent {
  externalId?: CogniteExternalIdType;
  startTime?: EpochTimestamp; // int64
  endTime?: EpochTimestamp; // int64
  /**
   * Type of the event, e.g 'failure'.
   */
  type?: string;
  /**
   * Subtype of the event, e.g 'electrical'.
   */
  subtype?: string;
  /**
   * Textual description of the event.
   */
  description?: string;
  metadata?: EventMetadata;
  /**
   * Asset IDs of related equipment that this event relates to.
   */
  assetIds?: CogniteInternalIdType /* int64 */[];
  /**
   * The source of this event.
   */
  source?: string;
}
export interface InternalId {
  id: CogniteInternalIdType; // int64
}
export type JsonArrayInt64 = string; // jsonArray(int64)
/**
 * Describes latest query
 */
export type LatestDataBeforeRequest =
  | {
      /**
       * Get first datapoint before this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send time in ms since epoch.
       */
      before?: Date | string;
      id: CogniteInternalId; // int64
    }
  | {
      /**
       * Get first datapoint before this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send time in ms since epoch.
       */
      before?: Date | string;
      externalId: CogniteExternalId;
    };
export interface LatestDataPropertyFilter {
  /**
   * Get first datapoint before this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send time in ms since epoch.
   */
  before?: Date | string;
}
export declare namespace Limit {
  export type Limit = number;
}
/**
 * Represents the current authentication status of the request
 */
export interface LoginStatusDTO {
  /**
   * The user principal, e.g john.doe@corporation.com.
   * example:
   * tim@apple.com
   */
  user: string;
  /**
   * Whether the user is logged in or not.
   * example:
   * true
   */
  loggedIn: boolean;
  /**
   * Name of project user belongs to
   * example:
   * tesla
   */
  project: string;
  /**
   * Internal project id of the project
   * example:
   * 137238723719
   */
  projectId: number; // int64
  /**
   * ID of the api key making the request. This is optional and only present if an api key is used as authentication.
   */
  apiKeyId?: number; // int64
}
/**
 * LoginStatusResponse
 */
export interface LoginStatusResponse {
  data: LoginStatusDTO;
}
/**
 * Represents an url where the user can be redirected to sign in.
 */
export interface LoginUrlDTO {
  /**
   * The url where the user can be redirected to sign in.
   */
  url?: string;
}
export interface LoginUrlResponse {
  data?: LoginUrlDTO;
}
/**
 * Custom, application specific metadata. String key -> String value
 */
export interface Metadata3D {
  [name: string]: string;
}
/**
 * File type. E.g. text/plain, application/pdf, ..
 * example:
 * image/jpeg
 */
export type MimeType = string;
/**
 * Some required fields are missing
 */
export interface MissingField {
  /**
   * HTTP status code
   * example:
   * 400
   */
  code: number; // int32
  /**
   * Error message
   */
  message: string;
  /**
   * Additional data
   */
  extra?: {};
  /**
   * Fields that are missing.
   */
  missingFields: {}[];
}
export interface MissingFieldError {
  error: {
    /**
     * HTTP status code
     * example:
     * 400
     */
    code: number; // int32
    /**
     * Error message
     */
    message: string;
    /**
     * Fields that are missing.
     */
    missingFields: {}[];
  };
}
export interface Model3D {
  /**
   * The name of the model.
   * example:
   * My Model
   */
  name: string;
  /**
   * The ID of the model.
   * example:
   * 1000
   */
  id: number; // int64
  createdTime: CreatedTime; // int64
  metadata?: Metadata3D;
}
export interface Model3DList {
  items: Model3D[];
}
export declare namespace ModelId {
  export type ModelId = number; // int64
}
export declare namespace Name {
  export type Name = FileName;
}
export interface NewApiKeyResponse {
  items: NewApiKeyResponseDTO[];
}
export interface NewApiKeyResponseDTO {
  /**
   * Internal id for the api key
   */
  id: number; // int64
  /**
   * id of the service account
   */
  serviceAccountId: number; // int64
  /**
   * Time of creating in unix ms
   */
  createdTime: Date; // int64
  /**
   * The status of the api key.
   */
  status: 'ACTIVE' | 'DELETED';
  /**
   * The api key to be used against the API
   * example:
   * MQ23y87QSDKIJSd87287sdJkjsd
   */
  value: string;
}
/**
 * Cursor to get the next page of results (if available).
 */
export type NextCursor = string;
export interface NextCursorData {
  nextCursor?: NextCursor;
}
export interface Node3D {
  /**
   * The ID of the node.
   * example:
   * 1000
   */
  id: number; // int64
  /**
   * The index of the node in the 3D model hierarchy, starting from 0. The tree is traversed in a depth-first order.
   * example:
   * 3
   */
  treeIndex: number; // int64
  /**
   * The parent of the node, null if it is the root node.
   * example:
   * 2
   */
  parentId: null | number; // int64
  /**
   * The depth of the node in the tree, starting from 0 at the root node.
   * example:
   * 2
   */
  depth: number; // int64
  /**
   * The name of the node.
   * example:
   * Node name
   */
  name: string;
  /**
   * The number of descendants of the node, plus one (counting itself).
   * example:
   * 4
   */
  subtreeSize: number; // int64
  boundingBox: BoundingBox3D;
}
export interface Node3DList {
  items: Node3D[];
}
export interface NotFoundResponse {
  /**
   * Error details
   */
  error: {
    /**
     * HTTP status code
     * example:
     * 400
     */
    code: number; // int32
    /**
     * Error message
     */
    message: string;
    /**
     * Items which are not found
     */
    missing: (
      | {
          id: CogniteInternalId; // int64
        }
      | {
          externalId: CogniteExternalId;
        })[];
  };
}
/**
 * Change that will be applied to assetId.
 */
export type NullableSinglePatchLong =
  | {
      set: number; // int64
    }
  | {
      setNull: 'true';
    };
/**
 * Change that will be applied to description.
 */
export type NullableSinglePatchString =
  | {
      set: string;
    }
  | {
      setNull: 'true';
    };
/**
 * Data related to generic OAuth2 authentication. Not used for Azure AD
 */
export interface OAuth2ConfigurationDTO {
  /**
   * Login URL of OAuth2 provider. E.g https://accounts.google.com/o/oauth2/v2/auth.
   */
  loginUrl?: string;
  /**
   * Logout URL of OAuth2 provider. E.g https://accounts.google.com/Logout.
   */
  logoutUrl?: string;
  /**
   * URL to get access token from OAuth2 provider. E.g https://www.googleapis.com/oauth2/v4/token.
   */
  tokenUrl?: string;
  /**
   * Client ID. You probably get this when registering your client with the OAuth2 provider.
   */
  clientId?: string;
  /**
   * Client secret. You probably get this when registering your client with the OAuth2 provider.
   */
  clientSecret?: string;
}
/**
 * Object change
 */
export type ObjectPatch = ObjectPatchSet | ObjectPatchAddRemove;
export interface ObjectPatchAddRemove {
  /**
   * Add the key-value pairs. Values for existing keys will be overwritten.
   * example:
   * [object Object]
   */
  add?: {
    [name: string]: string;
  };
  /**
   * Remove the key-value pairs with given keys.
   * example:
   * value1,value2
   */
  remove?: string[];
}
export interface ObjectPatchSet {
  /**
   * Set the key-value pairs. All existing key-value pairs will be removed.
   * example:
   * [object Object]
   */
  set: {
    [name: string]: string;
  };
}
export declare namespace Offset {
  export type Offset = number;
}
/**
 * Data about how to authenticate and authorize users. The authentication configuration is hidden.
 */
export interface OutputProjectAuthentication {
  validDomains?: ValidDomains;
}
export declare namespace Parameters {
  export type All = boolean;
  export type AssetId = number; // int64
  export type AssetIds = JsonArrayInt64; // jsonArray(int64)
  export type Columns = string;
  export type Cursor = string;
  export type DbName = string;
  export type Depth = number; // int32
  export type EnsureParent = boolean;
  export type ErrorRedirectUrl = string;
  export type ExternalIdPrefix = CogniteExternalId;
  export type GroupId = number; // int64
  export type Id = CogniteInternalId; // int64
  export type IncludeDeleted = boolean;
  export type IncludeMetadata = boolean;
  export type Limit = number; // int32
  export type MaxCreatedTime = EpochTimestamp; // int64
  export type MaxEndTime = EpochTimestamp; // int64
  export type MaxLastUpdatedTime = EpochTimestamp; // int64
  export type MaxStartTime = EpochTimestamp; // int64
  export type MaxUploadedTime = EpochTimestamp; // int64
  export type MinCreatedTime = EpochTimestamp; // int64
  export type MinEndTime = EpochTimestamp; // int64
  export type MinLastUpdatedTime = EpochTimestamp; // int64
  export type MinStartTime = EpochTimestamp; // int64
  export type MinUploadedTime = EpochTimestamp; // int64
  export type Name = AssetName;
  export type NodeId = number; // int64
  export type Origin = string;
  export type Overwrite = boolean;
  export type ParentIds = JsonArrayInt64; // jsonArray(int64)
  export type Project = string;
  export type Published = boolean;
  export type RedirectUrl = string;
  /**
   * filtered assets are root assets or not
   */
  export type Root = boolean;
  export type RowKey = string;
  export type ServiceAccountId = number; // int64
  export type Sort = 'ASC' | 'DESC';
  export type Source = FileSource;
  /**
   * The event subtype
   */
  export type Subtype = string;
  export type TableName = string;
  export type ThreedFileId = number; // int64
  export type Token = string;
  /**
   * The event type
   */
  export type Type = string;
  export type Uploaded = boolean;
}
export interface PathParameters {
  project: Parameters.Project;
}
export type PostDatapoint =
  | {
      /**
       * The data timestamp in milliseconds since the epoch (Jan 1, 1970).
       */
      timestamp: EpochTimestamp; // int64
      /**
       * The numerical data value of a numerical metric
       */
      value: number;
    }
  | {
      /**
       * The data timestamp in milliseconds since the epoch (Jan 1, 1970).
       */
      timestamp: EpochTimestamp; // int64
      /**
       * The string data value of a string metric
       */
      value: string;
    };
export interface PostTimeSeriesMetadataDTO {
  /**
   * Externally provided id for the time series (optional but recommended)
   */
  externalId?: string;
  /**
   * Human readable name of time series
   */
  name?: string;
  /**
   * Whether the time series is string valued or not.
   */
  isString?: boolean;
  metadata?: TimeSeriesMetadata;
  /**
   * The physical unit of the time series.
   */
  unit?: string;
  /**
   * Asset that this time series belongs to.
   */
  assetId?: CogniteInternalId; // int64
  /**
   * Whether the time series is a step series or not.
   */
  isStep?: boolean;
  /**
   * Description of the time series.
   */
  description?: string;
  /**
   * Security categories required in order to access this time series.
   */
  securityCategories?: number /* int64 */[];
}
export declare namespace Project {
  /**
   * example:
   * publicdata
   */
  export type Project = string;
}
/**
 * The display name of the project.
 * example:
 * Open Industrial Data
 */
export type ProjectName = string;
export declare namespace ProjectName {
  export type Project = string;
}
export interface ProjectResponse {
  name: ProjectName;
  urlName: UrlName;
  defaultGroupId?: DefaultGroupId; // int64
  authentication?: OutputProjectAuthentication;
}
export interface QueryParameters {
  sort?: Parameters.Sort;
  cursor?: Parameters.Cursor;
  limit?: Parameters.Limit; // int32
}
/**
 * A NoSQL database to store customer data.
 */
export interface RawDB {
  /**
   * Unique name of a database.
   */
  name: string;
}
export interface RawDBRow {
  /**
   * Unique row key
   */
  key: string;
  /**
   * Row data stored as a JSON object.
   */
  columns: any;
  lastUpdatedTime: EpochTimestamp; // int64
}
export interface RawDBRowInsert {
  /**
   * Unique row key
   */
  key: string;
  /**
   * Row data stored as a JSON object.
   */
  columns: any;
}
/**
 * A row key
 */
export interface RawDBRowKey {
  /**
   * Unique row key
   */
  key: string;
}
/**
 * A NoSQL database table to store customer data
 */
export interface RawDBTable {
  /**
   * Unique name of the table
   */
  name: string;
}
/**
 * Raw row result written in CSV format, with column columnHeaders.
 */
export interface RawRowCSV {
  /**
   * Headers for the different columns in the response.
   */
  columnHeaders?: string[];
  /**
   * Rows of column values, in same order as columnHeaders.
   */
  rows?: {}[][];
}
export interface RemoveField {
  /**
   * example:
   * true
   */
  setNull: boolean;
}
export type RequestBody = DataLong;
export declare namespace Responses {
  export type $200 = EmptyResponse;
  export type $201 = SecurityCategoryResponse;
  export type $400 = ErrorResponse;
  export type $409 = ExternalIdsAlreadyExistResponse;
  export type $422 = DuplicatedIdsInRequestResponse;
}
export interface RevealNode3D {
  /**
   * The ID of the node.
   * example:
   * 1000
   */
  id: number; // int64
  /**
   * The index of the node in the 3D model hierarchy, starting from 0. The tree is traversed in a depth-first order.
   * example:
   * 3
   */
  treeIndex: number; // int64
  /**
   * The parent of the node, null if it is the root node.
   * example:
   * 2
   */
  parentId: null | number; // int64
  /**
   * The depth of the node in the tree, starting from 0 at the root node.
   * example:
   * 2
   */
  depth: number; // int64
  /**
   * The name of the node.
   * example:
   * Node name
   */
  name: string;
  /**
   * The number of descendants of the node, plus one (counting itself).
   * example:
   * 4
   */
  subtreeSize: number; // int64
  boundingBox: BoundingBox3D;
  /**
   * The sector the node is contained in.
   * example:
   * 1000
   */
  sectorId?: number; // int64
}
export interface RevealNode3DList {
  items: RevealNode3D[];
}
export interface RevealRevision3D {
  /**
   * The ID of the revision.
   * example:
   * 1000
   */
  id: number; // int64
  /**
   * The file id.
   * example:
   * 1000
   */
  fileId: number; // int64
  /**
   * True if the revision is marked as published.
   */
  published: boolean;
  rotation?: number /* double */[];
  camera?: RevisionCameraProperties;
  /**
   * The status of the revision.
   * example:
   * Done
   */
  status: 'Queued' | 'Processing' | 'Done' | 'Failed';
  metadata?: Metadata3D;
  /**
   * The threed file ID of a thumbnail for the revision. Use /3d/files/{id} to retrieve the file.
   * example:
   * 1000
   */
  thumbnailThreedFileId?: number; // int64
  /**
   * The URL of a thumbnail for the revision.
   * example:
   * https://api.cognitedata.com/api/v1/project/myproject/3d/files/1000
   */
  thumbnailURL?: string;
  /**
   * The number of asset mappings for this revision.
   * example:
   * 0
   */
  assetMappingCount: number; // int64
  createdTime: CreatedTime; // int64
  sceneThreedFiles: Versioned3DFile[];
}
export interface RevealSector3D {
  /**
   * The id of the sector.
   * example:
   * 1000
   */
  id: number; // int64
  /**
   * The parent of the sector, null if it is the root sector.
   * example:
   * 900
   */
  parentId: null | number; // int64
  /**
   * String representing the path to the sector: 0/2/6/ etc.
   * example:
   * 0/100/500/900/1000
   */
  path: string;
  /**
   * The depth of the sector in the sector tree, starting from 0 at the root sector.
   * example:
   * 4
   */
  depth: number; // int64
  boundingBox: BoundingBox3D;
  /**
   * The file ID of the data file for this sector, with multiple versions supported. Use /3d/files/{id} to retrieve the file.
   */
  threedFiles: Versioned3DFile[];
}
export interface RevealSector3DList {
  items: RevealSector3D[];
}
export interface Revision3D {
  /**
   * The ID of the revision.
   * example:
   * 1000
   */
  id: number; // int64
  /**
   * The file id.
   * example:
   * 1000
   */
  fileId: number; // int64
  /**
   * True if the revision is marked as published.
   */
  published: boolean;
  rotation?: number /* double */[];
  camera?: RevisionCameraProperties;
  /**
   * The status of the revision.
   * example:
   * Done
   */
  status: 'Queued' | 'Processing' | 'Done' | 'Failed';
  metadata?: Metadata3D;
  /**
   * The threed file ID of a thumbnail for the revision. Use /3d/files/{id} to retrieve the file.
   * example:
   * 1000
   */
  thumbnailThreedFileId?: number; // int64
  /**
   * The URL of a thumbnail for the revision.
   * example:
   * https://api.cognitedata.com/api/v1/project/myproject/3d/files/1000
   */
  thumbnailURL?: string;
  /**
   * The number of asset mappings for this revision.
   * example:
   * 0
   */
  assetMappingCount: number; // int64
  createdTime: CreatedTime; // int64
}
export interface Revision3DList {
  items: Revision3D[];
}
/**
 * Initial camera position and target.
 */
export interface RevisionCameraProperties {
  /**
   * Initial camera target.
   */
  target?: number /* double */[];
  /**
   * Initial camera position.
   */
  position?: number /* double */[];
}
export declare namespace RevisionId {
  export type RevisionId = number; // int64
}
export interface Search {
  /**
   * Prefix and fuzzy search on name.
   */
  name?: string;
  /**
   * Prefix and fuzzy search on description.
   */
  description?: string;
  /**
   * Search on name and description using wildcard search on each of the words (separated by spaces). Retrieves results where at least one word must match. Example: '*some* *other*'
   */
  query?: string;
}
export interface SecurityCategoryDTO {
  /**
   * Name of the security category
   * example:
   * Guarded by vendor x
   */
  name: string;
  /**
   * Id of the security category
   */
  id: number; // int64
}
export interface SecurityCategoryResponse {
  items?: SecurityCategoryDTO[];
}
export interface SecurityCategorySpecDTO {
  /**
   * Name of the security category
   * example:
   * Guarded by vendor x
   */
  name: string;
}
/**
 * A list of objects along with possible cursors to get the next page of results
 */
export interface SecurityCategoryWithCursorResponse {
  items: SecurityCategoryDTO[];
  /**
   * Cursor to get the next page of results (if available).
   */
  nextCursor?: string;
}
export interface ServiceAccount {
  name: ServiceAccountName;
  groups: Groups;
  id: number; // int64
  /**
   * If this service account has been logically deleted
   * example:
   * false
   */
  isDeleted: boolean;
  /**
   * Time of deletion
   */
  deletedTime?: Date; // int64
}
export interface ServiceAccountInput {
  name: ServiceAccountName;
  groups?: Groups;
}
/**
 * name
 * Unique name of the service account
 * example:
 * some-internal-service@apple.com
 */
export type ServiceAccountName = string;
export interface ServiceAccountResponse {
  /**
   * List of service accounts
   */
  items: ServiceAccount[];
}
export interface SetLongField {
  set: number; // int64
}
export interface SetModelNameField {
  set?: string;
}
export interface SetRevisionCameraProperties {
  set?: RevisionCameraProperties;
}
export interface SetRevisionRotation {
  set?: number /* double */[];
}
export interface SetStringField {
  set: string;
}
export type SinglePatchLong = SetLongField | RemoveField;
/**
 * Non removable string change.
 */
export interface SinglePatchRequiredString {
  set: string;
}
/**
 * Removable string change.
 */
export type SinglePatchString = SetStringField | RemoveField;
export interface SingleTokenStatusDTOResponse {
  data: TokenStatusDTO;
}
export type StringOrNumber = string | number;
export interface TimeSeriesCreateRequest {
  items: PostTimeSeriesMetadataDTO[];
}
export type TimeSeriesCursorResponse = DataWithCursorGetTimeSeriesMetadataDTO;
export interface TimeSeriesLookupById {
  /**
   * List of ID objects
   */
  items: (
    | {
        id?: CogniteInternalId; // int64
      }
    | {
        externalId?: CogniteExternalId;
      })[];
}
/**
 * Additional metadata. String key -> String value
 */
export interface TimeSeriesMetadata {
  [name: string]: string;
}
/**
 * Changes will be applied to timeseries.
 */
export interface TimeSeriesPatch {
  update: {
    externalId?: NullableSinglePatchString;
    name?: NullableSinglePatchString;
    metadata?: ObjectPatch;
    unit?: NullableSinglePatchString;
    assetId?: NullableSinglePatchLong;
    description?: NullableSinglePatchString;
    securityCategories?: ArrayPatchLong;
  };
}
export type TimeSeriesResponse = DataGetTimeSeriesMetadataDTO;
export interface TimeSeriesSearchDTO {
  /**
   * Filtering parameters
   */
  filter?: Filter;
  /**
   * Search parameters
   */
  search?: Search;
  /**
   * Return up to this many results.
   */
  limit?: number; // int32
}
export type TimeSeriesUpdate =
  | TimeSeriesUpdateById
  | TimeSeriesUpdateByExternalId;
/**
 * Changes will be applied to timeseries.
 */
export interface TimeSeriesUpdateByExternalId {
  update: {
    externalId?: NullableSinglePatchString;
    name?: NullableSinglePatchString;
    metadata?: ObjectPatch;
    unit?: NullableSinglePatchString;
    assetId?: NullableSinglePatchLong;
    description?: NullableSinglePatchString;
    securityCategories?: ArrayPatchLong;
  };
  externalId: CogniteExternalId;
}
/**
 * Changes will be applied to timeseries.
 */
export interface TimeSeriesUpdateById {
  update: {
    externalId?: NullableSinglePatchString;
    name?: NullableSinglePatchString;
    metadata?: ObjectPatch;
    unit?: NullableSinglePatchString;
    assetId?: NullableSinglePatchLong;
    description?: NullableSinglePatchString;
    securityCategories?: ArrayPatchLong;
  };
  id: CogniteInternalId; // int64
}
export interface TimeSeriesUpdateRequest {
  items: TimeSeriesUpdate[];
}
/**
 * Get datapoints up to this time. Same format as for start. Note that when using aggregates, the end will be rounded up such that the last aggregate represents a full aggregation interval containing the original end, where the interval is the granularity unit times the granularity multiplier. For granularity 2d, the aggregation interval is 2 days, if end was originally 3 days after the start, it will be rounded to 4 days after the start.
 */
export type TimestampOrStringEnd = Date | string;
/**
 * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send time in ms since epoch. Note that when using aggregates, the start time will be rounded down to a whole granularity unit (in UTC timezone). For granularity 2d it will be rounded to 0:00 AM on the same day, for 3h it will be rounded to the start of the hour, etc.
 */
export type TimestampOrStringStart = Date | string;
export interface TokenStatusDTO {
  /**
   * The token that was sent for validation
   * example:
   * ewogICJhbGciOiAiUlMyNTYiLAogICJ0eXAiOiAiSldUIgp9.ewogICJhY2NvdW50X3R5cGUiOiAidXNlcl9hY2NvdW50IiwKICAicHJvamVjdF9pZCI6IDI5MzgyOTU3MjA2NzUzNTMsCiAgInVuaXF1ZV9uYW1lIjogIm1hcnRpbi5yb2VkQGNvZ25pdGUuY29tIiwKICAic2Vzc2lvblRpY2tldCI6ICJDQUlTSkdKa04yUmxZMkUyTFRkbFltSXROR1E1TlMxaU16QmtMVFF4T1dRMFlUSTVaRGRqTkJvRFFWQkpJa01hRjIxaGNuUnBiaTV5YjJWa1FHTnZaMjVwZEdVdVkyOXRJSm1RdE1YVWk1d0ZLaC9vbjQ3QzE5Uld0TXZQMkpYTGd3YTVrNm0wbHMvS0NMVHB5SWFDcEpBTEtnTkJVRWtxREVGVlZFZ3RVMFZTVmtsRFJUSU1DTnlkdCtVRkVNQ2c0ck1CT2d3STZMSzM1UVVRd0tEaXN3RkNEQWpjbmJmbEJSREFvT0t6QVVvTUlnb0lBUklDQUFFYUFnb0FTZzhxRFFnQkVnVUFBUUlEQkJvQ0dnQktDeW9KQ0FFU0FRQWFBaW9BU2d3eUNnZ0JFZ0lBQVJvQ0NnQktERG9LQ0FFU0FnQUJHZ0lLQUVvTVFnb0lBUklDQUFFYUFnb0FTZzlLRFFnQkVnVUFBUUlFQXhvQ0dnQktERklLQ0FFU0FnRURHZ0lhQUVvT1dnd0lBUklFQVFRQ0FCb0NDZ0JLRFdJTENBRVNBd0lCQUJvQ0NnQktER29LQ0FFU0FnQUJHZ0lLQUVvTGNna0lBUklCQUJvQ0tnQktEM0lOQ0FFU0JRQUJBZ01FR2dJYUFFb09lZ3dJQVJJRUFBRUNBeG9DR2dCS0RZSUJDZ2dCRWdJQUFSb0NDZ0JLRFlvQkNnZ0JFZ0lBQVJvQ0NnQktEcElCQ3dnQkVnTUFBZ0VhQWdvQVNncWFBUWNTQVFBYUFob0EiLAogICJzaWduaW5nX2tleSI6ICIyZTAyMGM3NS1kODcwLTQxNWItYTY2Ny02OGZiODk0MTgwZjEiLAogICJleHBpcmVfdGltZSI6IDE1NTQ4OTcyNTYKfQ==.WNTT7qvdj4KUbIwo8x4Upq3Ki/X9rd0lqMbcIlLCDwjqrH2OH4jc/CgE/Uk9z9HeCCSWDDwJYGXOiIc+bZGQdzuYDPd5LYN8SaT1bDfa5mkAaPpk7f0KSBqp5FceNWSqjh1/mevX0OhNMbB6z5KXU9t7EDgNFWgMT2zUpfll0nNYhAgJBU1MeGtxVZcRLIP2iAEmFR4XlLlxc+bi0SxGGUZHPn2AQq5jitbJAdjnwf5KCr+2HH1Dww75q7qiGZ7NsO7ipTGdO/KaaTvlLp90k5jT4a7fPqCuMWS25NgJK4dQIEqtCvHaqnMV1Q+G6WtdEy+Qcx581H8J3A2LV1pQYA==
   */
  token: string;
  /**
   * Whether this token is valid
   */
  valid: boolean;
  /**
   * Whether this token has expired
   */
  expired: boolean;
}
export interface UnrealRevision3D {
  /**
   * The ID of the revision.
   * example:
   * 1000
   */
  id: number; // int64
  /**
   * The file id.
   * example:
   * 1000
   */
  fileId: number; // int64
  /**
   * True if the revision is marked as published.
   */
  published: boolean;
  rotation?: number /* double */[];
  camera?: RevisionCameraProperties;
  /**
   * The status of the revision.
   * example:
   * Done
   */
  status: 'Queued' | 'Processing' | 'Done' | 'Failed';
  metadata?: Metadata3D;
  /**
   * The threed file ID of a thumbnail for the revision. Use /3d/files/{id} to retrieve the file.
   * example:
   * 1000
   */
  thumbnailThreedFileId?: number; // int64
  /**
   * The URL of a thumbnail for the revision.
   * example:
   * https://api.cognitedata.com/api/v1/project/myproject/3d/files/1000
   */
  thumbnailURL?: string;
  /**
   * The number of asset mappings for this revision.
   * example:
   * 0
   */
  assetMappingCount: number; // int64
  createdTime: CreatedTime; // int64
  sceneThreedFiles: Versioned3DFile[];
}
export interface UpdateModel3D {
  id: CogniteInternalId; // int64
  update?: {
    name?: SetModelNameField;
    metadata?: ObjectPatch;
  };
}
export interface UpdateRevision3D {
  id: CogniteInternalId; // int64
  update?: {
    published?: {
      /**
       * True if the revision is marked as published.
       */
      set?: boolean;
    };
    rotation?: SetRevisionRotation;
    camera?: SetRevisionCameraProperties;
    metadata?: ObjectPatch;
  };
}
/**
 * Request body for the updateModelRevisionThumbnail endpoint.
 */
export interface UpdateRevision3DThumbnail {
  /**
   * File ID of thumbnail file in Files API. _Only JPEG and PNG files are supported_.
   */
  fileId: number; // int64
}
export interface UploadFileMetadataResponse {
  externalId?: CogniteExternalId;
  name: FileName;
  source?: FileSource;
  mimeType?: MimeType;
  metadata?: FilesMetadataField;
  assetIds?: CogniteInternalId /* int64 */[];
  id: CogniteInternalId; // int64
  /**
   * Whether or not the actual file is uploaded.  This field is returned only by the API, it has no effect in a post body.
   * example:
   * true
   */
  uploaded: boolean;
  uploadedTime?: EpochTimestamp; // int64
  createdTime: EpochTimestamp; // int64
  lastUpdatedTime: EpochTimestamp; // int64
  /**
   * The URL where the file contents should be uploaded.
   */
  uploadUrl: string;
}
/**
 * The url name of the project. This is used as part of API calls. It should only contain letters, digits and hyphens, as long as the hyphens are not at the start or end.
 * example:
 * publicdata
 */
export type UrlName = string;
/**
 * List of valid domains. If left empty, any user registered with the OAuth2 provider will get access.
 * example:
 * apple.com,google.com
 */
export type ValidDomains = string[];
/**
 * The file ID of the data file for this resource, with multiple versions supported. Use /3d/files/{id} to retrieve the file.
 */
export interface Versioned3DFile {
  /**
   * Version of the file format.
   * example:
   * 1
   */
  version: number; // int64
  /**
   * File ID. Use /3d/files/{id} to retrieve the file.
   * example:
   * 1000
   */
  fileId: number; // int64
}

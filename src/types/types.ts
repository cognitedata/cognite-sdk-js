// Copyright 2019 Cognite AS

export interface Acl<ActionsType, ScopeType> {
  actions: ActionsType[];
  scope: ScopeType;
}

export type Acl3D = Acl<AclAction3D, AclScope3D>;

export type AclAction3D = READ | CREATE | UPDATE | DELETE;

export type AclActionAnalytics = READ | EXECUTE | LIST;

export type AclActionApiKeys = LIST | CREATE | DELETE;

export type AclActionAssets = READ | WRITE;

export type AclActionEvents = READ | WRITE;

export type AclActionFiles = READ | WRITE;

export type AclActionGroups = LIST | READ | CREATE | UPDATE | DELETE;

export type AclActionProjects = LIST | READ | CREATE | UPDATE;

export type AclActionRaw = READ | WRITE | LIST;

export type AclActionSecurityCategories = MEMBEROF | LIST | CREATE | DELETE;

export type AclActionSequences = READ | WRITE;

export type AclActionTimeseries = READ | WRITE;

export type AclActionUsers = LIST | CREATE | DELETE;

export type AclAnalytics = Acl<AclActionAnalytics, AclScopeAnalytics>;

export type AclApiKeys = Acl<AclActionApiKeys, AclScopeApiKeys>;

export type AclAssets = Acl<AclActionAssets, AclScopeAssets>;

export type AclEvents = Acl<AclActionEvents, AclScopeEvents>;

export type AclFiles = Acl<AclActionFiles, AclScopeFiles>;

export type AclGroups = Acl<AclActionGroups, AclScopeGroups>;

export type AclProjects = Acl<AclActionProjects, AclScopeProjects>;

export type AclRaw = Acl<AclActionRaw, AclScopeRaw>;

export type AclScope3D = AclScopeAll;

export interface AclScopeAll {
  all: {};
}

export type AclScopeAnalytics = AclScopeAll;

export type AclScopeApiKeys = AclScopeAll | AclScopeCurrentUser;

export type AclScopeAssets = AclScopeAll;

export interface AclScopeAssetsId {
  assetIdScope: {
    subtreeIds: CogniteInternalId[];
  };
}

export interface AclScopeTimeSeriesIds {
  idscope: {
    ids: CogniteInternalId[];
  };
}

export interface AclScopeCurrentUser {
  currentuserscope: {};
}

export type AclScopeEvents = AclScopeAll;

export type AclScopeFiles = AclScopeAll;

export type AclScopeGroups = AclScopeAll | AclScopeCurrentUser;

export type AclScopeProjects = AclScopeAll;

export type AclScopeRaw = AclScopeAll;

export type AclScopeSecurityCategories = AclScopeAll;

export type AclScopeSequences = AclScopeAll;

export type AclScopeTimeseries =
  | AclScopeAll
  | AclScopeAssetsId
  | AclScopeTimeSeriesIds;

export type AclScopeUsers = AclScopeAll;

export type AclSecurityCategories = Acl<
  AclActionSecurityCategories,
  AclScopeSecurityCategories
>;

export type AclSequences = Acl<AclActionSequences, AclScopeSequences>;

export type AclTimeseries = Acl<AclActionTimeseries, AclScopeTimeseries>;

export type AclUsers = Acl<AclActionUsers, AclScopeUsers>;

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

export interface ApiKeyObject {
  /**
   * Internal id for the api key
   */
  id: CogniteInternalId;
  /**
   * Id of the service account
   */
  serviceAccountId: CogniteInternalId;
  createdTime: Date;
  /**
   * The status of the api key
   */
  status: 'ACTIVE' | 'DELETED';
}

export interface ApiKeyRequest {
  serviceAccountId: CogniteInternalId;
}

export type ArrayPatchLong =
  | { set: number[] }
  | { add?: number[]; remove?: number[] };

export interface AssetAggregateResult {
  /**
   * Number of direct descendants for the asset
   */
  childCount?: number;
  /**
   * Asset path depth (number of levels below root node).
   */
  depth?: number;
  /**
   * IDs of assets on the path to the asset.
   */
  path?: AssetIdEither[];
}

export interface Asset
  extends ExternalAsset,
    AssetInternalId,
    CreatedAndLastUpdatedTime {
  /**
   * The id of the root for the tree this asset belongs to
   */
  rootId: CogniteInternalId;
  /**
   * Aggregated metrics of the asset
   */
  aggregates?: AssetAggregateResult;
  /**
   * The parent's externalId if defined
   */
  parentExternalId?: CogniteExternalId;
}

/**
 * Describes a new column
 */
export interface ExternalSequenceColumn
  extends ExternalSequenceColumnBase,
    ExternalId {}

interface ExternalSequenceColumnBase {
  name?: SequenceColumnName;
  description?: SequenceColumnDescription;
  valueType?: SequenceValueType;
  metadata?: Metadata;
}

/**
 * Information about a column stored in the database
 */
export interface SequenceColumn
  extends ExternalSequenceColumnBase,
    InternalId,
    CreatedAndLastUpdatedTime {
  valueType: SequenceValueType;
  externalId?: CogniteExternalId;
}

/**
 * Information about a column stored in the database
 */
export interface SequenceColumnBasicInfo {
  name?: SequenceColumnName;
  externalId?: ExternalId;
  valueType?: SequenceValueType;
}

/**
 * What type the datapoints in a column will have.
 * DOUBLE is restricted to the range [-1E100, 1E100]
 * @default STRING
 */
export type SequenceValueType = 'STRING' | 'DOUBLE' | 'LONG';

export const SequenceValueType = {
  STRING: 'STRING' as SequenceValueType,
  DOUBLE: 'DOUBLE' as SequenceValueType,
  LONG: 'LONG' as SequenceValueType,
};

/**
 * Name of the sequence
 */
export type SequenceName = string;

/**
 *  Human readable name of the column
 */
export type SequenceColumnName = string;

/**
 * Description of the sequence
 */
export type SequenceDescription = string;

/**
 * Description of the column
 */
export type SequenceColumnDescription = string;

interface SequenceBase {
  name?: SequenceName;
  description?: SequenceDescription;
  /**
   * Asset this sequence is associated with
   */
  assetId?: CogniteInternalId;
  externalId?: CogniteExternalId;
  metadata?: Metadata;
}

export interface ExternalSequence extends SequenceBase {
  /**
   * List of column definitions
   */
  columns: ExternalSequenceColumn[];
}

/**
 * Information about the sequence stored in the database
 */
export interface Sequence
  extends SequenceBase,
    InternalId,
    CreatedAndLastUpdatedTime {
  columns: SequenceColumn[];
}

export type AssetChange = AssetChangeById | AssetChangeByExternalId;

export interface AssetChangeByExternalId extends AssetPatch, ExternalId {}

export interface AssetChangeById extends AssetPatch, InternalId {}

/**
 * Description of asset.
 */
export type AssetDescription = string;

export type AssetExternalId = ExternalId;

/**
 * Filter on assets with exact match
 */
export interface AssetFilter extends Limit {
  filter?: {
    name?: AssetName;
    /**
     * Return only the direct descendants of the specified assets.
     */
    parentIds?: CogniteInternalId[];
    /**
     * Return only the direct descendants of the specified assets.
     */
    parentExternalIds?: CogniteExternalId[];
    rootIds?: IdEither[];
    /**
     * Only include assets in subtrees rooted at the specified assets.
     * If the total size of the given subtrees exceeds 100,000 assets, an error will be returned.
     */
    assetSubtreeIds?: IdEither[];
    metadata?: Metadata;
    source?: AssetSource;
    createdTime?: DateRange;
    lastUpdatedTime?: DateRange;
    /**
     * Filtered assets are root assets or not
     */
    root?: boolean;
    externalIdPrefix?: ExternalIdPrefix;
  };
}

export type AssetIdEither = IdEither;

export type AssetInternalId = InternalId;

export type AssetAggregatedProperty = 'childCount' | 'path' | 'depth';

export interface AssetListScope extends AssetFilter, FilterQuery {
  /**
   * Set of aggregated properties to include
   */
  aggregatedProperties?: AssetAggregatedProperty[];
  partition?: Partition;
}

export interface SequenceFilter {
  filter?: {
    name?: SequenceName;
    externalIdPrefix?: ExternalIdPrefix;
    metadata?: Metadata;
    assetIds?: CogniteInternalId[];
    /**
     * Only include sequences that have a related asset in a tree rooted at any of these root assetIds.
     */
    rootAssetIds?: CogniteInternalId[];
    /**
     * Only include sequences that have a related asset in a subtree rooted at any of these assetIds.
     * If the total size of the given subtrees exceeds 100,000 assets, an error will be returned.
     */
    assetSubtreeIds?: IdEither[];
    createdTime?: DateRange;
    lastUpdatedTime?: DateRange;
  };
}

export interface AssetMapping3D extends AssetMapping3DBase {
  /**
   * A number describing the position of this node in the 3D hierarchy, starting from 0.
   * The tree is traversed in a depth-first order.
   */
  treeIndex: number;
  /**
   * The number of nodes in the subtree of this node (this number included the node itself).
   */
  subtreeSize: number;
}

export interface AssetMapping3DBase {
  /**
   * The ID of the node.
   */
  nodeId: CogniteInternalId;
  /**
   * The ID of the associated asset (Cognite's Assets API).
   */
  assetId: CogniteInternalId;
}

export interface AssetMappings3DListFilter extends FilterQuery {
  nodeId?: CogniteInternalId;
  assetId?: CogniteInternalId;
  /**
   * If given, only return asset mappings for assets whose bounding box intersects the given bounding box.
   */
  intersectsBoundingBox?: BoundingBox3D;
}

/**
 * Name of asset. Often referred to as tag.
 */
export type AssetName = string;

export interface AssetPatch {
  update: {
    externalId?: SinglePatchString;
    name?: SinglePatchRequiredString;
    description?: SinglePatchString;
    metadata?: ObjectPatch;
    source?: SinglePatchString;
  };
}

export interface AssetSearchFilter extends AssetFilter {
  search?: {
    name?: AssetName;
    query?: AssetName | AssetDescription;
    description?: AssetDescription;
  };
}

export interface SequenceSearchFilter extends SequenceFilter {
  search?: {
    name?: SequenceName;
    description?: SequenceDescription;
    /**
     * Search on name and description using wildcard search on each of the words (separated by spaces).
     * Retrieves results where at least one word must match. Example: '*some* *other*'
     */
    query?: string;
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
 * The bounding box of the subtree with this sector as the root sector.
 * Is null if there are no geometries in the subtree.
 */
export interface BoundingBox3D {
  /**
   * The minimal coordinates of the bounding box.
   */
  min: Tuple3<number>;
  /**
   * The maximal coordinates of the bounding box.
   */
  max: Tuple3<number>;
}

export type CREATE = 'CREATE';

export type CogniteCapability = SingleCogniteCapability[];

export interface CogniteEvent
  extends ExternalEvent,
    InternalId,
    CreatedAndLastUpdatedTime {}

export interface CreatedAndLastUpdatedTime {
  lastUpdatedTime: Date;
  createdTime: Date;
}

export interface CreatedAndLastUpdatedTimeFilter {
  lastUpdatedTime?: DateRange;
  createdTime?: DateRange;
}

/**
 * External Id provided by client. Should be unique within the project.
 */
export type CogniteExternalId = string;

export type CogniteInternalId = number;

export type CreateAssetMapping3D = AssetMapping3DBase;

export interface CreateModel3D {
  /**
   * The name of the model.
   */
  name: string;
  metadata?: Metadata;
}

export interface CreateRevision3D {
  /**
   * True if the revision is marked as published.
   */
  published?: boolean;
  /**
   * Global rotation to be applied to the entire model.
   * The rotation is expressed by Euler angles in radians and in XYZ order.
   */
  rotation?: [boolean, boolean, boolean];
  camera?: RevisionCameraProperties;
  /**
   * The file id to a file uploaded to Cognite's Files API.
   * Can only be set on revision creation, and can never be updated. _Only FBX files are supported_.
   */
  fileId: CogniteInternalId;
  metadata?: Metadata;
}

/**
 * Cursor for paging through results
 */
export interface Cursor {
  cursor?: string;
}

export interface CursorResponse<T> extends ItemsWrapper<T> {
  nextCursor?: string;
}

export type DELETE = 'DELETE';

export interface DataIds {
  items?: AssetIdEither[];
}

export interface DatapointsDeleteRange {
  /**
   * The timestamp of first datapoint to delete
   */
  inclusiveBegin: Timestamp;
  /**
   * If set, the timestamp of first datapoint after inclusiveBegin to not delete. If not set, only deletes the datapoint at inclusiveBegin.
   */
  exclusiveEnd?: Timestamp;
}

export type DatapointsDeleteRequest =
  | InternalId & DatapointsDeleteRange
  | ExternalId & DatapointsDeleteRange;

export interface DatapointsGetAggregateDatapoint extends DatapointsMetadata {
  datapoints: GetAggregateDatapoint[];
}

export type DatapointsGetDatapoint =
  | DatapointsGetStringDatapoint
  | DatapointsGetDoubleDatapoint;

export interface DatapointsGetDoubleDatapoint extends DatapointsMetadata {
  /**
   * Whether the time series is string valued or not.
   */
  isString: false;
  /**
   * The list of datapoints
   */
  datapoints: GetDoubleDatapoint[];
}

export interface DatapointsGetStringDatapoint extends DatapointsMetadata {
  /**
   * Whether the time series is string valued or not.
   */
  isString: true;
  /**
   * The list of datapoints
   */
  datapoints: GetStringDatapoint[];
}

export interface DatapointsInsertProperties {
  datapoints: PostDatapoint[];
}

export interface DatapointsMetadata extends InternalId {
  /**
   * External id of the timeseries the datapoints belong to.
   */
  externalId?: CogniteExternalId;
}

export interface DatapointsMultiQueryBase extends Limit {
  /**
   * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send in a Date object. Note that when using aggregates, the start time will be rounded down to a whole granularity unit (in UTC timezone). For granularity 2d it will be rounded to 0:00 AM on the same day, for 3h it will be rounded to the start of the hour, etc.
   */
  start?: string | Timestamp;
  /**
   * Get datapoints up to this time. Same format as for start. Note that when using aggregates, the end will be rounded up such that the last aggregate represents a full aggregation interval containing the original end, where the interval is the granularity unit times the granularity multiplier. For granularity 2d, the aggregation interval is 2 days, if end was originally 3 days after the start, it will be rounded to 4 days after the start.
   */
  end?: string | Timestamp;
  /**
   * The aggregates to be returned. This value overrides top-level default aggregates list when set. Specify all aggregates to be retrieved here. Specify empty array if this sub-query needs to return datapoints without aggregation.
   */
  aggregates?: Aggregate[];
  /**
   * The time granularity size and unit to aggregate over.
   */
  granularity?: string;
  /**
   * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
   */
  includeOutsidePoints?: boolean;
}

export interface DatapointsMultiQuery extends DatapointsMultiQueryBase {
  items: DatapointsQuery[];
}

export type DatapointsPostDatapoint =
  | DatapointsPostDatapointId
  | DatapointsPostDatapointExternalId;

export interface DatapointsPostDatapointExternalId
  extends DatapointsInsertProperties,
    ExternalId {}

export interface DatapointsPostDatapointId
  extends DatapointsInsertProperties,
    InternalId {}

export type DatapointsQuery = DatapointsQueryId | DatapointsQueryExternalId;

export interface DatapointsQueryExternalId
  extends DatapointsQueryProperties,
    ExternalId {}

export interface DatapointsQueryId
  extends DatapointsQueryProperties,
    InternalId {}

export interface DatapointsQueryProperties extends Limit {
  /**
   * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send in Date object. Note that when using aggregates, the start time will be rounded down to a whole granularity unit (in UTC timezone). For granularity 2d it will be rounded to 0:00 AM on the same day, for 3h it will be rounded to the start of the hour, etc.
   */
  start?: string | Timestamp;
  /**
   * Get datapoints up to this time. Same format as for start. Note that when using aggregates, the end will be rounded up such that the last aggregate represents a full aggregation interval containing the original end, where the interval is the granularity unit times the granularity multiplier. For granularity 2d, the aggregation interval is 2 days, if end was originally 3 days after the start, it will be rounded to 4 days after the start.
   */
  end?: string | Timestamp;
  /**
   * The aggregates to be returned.  Use default if null. An empty string must be sent to get raw data if the default is a set of aggregates.
   */
  aggregates?: Aggregate[];
  /**
   * The granularity size and granularity of the aggregates (2h)
   */
  granularity?: string;
  /**
   * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
   */
  includeOutsidePoints?: boolean;
}

export type DateRange = Range<Timestamp>;

/**
 * A default group for all project users. Can be used to establish default capabilities. WARNING: this group may be logically deleted
 */
export type DefaultGroupId = number;

export type DeleteAssetMapping3D = AssetMapping3DBase;

export type EXECUTE = 'EXECUTE';

export type EventChange = EventChangeById | EventChangeByExternalId;

export type SequenceChange = SequencePatch & IdEither;

export interface EventChangeByExternalId extends EventPatch, ExternalId {}

export interface EventChangeById extends EventPatch, InternalId {}

export interface SequencePatch {
  update: {
    name?: SinglePatchString;
    description?: SinglePatchString;
    assetId?: NullableSinglePatchLong;
    externalId?: SinglePatchString;
    endTime?: SinglePatchDate;
    metadata?: ObjectPatch;
  };
}

export interface EventFilter extends CreatedAndLastUpdatedTimeFilter {
  startTime?: DateRange;
  endTime?: DateRange;
  metadata?: Metadata;
  /**
   * Asset IDs of related equipment that this event relates to.
   */
  assetIds?: CogniteInternalId[];
  /**
   * Asset External IDs of related equipment that this event relates to.
   */
  assetExternalIds?: CogniteExternalId[];
  /**
   * Only include events that have a related asset in a tree rooted at any of these root assetIds.
   */
  rootAssetIds?: IdEither[];
  /**
   * Only include events that have a related asset in a subtree rooted at any of these assetIds.
   * If the total size of the given subtrees exceeds 100,000 assets, an error will be returned.
   */
  assetSubtreeIds?: IdEither[];
  /**
   * Filter by event source
   */
  source?: string;
  /**
   * Filter by event type
   */
  type?: string;
  /**
   * Filter by event subtype
   */
  subtype?: string;
  externalIdPrefix?: ExternalIdPrefix;
}

/**
 * Items can be sorted in either ascending or descending order
 */
export type SortOrder = 'asc' | 'desc';

export const SortOrder = {
  ASC: 'asc' as SortOrder,
  DESC: 'desc' as SortOrder,
};

/**
 * Sort by selected fields.
 * Only sorting on 1 field is currently supported.
 * Partitions are done independently of sorting, there is no guarantee on sort order between elements from different partitions.
 */
export interface EventSort {
  startTime?: SortOrder;
  endTime?: SortOrder;
  createdTime?: SortOrder;
  lastUpdatedTime?: SortOrder;
}

export interface EventFilterRequest extends FilterQuery {
  filter?: EventFilter;
  sort?: EventSort;
  partition?: Partition;
}

export interface EventPatch {
  update: {
    externalId?: SinglePatchString;
    startTime?: SinglePatchDate;
    endTime?: SinglePatchDate;
    description?: SinglePatchString;
    metadata?: ObjectPatch;
    assetIds?: ArrayPatchLong;
    source?: SinglePatchString;
  };
}

export interface EventSearch {
  description?: string;
}

export interface EventSearchRequest extends Limit {
  filter?: EventFilter;
  search?: EventSearch;
}

export interface ExternalAsset {
  externalId?: CogniteExternalId;
  name: AssetName;
  parentId?: CogniteInternalId;
  description?: AssetDescription;
  metadata?: Metadata;
  source?: AssetSource;
}

export interface ExternalAssetItem extends ExternalAsset {
  /**
   * External id to the parent asset
   */
  parentExternalId?: CogniteExternalId;
}

/**
 * An event represents something that happened at a given interval in time, e.g a failure, a work order etc.
 */
export interface ExternalEvent {
  externalId?: CogniteExternalId;
  startTime?: Timestamp;
  endTime?: Timestamp;
  type?: string;
  subtype?: string;
  description?: string;
  metadata?: Metadata;
  assetIds?: CogniteInternalId[];
  source?: string;
}

export interface ExternalFilesMetadata {
  externalId?: CogniteExternalId;
  name: FileName;
  source?: string;
  mimeType?: FileMimeType;
  metadata?: Metadata;
  assetIds?: CogniteInternalId[];
  sourceCreatedTime?: Date;
  sourceModifiedTime?: Date;
}

export interface ExternalId {
  externalId: CogniteExternalId;
}

export interface FileChange {
  update: {
    externalId?: SinglePatchString;
    source?: SinglePatchString;
    mimeType?: SinglePatchString;
    metadata?: ObjectPatch;
    assetIds?: ArrayPatchLong;
    sourceCreatedTime?: SinglePatchDate;
    sourceModifiedTime?: SinglePatchDate;
  };
}

export type FileChangeUpdate =
  | FileChangeUpdateById
  | FileChangeUpdateByExternalId;

export interface FileChangeUpdateByExternalId extends ExternalId, FileChange {}

export interface FileChangeUpdateById extends InternalId, FileChange {}

export type FileContent = ArrayBuffer | Buffer | any;

export interface FileFilter extends Limit {
  filter?: {
    name?: FileName;
    mimeType?: FileMimeType;
    metadata?: Metadata;
    /**
     * Only include files that reference these specific asset IDs.
     */
    assetIds?: CogniteInternalId[];
    /**
     * Only include files that have a related asset in a tree rooted at any of these root assetIds.
     */
    rootAssetIds?: IdEither[];
    /**
     * Only include files that are related to an asset in a subtree rooted at any of these assetIds.
     * If the total size of the given subtrees exceeds 100,000 assets, an error will be returned.
     */
    assetSubtreeIds?: IdEither[];
    source?: string;
    createdTime?: DateRange;
    lastUpdatedTime?: DateRange;
    uploadedTime?: DateRange;
    sourceCreatedTime?: DateRange;
    sourceModifiedTime?: DateRange;
    externalIdPrefix?: ExternalIdPrefix;
    uploaded?: boolean;
  };
}

export interface FileLink {
  downloadUrl: string;
}

/**
 * File type. E.g. text/plain, application/pdf, ...
 */
export type FileMimeType = string;

/**
 * Name of the file.
 */
export type FileName = string;

export interface FileRequestFilter extends FilterQuery, FileFilter {}

export interface FilesMetadata
  extends ExternalFilesMetadata,
    CreatedAndLastUpdatedTime {
  id: CogniteInternalId;
  /**
   * Whether or not the actual file is uploaded
   */
  uploaded: boolean;
  uploadedTime?: Date;
}

export interface FilesSearchFilter extends FileFilter {
  search?: {
    name?: FileName;
  };
}

/**
 * Prefix filter on externalId. (case-sensitive)
 */
export type ExternalIdPrefix = string;

export interface FilterQuery extends Cursor, Limit {}

interface SequenceRowsRetriveData extends Cursor, Limit {
  /**
   * Lowest row number included.
   * @default 0
   */
  start?: number;
  /**
   * Get rows up to, but excluding, this row number.
   * @default "no limit"
   */
  end?: number;
  /**
   * Columns to be included. Specified as list of column externalIds.
   * In case this filter is not set, all available columns will be returned.
   */
  columns?: string[];
}

/**
 * A request for datapoints stored
 */
export type SequenceRowsRetrieve = SequenceRowsRetriveData & IdEither;

export interface SequenceRowsResponseData extends InternalId {
  externalId?: ExternalId;
  columns: SequenceColumnBasicInfo[];
  rows: SequenceRowData[];
  nextCursor?: string;
}

export interface GetAggregateDatapoint extends GetDatapointMetadata {
  average?: number;
  max?: number;
  min?: number;
  count?: number;
  sum?: number;
  interpolation?: number;
  stepInterpolation?: number;
  continuousVariance?: number;
  discreteVariance?: number;
  totalVariation?: number;
}

export interface GetDatapointMetadata {
  timestamp: Date;
}

export interface GetDoubleDatapoint extends GetDatapointMetadata {
  value: number;
}

export interface GetStringDatapoint extends GetDatapointMetadata {
  value: string;
}

/**
 * Name of time series
 */
export type TimeseriesName = string;

/**
 * Whether the time series is string valued or not.
 */
export type TimeseriesIsString = boolean;

/**
 * The physical unit of the time series.
 */
export type TimeseriesUnit = string;

/**
 * Whether the time series is a step series or not.
 */
export type TimeseriesIsStep = boolean;

export interface GetTimeSeriesMetadataDTO
  extends InternalId,
    CreatedAndLastUpdatedTime {
  /**
   * Externally supplied id of the time series
   */
  externalId?: CogniteExternalId;
  name?: TimeseriesName;
  isString: TimeseriesIsString;
  /**
   * Additional metadata. String key -> String value.
   */
  metadata?: Metadata;
  unit?: TimeseriesUnit;
  /**
   * Asset that this time series belongs to.
   */
  assetId?: CogniteInternalId;
  isStep: TimeseriesIsStep;
  /**
   * Description of the time series.
   */
  description: string;
  /**
   * Security categories required in order to access this time series.
   */
  securityCategories?: number[];
}

export interface Group {
  name: GroupName;
  sourceId?: GroupSourceId;
  capabilities?: CogniteCapability;
  id: number;
  isDeleted: boolean;
  deletedTime?: Date;
}

/**
 * Name of the group
 * @example Production Engineers
 */
export type GroupName = string;

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

/**
 * ID of the group in the source. If this is the same ID as a group in the IDP, a user in that group will implicitly be a part of this group as well.
 * @example b7c9a5a4-99c2-4785-bed3-5e6ad9a78603
 */
export type GroupSourceId = string;

export interface GroupSpec {
  name: GroupName;
  sourceId?: GroupSourceId;
  capabilities?: CogniteCapability;
}

export type Groups = CogniteInternalId[];

export type IdEither = InternalId | ExternalId;

/**
 * Data about how to authenticate and authorize users
 */
export interface InputProjectAuthentication {
  azureADConfiguration?: AzureADConfigurationDTO;
  validDomains?: ValidDomains;
  oAuth2Configuration?: OAuth2ConfigurationDTO;
}

/**
 * Range between two integers
 */
export type IntegerRange = Range<number>;

export interface InternalId {
  id: CogniteInternalId;
}

export type ItemsResponse<T> = ItemsWrapper<T[]>;

/** @hidden */
export interface ItemsWrapper<T> {
  items: T;
}

export type LIST = 'LIST';

export type LatestDataBeforeRequest =
  | InternalId & LatestDataPropertyFilter
  | ExternalId & LatestDataPropertyFilter;

export interface LatestDataPropertyFilter {
  /**
   * Get first datapoint before this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send time as a Date object.
   */
  before?: string | Date;
}

export interface Limit {
  limit?: number;
}

export interface List3DNodesQuery extends FilterQuery {
  /**
   * Get sub nodes up to this many levels below the specified node. Depth 0 is the root node.
   */
  depth?: number;
  /**
   * ID of a node that are the root of the subtree you request (default is the root node).
   */
  nodeId?: CogniteInternalId;
  /**
   * Filter for node properties. Only nodes that match all the given properties exactly will be listed. The filter must be a JSON object with the same format as the properties field.
   */
  properties?: Node3DProperties;
}

export interface ListGroups {
  /**
   * Whether to get all groups, only available with the groups:list acl.
   */
  all?: boolean;
}

export type ListRawDatabases = FilterQuery;

export interface ListRawRows extends FilterQuery {
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

export type ListRawTables = FilterQuery;

export interface ListResponse<T> extends CursorResponse<T> {
  next?: () => Promise<ListResponse<T>>;
}

export type ListReveal3DNodeAncestors = FilterQuery;

export interface ListRevealSectors3DQuery extends FilterQuery {
  /**
   * Bounding box to restrict search to. If given, only return sectors that intersect the given bounding box. Given as a JSON-encoded object of two arrays \"min\" and \"max\" with 3 coordinates each.
   */
  boundingBox?: BoundingBox3D;
}

export interface ListSecurityCategories extends FilterQuery {
  sort?: 'ASC' | 'DESC';
}

/**
 * The url to send the user to in order to log out
 * @example https://accounts.google.com/logout
 */
export type LogoutUrl = string;

/**
 * Object containing the log out URL
 */
export interface LogoutUrlResponse {
  data: { url: LogoutUrl };
}

export type MEMBEROF = 'MEMBEROF';

/**
 * Custom, application specific metadata.
 * Maximum length of key is 32 bytes, value 512 bytes, up to 16 key-value pairs.
 */
export interface Metadata {
  [key: string]: string;
}

export interface Model3D {
  /**
   * The name of the model.
   */
  name: string;
  /**
   * The ID of the model.
   */
  id: CogniteInternalId;
  createdTime: Date;
  metadata?: Metadata;
}

export interface Model3DListRequest extends Limit {
  /**
   * Filter based on whether or not it has published revisions.
   */
  published?: boolean;
}

export interface NewApiKeyResponse extends ApiKeyObject {
  /**
   * The api key to be used against the API
   */
  value: string;
}

export interface Node3D {
  /**
   * The ID of the node.
   */
  id: CogniteInternalId;
  /**
   * The index of the node in the 3D model hierarchy, starting from 0.
   * The tree is traversed in a depth-first order.
   */
  treeIndex: number;
  /**
   * The parent of the node, null if it is the root node.
   */
  parentId: CogniteInternalId;
  /**
   * The depth of the node in the tree, starting from 0 at the root node.
   */
  depth: number;
  /**
   * The name of the node.
   */
  name: string;
  /**
   * The number of descendants of the node, plus one (counting itself).
   */
  subtreeSize: number;
  /**
   * Properties extracted from 3D model, with property categories containing key/value string pairs.
   */
  properties?: Node3DProperties;
  /**
   *  The bounding box of the subtree with this sector as the root sector.
   *  Is null if there are no geometries in the subtree.
   */
  boundingBox: BoundingBox3D;
}

/**
 * Properties extracted from 3D model, with property categories containing key/value string pairs.
 */
export interface Node3DProperties {
  [category: string]: {
    [key: string]: string;
  };
}

export type NullableSinglePatchLong = { set: number } | { setNull: true };

export type NullableSinglePatchString = { set: string } | { setNull: true };

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

export type ObjectPatch =
  | {
      /**
       * Set the key-value pairs. All existing key-value pairs will be removed.
       */
      set: { [key: string]: string };
    }
  | {
      /**
       * Add the key-value pairs. Values for existing keys will be overwritten.
       */
      add: { [key: string]: string };
      /**
       * Remove the key-value pairs with given keys.
       */
      remove: string[];
    };

/**
 * Data about how to authenticate and authorize users. The authentication configuration is hidden.
 */
export interface OutputProjectAuthentication {
  validDomains?: ValidDomains;
}

export interface PostDatapoint {
  timestamp: Timestamp;
  value: number | string;
}

export interface PostTimeSeriesMetadataDTO {
  /**
   * Externally provided id for the time series (optional but recommended)
   */
  externalId?: CogniteExternalId;
  /**
   * Set a value for legacyName to allow applications using API v0.3, v04, v05, and v0.6 to access this time series. The legacy name is the human-readable name for the time series and is mapped to the name field used in API versions 0.3-0.6. The legacyName field value must be unique, and setting this value to an already existing value will return an error. We recommend that you set this field to the same value as externalId.
   */
  legacyName?: string;
  /**
   * Human readable name of time series
   */
  name?: string;
  /**
   * Whether the time series is string valued or not.
   */
  isString?: boolean;
  /**
   * Additional metadata. String key -> String value.
   */
  metadata?: Metadata;
  /**
   * The physical unit of the time series.
   */
  unit?: string;
  /**
   * Asset that this time series belongs to.
   */
  assetId?: CogniteInternalId;
  /**
   * Whether the time series is a step series or not.
   */
  isStep?: boolean;
  /**
   * Description of the time series.
   */
  description?: string;
  /**
   * Security categories required in order to access this time series."
   */
  securityCategories?: number[];
}

/**
 * The display name of the project.
 * @example Open Industrial Data
 */
export type ProjectName = string;

/**
 * Information about the project
 */
export interface ProjectResponse {
  name: ProjectName;
  urlName: UrlName;
  defaultGroupId?: DefaultGroupId;
  authentication?: OutputProjectAuthentication;
}

export interface ProjectUpdate {
  name?: ProjectName;
  defaultGroupId?: DefaultGroupId;
  authentication?: InputProjectAuthentication;
}

export type READ = 'READ';

export interface Range<T> {
  min?: T;
  max?: T;
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

export interface RawDBRow extends RawDBRowInsert {
  /**
   * Time when the row was last updated
   */
  lastUpdatedTime: Date;
}

export interface RawDBRowInsert extends RawDBRowKey {
  /**
   * Row data stored as a JSON object.
   */
  columns: { [key: string]: string };
}

export interface RawDBRowKey {
  /**
   * Unique row key
   */
  key: string;
}

export interface SequenceListScope extends SequenceFilter, Limit, Cursor {}

/**
 * Data from a sequence
 */
export interface SequenceRowsInsertData {
  /**
   * Column external ids in the same order as the values for each row
   */
  columns: string[];
  /**
   * List of row information
   */
  rows: SequenceRowData[];
}

export interface SequenceRowsData extends InternalId {
  externalId?: ExternalId;
  /**
   * Column external ids in the same order as the values for each row
   */
  columns: string[];
  /**
   * List of row information
   */
  rows: SequenceRowData[];
}

/**
 * A single row of datapoints
 */
export interface SequenceRowData {
  /**
   * The row number for this row
   */
  rowNumber: number;
  /**
   * List of values in order defined in the columns field
   * (Number of items must match. Null is accepted for missing values)
   */
  values: SequenceItem[];
}

/**
 * Element of type corresponding to the column type. May include NULL!
 */
export type SequenceItem = number | string | null;

export type SequenceRowsInsert = SequenceRowsInsertData & IdEither;

export type SequenceRowsDelete = SequenceRowsDeleteData & IdEither;

interface SequenceRowsDeleteData {
  /**
   * Rows to delete from a sequence
   */
  rows: number[];
}

export interface RawDBTable {
  /**
   * Unique name of the table
   */
  name: string;
}

export interface RemoveField {
  setNull: boolean;
}

export interface RevealNode3D extends Node3D {
  /**
   * The sector the node is contained in.
   */
  sectorId: CogniteInternalId;
}

export interface RevealRevision3D extends Revision3D {
  sceneThreedFiles: Versioned3DFile[];
}

export interface RevealSector3D {
  /**
   * The id of the sector.
   */
  id: CogniteInternalId;
  /**
   * The parent of the sector, null if it is the root sector.
   */
  parentId: CogniteInternalId;
  /**
   * String representing the path to the sector: 0/2/6/ etc.
   */
  path: string;
  /**
   * The depth of the sector in the sector tree, starting from 0 at the root sector.
   */
  depth: number;
  /**
   * The bounding box of the subtree with this sector as the root sector. Is null if there are no geometries in the subtree.
   */
  boundingBox: BoundingBox3D;
  /**
   * The file ID of the data file for this sector, with multiple versions supported. Use /3d/files/{id} to retrieve the file.
   */
  threedFiles: Versioned3DFile[];
}

export interface Revision3D {
  /**
   * The ID of the revision.
   */
  id: CogniteInternalId;
  /**
   * The file id.
   */
  fileId: CogniteInternalId;
  /**
   * True if the revision is marked as published.
   */
  published: boolean;
  /**
   * Global rotation to be applied to the entire model.
   * The rotation is expressed by Euler angles in radians and in XYZ order.
   */
  rotation?: [number, number, number];
  camera?: RevisionCameraProperties;
  /**
   * The status of the revision.
   */
  status: Revision3DStatus;
  /**
   * The threed file ID of a thumbnail for the revision.
   * Use /3d/files/{id} to retrieve the file.
   */
  thumbnailThreedFileId?: number;
  /**
   * The URL of a thumbnail for the revision.
   */
  thumbnailURL?: string;
  /**
   * The number of asset mappings for this revision.
   */
  assetMappingCount: number;
  /**
   *
   */
  createdTime: Date;
  metadata?: Metadata;
}

export interface Revision3DListRequest extends Limit {
  /**
   * Filter based on whether or not it has published revisions.
   */
  published?: boolean;
}

type Revision3DStatus = 'Queued' | 'Processing' | 'Done' | 'Failed';

export interface RevisionCameraProperties {
  /**
   * Initial camera target.
   */
  target?: Tuple3<number>;
  /**
   * Initial camera position.
   */
  position?: Tuple3<number>;
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

export interface SecurityCategory {
  /**
   * Name of the security category
   */
  name: string;
  /**
   * Id of the security category
   */
  id: number;
}

export interface SecurityCategorySpec {
  /**
   * Name of the security category
   */
  name: string;
}

export interface ServiceAccount {
  name: ServiceAccountName;
  groups?: Groups;
  id: CogniteInternalId;
  /**
   * If this service account has been logically deleted
   */
  isDeleted?: boolean;
  /**
   * Time of deletion
   */
  deletedTime?: Date;
}

export interface ServiceAccountInput {
  name: ServiceAccountName;
  groups?: Groups;
}

/**
 * Unique name of the service account
 */
export type ServiceAccountName = string;

export interface SetField<T> {
  set: T;
}

export type SingleCogniteCapability =
  | { groupsAcl: AclGroups }
  | { assetsAcl: AclAssets }
  | { eventsAcl: AclEvents }
  | { filesAcl: AclFiles }
  | { usersAcl: AclUsers }
  | { projectsAcl: AclProjects }
  | { securityCategoriesAcl: AclSecurityCategories }
  | { rawAcl: AclRaw }
  | { timeSeriesAcl: AclTimeseries }
  | { apikeysAcl: AclApiKeys }
  | { threedAcl: Acl3D }
  | { sequencesAcl: AclSequences }
  | { analyticsAcl: AclAnalytics };

export type SinglePatchDate = { set: Timestamp } | { setNull: boolean };

/**
 * Non removable string change.
 */
export interface SinglePatchRequiredString {
  set: string;
}

export type SinglePatchString = SetField<string> | RemoveField;

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

export interface TimeSeriesSearchDTO extends Limit {
  filter?: Filter;
  search?: Search;
}

export type TimeSeriesUpdate =
  | TimeSeriesUpdateById
  | TimeSeriesUpdateByExternalId;

export interface TimeSeriesUpdateByExternalId
  extends TimeSeriesPatch,
    ExternalId {}

export interface TimeSeriesUpdateById extends TimeSeriesPatch, InternalId {}

interface TimeseriesFilterProps extends CreatedAndLastUpdatedTimeFilter {
  name?: TimeseriesName;
  unit?: TimeseriesUnit;
  isString?: TimeseriesIsString;
  isStep?: TimeseriesIsStep;
  metadata?: Metadata;
  /**
   * Get time series related to these assets. Takes [ 1 .. 100 ] unique items.
   */
  assetIds?: CogniteInternalId[];
  /**
   * Asset External IDs of related equipment that this time series relates to.
   */
  assetExternalIds?: CogniteExternalId[];
  /**
   * Only include timeseries that have a related asset in a tree rooted at any of these root assetIds.
   */
  rootAssetIds?: CogniteInternalId[];
  /**
   * Only include timeseries that are related to an asset in a subtree rooted at any of these assetIds.
   * If the total size of the given subtrees exceeds 100,000 assets, an error will be returned.
   */
  assetSubtreeIds?: IdEither[];
  externalIdPrefix?: ExternalIdPrefix;
}

export type Filter = TimeseriesFilterProps;

/**
 * Splits the data set into N partitions.
 * This should NOT be used for frontend applications.
 * Partitions are formatted as `n/m`, where `n` is the index of the parititon, and `m` is the total number or partitions.
 * i.e. 20 partitions would have one request with `partition: 1/20`, then another `partition: 2/20` and so on.
 * You need to use `autoPagingToArray(...)` on each partition in order to receive all the data.
 * @example 1/10
 */
export type Partition = string;

export interface TimeseriesFilterQuery extends FilterQuery {
  filter?: TimeseriesFilterProps;
  partition?: Partition;
}

export interface TimeseriesFilter extends TimeseriesFilterProps, FilterQuery {
  /**
   * Decide if the metadata field should be returned or not.
   * This property is ignored by SDK, you can call the endpoint manually if you want to leverage it.
   */
  includeMetadata?: boolean;
  partition?: Partition;
}

export type TimeseriesIdEither = InternalId | ExternalId;

export type Timestamp = number | Date;

export type Tuple3<T> = T[];

export type UPDATE = 'UPDATE';

export interface UnrealRevision3D extends Revision3D {
  sceneThreedFiles: Versioned3DFile[];
}

export interface UpdateModel3D extends UpdateModelNameField, InternalId {}

export interface UpdateModelNameField {
  update: {
    name: SetField<string>;
  };
}

export interface UpdateRevision3D {
  id: CogniteInternalId;
  update: {
    /**
     * True if the revision is marked as published.
     */
    published?: SetField<boolean>;
    /**
     * Global rotation to be applied to the entire model.
     * The rotation is expressed by Euler angles in radians and in XYZ order.
     */
    rotation?: SetField<Tuple3<number>>;
    /**
     * Initial camera target.
     */
    camera?: SetField<RevisionCameraProperties>;
  };
}

export interface UploadFileMetadataResponse extends FilesMetadata {
  uploadUrl: string;
}

/**
 * The url name of the project. This is used as part of API calls. It should only contain letters, digits and hyphens, as long as the hyphens are not at the start or end.
 * @example publicdata
 */
export type UrlName = string;

/**
 * List of valid domains. If left empty, any user registered with the OAuth2 provider will get access.
 */
export type ValidDomains = string[];

/**
 * The file ID of the data file for this resource, with multiple versions supported.
 * Use /3d/files/{id} to retrieve the file.
 */
export interface Versioned3DFile {
  /**
   * Version of the file format.
   */
  version: number;
  /**
   * File ID. Use /3d/files/{id} to retrieve the file.
   */
  fileId: CogniteInternalId;
}

export type WRITE = 'WRITE';

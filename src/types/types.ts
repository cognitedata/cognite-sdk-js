// Copyright 2019 Cognite AS

export type CogniteInternalId = number;

/**
 * External Id provided by client. Should be unique within the project.
 */
export type CogniteExternalId = string;

export type IdEither = InternalId | ExternalId;

export interface InternalId {
  id: CogniteInternalId;
}

export interface ExternalId {
  externalId: CogniteExternalId;
}

/**
 * Custom, application specific metadata. String key -> String value
 */
export interface Metadata {
  [key: string]: string;
}

/**
 * Cursor for paging through results
 */
export interface Cursor {
  cursor?: string;
}

export interface Limit {
  limit?: number;
}

export type Timestamp = number | Date;

export interface Range<T> {
  min?: T;
  max?: T;
}

/**
 * Range between two integers
 */
export type IntegerRange = Range<number>;
export type DateRange = Range<Timestamp>;

export interface DataIds {
  items?: AssetIdEither[];
}

/**
 * Reference ID used only in post request to disambiguate references to duplicate names.
 */
export type CogniteRefId = string;

/**
 * Reference ID of parent, to disambiguate if multiple nodes have the same name.
 */
export type CogniteParentRefId = string;

// Assets

/**
 * The source of this asset
 */
export type AssetSource = string;

/**
 * Description of asset.
 */
export type AssetDescription = string;

/**
 * Name of asset. Often referred to as tag.
 */
export type AssetName = string;

export type AssetInternalId = InternalId;

export type AssetExternalId = ExternalId;

export type AssetIdEither = IdEither;

export interface SetField<T> {
  set: T;
}

export interface RemoveField {
  setNull: boolean;
}

export type SinglePatchString = SetField<string> | RemoveField;

export type SinglePatchDate = { set: Timestamp } | { setNull: boolean };

/**
 * Non removable string change.
 */
export interface SinglePatchRequiredString {
  set: string;
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

export type NullableSinglePatchString = { set: string } | { setNull: true };
export type NullableSinglePatchLong = { set: number } | { setNull: true };
export type ArrayPatchLong =
  | { set: number[] }
  | { add?: number[]; remove?: number[] };

export interface AssetPatch {
  update: {
    externalId?: SinglePatchString;
    name?: SinglePatchRequiredString;
    description?: SinglePatchString;
    metadata?: ObjectPatch;
    source?: SinglePatchString;
  };
}

export interface AssetChangeById extends AssetPatch, InternalId {}

export interface AssetChangeByExternalId extends AssetPatch, ExternalId {}

export type AssetChange = AssetChangeById | AssetChangeByExternalId;

export interface ExternalAsset {
  externalId?: CogniteExternalId;
  name?: AssetName;
  parentId?: CogniteInternalId;
  description?: AssetDescription;
  metadata?: Metadata;
  source?: AssetSource;
}

export interface ExternalAssetItem extends ExternalAsset {
  refId?: CogniteRefId;
  parentRefId?: CogniteParentRefId;
}

/**
 * Filter on assets with exact match
 */
export interface AssetFilter extends Limit {
  filter?: {
    name?: AssetName;
    parentIds?: CogniteInternalId[];
    metadata?: Metadata;
    source?: AssetSource;
    createdTime?: DateRange;
    lastUpdatedTime?: DateRange;
    assetSubtrees?: CogniteInternalId[];
    depth?: IntegerRange;
    externalIdPrefix?: CogniteExternalId;
  };
}

export interface AssetListScope extends AssetFilter, Cursor {}

export interface AssetSearchFilter extends AssetFilter {
  search?: {
    name?: AssetName;
    description?: AssetDescription;
  };
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
}

export interface CreateModel3D {
  /**
   * The name of the model.
   */
  name: string;
}

export interface UpdateModelNameField {
  update: {
    name: SetField<string>;
  };
}

export interface UpdateModel3D extends UpdateModelNameField, InternalId {}

export interface Asset extends ExternalAsset, AssetInternalId {
  lastUpdatedTime: Date;
  /**
   * IDs of assets on the path to the asset.
   */
  path: number[];
  /**
   * Asset path depth (number of levels below root node).
   */
  depth: number;
}

// Time series
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

export interface GetTimeSeriesMetadataDTO extends InternalId {
  /**
   * Externally supplied id of the time series
   */
  externalId?: CogniteExternalId;
  /**
   * Name of time series
   */
  name?: string;
  /**
   * Whether the time series is string valued or not.
   */
  isString: boolean;
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
  isStep: boolean;
  /**
   * Description of the time series.
   */
  description: string;
  /**
   * Security categories required in order to access this time series.
   */
  securityCategories?: number[];
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface PostTimeSeriesMetadataDTO {
  /**
   * Externally provided id for the time series (optional but recommended)
   */
  externalId?: CogniteExternalId;
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
   * Filter out timeseries that do not match these metadata fields and values (case-sensitive)
   */
  metadata?: Metadata;
  /**
   * Filter out time series that are not linked to any of these assets.
   */
  assetIds?: CogniteInternalId[];
  /**
   * Filter out time series that are not linked to assets in the subtree rooted at these assets. Format is list of ids.
   */
  assetSubtrees?: CogniteInternalId[];
  createdTime?: Date;
  lastUpdatedTime?: Date;
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

export interface TimeSeriesSearchDTO extends Limit {
  filter?: Filter;
  search?: Search;
  /**
   * Return up to this many results.
   */
}

export type TimeseriesIdEither = InternalId | ExternalId;

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

export interface TimeSeriesUpdateById extends TimeSeriesPatch, InternalId {}

export interface TimeSeriesUpdateByExternalId
  extends TimeSeriesPatch,
    ExternalId {}

export type TimeSeriesUpdate =
  | TimeSeriesUpdateById
  | TimeSeriesUpdateByExternalId;

// datapoints
export interface PostDatapoint {
  timestamp: Timestamp;
  value: number | string;
}

export interface DatapointsInsertProperties {
  datapoints: PostDatapoint[];
}

export interface DatapointsPostDatapointId
  extends DatapointsInsertProperties,
    InternalId {}

export interface DatapointsPostDatapointExternalId
  extends DatapointsInsertProperties,
    ExternalId {}

export type DatapointsPostDatapoint =
  | DatapointsPostDatapointId
  | DatapointsPostDatapointExternalId;

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

export interface DatapointsQueryId
  extends DatapointsQueryProperties,
    InternalId {}

export interface DatapointsQueryExternalId
  extends DatapointsQueryProperties,
    ExternalId {}

export type DatapointsQuery = DatapointsQueryId | DatapointsQueryExternalId;

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

export interface DatapointsMultiQuery extends Limit {
  items: DatapointsQuery[];
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

export interface DatapointsMetadata extends InternalId {
  /**
   * External id of the timeseries the datapoints belong to.
   */
  externalId?: CogniteExternalId;
}

export interface GetDatapointMetadata {
  timestamp: Date;
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

export interface DatapointsGetAggregateDatapoint extends DatapointsMetadata {
  datapoints: GetAggregateDatapoint[];
}

export interface GetStringDatapoint extends GetDatapointMetadata {
  value: string;
}

export interface GetDoubleDatapoint extends GetDatapointMetadata {
  value: number;
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

export type DatapointsGetDatapoint =
  | DatapointsGetStringDatapoint
  | DatapointsGetDoubleDatapoint;

export interface LatestDataPropertyFilter {
  /**
   * Get first datapoint before this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send time as a Date object.
   */
  before: string | Date;
}

export type LatestDataBeforeRequest =
  | InternalId & LatestDataPropertyFilter
  | ExternalId & LatestDataPropertyFilter;

export interface DatapointsDeleteRange {
  /**
   * The timestamp of first datapoint to delete
   */
  inclusiveBegin: Timestamp;
  /**
   * If set, the timestamp of first datapoint after inclusiveBegin to not delete. If not set, only deletes the datapoint at inclusiveBegin.
   */
  exclusiveEnd: Timestamp;
}

export type DatapointsDeleteRequest =
  | InternalId & DatapointsDeleteRange
  | ExternalId & DatapointsDeleteRange;

// events

/**
 * An event represents something that happened at a given interval in time, e.g a failure, a work order etc.
 */
export interface ExternalEvent {
  externalId?: CogniteExternalId;
  startTime?: Timestamp;
  endTime?: Timestamp;
  description?: string;
  metadata?: Metadata;
  assetIds?: CogniteInternalId[];
  source?: string;
}

export interface CogniteEvent extends ExternalEvent, InternalId {
  lastUpdatedTime: Date;
  createdTime: Date;
}

export interface EventFilter {
  startTime?: DateRange;
  endTime?: DateRange;
  metadata?: Metadata;
  /**
   * Asset IDs of related equipment that this event relates to.
   */
  assetIds?: CogniteInternalId[];
  /**
   * Filter out events that are not linked to assets in the subtree rooted at these assets.
   */
  assetSubtrees?: CogniteInternalId[];
}

export interface EventFilterRequest extends Cursor, Limit {
  filter?: EventFilter;
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

export interface EventChangeById extends EventPatch, InternalId {}
export interface EventChangeByExternalId extends EventPatch, ExternalId {}

export type EventChange = EventChangeById | EventChangeByExternalId;

export interface EventSearch {
  description?: string;
}

export interface EventSearchRequest extends Limit {
  filter?: EventFilter;
  search?: EventSearch;
}

// Files

/**
 * Name of the file.
 */
export type FileName = string;

/**
 * File type. E.g. text/plain, application/pdf, ...
 */
export type FileMimeType = string;

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
     * Only include files that reference these asset Ids or any  sub-nodes of the specified asset Ids.
     */
    assetSubtrees?: CogniteInternalId[];
    source?: string;
    createdTime?: DateRange;
    lastUpdatedTime?: DateRange;
    uploadedTime?: DateRange;
    externalIdPrefix?: CogniteExternalId;
    uploaded?: boolean;
  };
}

export interface FileRequestFilter extends Cursor, FileFilter {}

export interface ExternalFilesMetadata {
  externalId?: CogniteExternalId;
  name: FileName;
  source?: string;
  mimeType?: FileMimeType;
  metadata?: Metadata;
  assetIds?: CogniteInternalId[];
}

export interface FilesMetadata extends ExternalFilesMetadata {
  id: CogniteInternalId;
  /**
   * Whether or not the actual file is uploaded
   */
  uploaded: boolean;
  uploadedTime: Date;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export type FileContent = ArrayBuffer | Buffer | any;

export interface UploadFileMetadataResponse extends FilesMetadata {
  uploadUrl: string;
}

export interface FilesSearchFilter extends FileFilter {
  search?: {
    name?: FileName;
  };
}

export interface FileLink {
  downloadUrl: string;
}

export interface FileChange {
  update: {
    externalId?: SinglePatchString;
    source?: SinglePatchString;
    metadata?: ObjectPatch;
    assetIds?: ArrayPatchLong;
  };
}

export interface FileChangeUpdateById extends InternalId, FileChange {}
export interface FileChangeUpdateByExternalId extends ExternalId, FileChange {}

export type FileChangeUpdate =
  | FileChangeUpdateById
  | FileChangeUpdateByExternalId;

// raw

export interface ListRawDatabases extends Cursor, Limit {}

/**
 * A NoSQL database to store customer data.
 */
export interface RawDB {
  /**
   * Unique name of a database.
   */
  name: string;
}

export interface ListRawTables extends Cursor, Limit {}

export interface RawDBTable {
  /**
   * Unique name of the table
   */
  name: string;
}

export interface ListRawRows extends Cursor, Limit {
  onlyRowKeys?: boolean;
  columns?: string[];
}

export interface RawDBRowKey {
  /**
   * Unique row key
   */
  key: string;
}

export interface RawDBRow extends RawDBRowKey {
  /**
   * Row data stored as a JSON object.
   */
  columns: { [key: string]: string };
}

// Security categories
export interface ListSecurityCategories extends Cursor, Limit {
  sort?: 'ASC' | 'DESC';
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

// service accounts

/**
 * Unique name of the service account
 */
export type ServiceAccountName = string;

export type Groups = CogniteInternalId[];

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

export interface Model3DListRequest extends Limit {
  /**
   * Filter based on whether or not it has published revisions.
   */
  published?: boolean;
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
}

export type Tuple3<T> = [T, T, T];

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

export interface Revision3DListRequest extends Limit {
  /**
   * Filter based on whether or not it has published revisions.
   */
  published?: boolean;
}

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

type Revision3DStatus = 'Queued' | 'Processing' | 'Done' | 'Failed';

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
   *  The bounding box of the subtree with this sector as the root sector.
   *  Is null if there are no geometries in the subtree.
   */
  boundingBox: BoundingBox3D;
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

export interface AssetMappings3DListFilter extends Cursor, Limit {
  nodeId: CogniteInternalId;
  assetId: CogniteInternalId;
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

export type DeleteAssetMapping3D = AssetMapping3DBase;

export type CreateAssetMapping3D = AssetMapping3DBase;

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

export interface ItemsResponse<T> {
  items: T[];
}

export interface CursorResponse<T> extends ItemsResponse<T> {
  nextCursor: string;
}

export interface ListResponse<T> extends CursorResponse<T> {
  next?: () => Promise<ListResponse<T>>;
}

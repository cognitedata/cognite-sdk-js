// Copyright 2019 Cognite AS
import { RawDBRow, RawDBRowInsert } from './custom';

export enum Aggregate {
  Average = 'average',
  Max = 'max',
  Min = 'min',
  Count = 'count',
  Sum = 'sum',
  Interpolation = 'interpolation',
  StepInterpolation = 'stepInterpolation',
  TotalVariation = 'totalVariation',
  ContinuousVariance = 'continuousVariance',
  DiscreteVariance = 'discreteVariance',
}

export interface AnalyticsAcl {
  analyticsAcl?: CogniteanalyticsAclAcl;
}

export interface ApiKeyObject {
  /**
   * id of the api key
   */
  id: number;
  /**
   * id of the service account
   */
  serviceAccountId: number;
  /**
   * Created time in unix milliseconds
   */
  createdTime: Date;

  status: ApiKeyObjectStatusEnum;
}

export enum ApiKeyObjectStatusEnum {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export interface ApiKeyRequest {
  serviceAccountId: number;
}

export interface ApiKeyResponse {
  items: ApiKeyObject[];
}

export interface ApikeysAcl {
  apikeysAcl?: CogniteapikeysAclAcl;
}
/**
 * Change that will be applied to array object.
 */
export type ArrayPatchLong = ArrayPatchLongAddOrRemove | ArrayPatchLongSet;

export interface ArrayPatchLongAddOrRemove {
  add?: number[];

  remove?: number[];
}

export interface ArrayPatchLongSet {
  set: number[];
}

export interface Asset {
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalId?: string;
  /**
   * Name of asset. Often referred to as tag.
   */
  name: string;
  /**
   * Javascript friendly internal ID given to the object.
   */
  parentId?: number;
  /**
   * Description of asset.
   */
  description?: string;
  /**
   * Custom, application specific metadata. String key -> String value
   */
  metadata?: { [key: string]: string };
  /**
   * The source of this asset
   */
  source?: string;
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  createdTime: Date;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
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

export interface AssetAllOf {
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  createdTime: Date;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
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

export type AssetChange = AssetChangeByExternalId | AssetChangeById;

export interface AssetChangeByExternalId {
  update: AssetPatchUpdate;
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalId: string;
}

export interface AssetChangeByExternalIdAllOf {
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalId: string;
}

export interface AssetChangeById {
  update: AssetPatchUpdate;
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
}

export interface AssetChangeByIdAllOf {
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
}

export interface AssetExternalId {
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalId: string;
}
/**
 * Filter on assets with exact match
 */
export interface AssetFilter {
  filter?: AssetFilterFilter;
  /**
   * <- Limits the maximum number of results to be returned by single request. In case there are more results to the request \'nextCursor\' attribute will be provided as part of response. Request may contain less results than request limit.
   */
  limit?: number;
}

export interface AssetFilterFilter {
  /**
   * Name of asset. Often referred to as tag.
   */
  name?: string;

  parentIds?: number[];
  /**
   * Custom, application specific metadata. String key -> String value
   */
  metadata?: { [key: string]: string };
  /**
   * The source of this asset
   */
  source?: string;

  createdTime?: EpochTimestampRange;

  lastUpdatedTime?: EpochTimestampRange;
  /**
   * filtered assets are root assets or not
   */
  root?: boolean;
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalIdPrefix?: string;
}

export type AssetIdEither = AssetExternalId | AssetInternalId;

export interface AssetInternalId {
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
}

export interface AssetListScope {
  filter?: AssetFilterFilter;
  /**
   * <- Limits the maximum number of results to be returned by single request. In case there are more results to the request \'nextCursor\' attribute will be provided as part of response. Request may contain less results than request limit.
   */
  limit?: number;

  cursor?: string;
}

export interface AssetMapping3D {
  /**
   * The ID of the node.
   */
  nodeId: number;
  /**
   * The ID of the associated asset (Cognite\'s Assets API).
   */
  assetId: number;
  /**
   * A number describing the position of this node in the 3D hierarchy, starting from 0. The tree is traversed in a depth-first order.
   */
  treeIndex: number;
  /**
   * The number of nodes in the subtree of this node (this number included the node itself).
   */
  subtreeSize: number;
}

export interface AssetMapping3DList {
  items: AssetMapping3D[];
}
/**
 * Changes applied to asset
 */
export interface AssetPatch {
  update: AssetPatchUpdate;
}

export interface AssetPatchUpdate {
  externalId?: SinglePatchString;

  name?: SinglePatchRequiredString;

  description?: SinglePatchString;

  metadata?: ObjectPatch;

  source?: SinglePatchString;
}

export interface AssetSearch {
  search?: AssetSearchSearch;
}
/**
 * Search request with filter capabilities
 */
export interface AssetSearchFilter {
  filter?: AssetFilterFilter;
  /**
   * <- Limits the maximum number of results to be returned by single request. In case there are more results to the request \'nextCursor\' attribute will be provided as part of response. Request may contain less results than request limit.
   */
  limit?: number;

  search?: AssetSearchSearch;
}

export interface AssetSearchSearch {
  /**
   * Name of asset. Often referred to as tag.
   */
  name?: string;
  /**
   * Description of asset.
   */
  description?: string;
}

export interface AssetsAcl {
  assetsAcl?: CogniteassetsAclAcl;
}
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
  max: number[];

  min: number[];
}

export type CogniteCapabilityItem =
  | AnalyticsAcl
  | ApikeysAcl
  | AssetsAcl
  | EventsAcl
  | FilesAcl
  | GroupsAcl
  | ProjectsAcl
  | RawAcl
  | SecurityCategoriesAcl
  | SequencesAcl
  | ThreedAcl
  | TimeSeriesAcl
  | UsersAcl;

export interface CogniteanalyticsAclAcl {
  actions: CogniteanalyticsAclAction[];

  scope: CogniteanalyticsAclScope;
}
export enum CogniteanalyticsAclAction {
  READ = 'READ',
  EXECUTE = 'EXECUTE',
  LIST = 'LIST',
}

export interface CogniteanalyticsAclScope {
  all?: object;
}

export interface CogniteapikeysAclAcl {
  actions: CogniteapikeysAclAction[];

  scope: CogniteapikeysAclScope;
}
export enum CogniteapikeysAclAction {
  LIST = 'LIST',
  CREATE = 'CREATE',
  DELETE = 'DELETE',
}

export interface CogniteapikeysAclScope {
  all?: object;
}

export interface CogniteassetsAclAcl {
  actions: CogniteassetsAclAction[];

  scope: CogniteassetsAclScope;
}
export enum CogniteassetsAclAction {
  READ = 'READ',
  WRITE = 'WRITE',
}

export interface CogniteassetsAclIdScope {
  subtreeIds?: string[];
}

export interface CogniteassetsAclScope {
  all?: object;
}

export interface CogniteeventsAclAcl {
  actions: CogniteeventsAclAction[];

  scope: CogniteeventsAclScope;
}
export enum CogniteeventsAclAction {
  READ = 'READ',
  WRITE = 'WRITE',
}

export interface CogniteeventsAclScope {
  all?: object;
}

export interface CognitefilesAclAcl {
  actions: CognitefilesAclAction[];

  scope: CognitefilesAclScope;
}
export enum CognitefilesAclAction {
  READ = 'READ',
  WRITE = 'WRITE',
}

export interface CognitefilesAclScope {
  all?: object;
}

export interface CognitegroupsAclAcl {
  actions: CognitegroupsAclAction[];

  scope: CognitegroupsAclScope;
}
export enum CognitegroupsAclAction {
  LIST = 'LIST',
  READ = 'READ',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface CognitegroupsAclScope {
  all?: object;
}

export interface CogniteprojectsAclAcl {
  actions: CogniteprojectsAclAction[];

  scope: CogniteprojectsAclScope;
}
export enum CogniteprojectsAclAction {
  LIST = 'LIST',
  READ = 'READ',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
}

export interface CogniteprojectsAclScope {
  all?: object;
}

export interface CogniterawAclAcl {
  actions: CogniterawAclAction[];

  scope: CogniterawAclScope;
}
export enum CogniterawAclAction {
  READ = 'READ',
  WRITE = 'WRITE',
  LIST = 'LIST',
}

export interface CogniterawAclScope {
  all?: object;
}

export interface CognitesecuritycategoriesAclAcl {
  actions: CognitesecuritycategoriesAclAction[];

  scope: CognitesecuritycategoriesAclScope;
}
export enum CognitesecuritycategoriesAclAction {
  MEMBEROF = 'MEMBEROF',
  LIST = 'LIST',
  CREATE = 'CREATE',
  DELETE = 'DELETE',
}

export interface CognitesecuritycategoriesAclScope {
  all?: object;
}

export interface CognitesequencesAclAcl {
  actions: CognitesequencesAclAction[];

  scope: CognitesequencesAclScope;
}
export enum CognitesequencesAclAction {
  READ = 'READ',
  WRITE = 'WRITE',
}

export interface CognitesequencesAclScope {
  all?: object;
}

export interface CognitethreedAclAcl {
  actions: CognitethreedAclAction[];

  scope: CognitethreedAclScope;
}
export enum CognitethreedAclAction {
  READ = 'READ',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface CognitethreedAclScope {
  all?: object;
}

export interface CognitetimeseriesAclAcl {
  actions: CognitetimeseriesAclAction[];

  scope: CognitetimeseriesAclScope;
}
export enum CognitetimeseriesAclAction {
  READ = 'READ',
  WRITE = 'WRITE',
}

export interface CognitetimeseriesAclScope {
  all?: object;
}

export interface CogniteusersAclAcl {
  actions: CogniteusersAclAction[];

  scope: CogniteusersAclScope;
}
export enum CogniteusersAclAction {
  LIST = 'LIST',
  CREATE = 'CREATE',
  DELETE = 'DELETE',
}

export interface CogniteusersAclScope {
  all?: object;
}

export interface CreateAssetMapping3D {
  /**
   * The ID of the node.
   */
  nodeId: number;
  /**
   * The ID of the associated asset (Cognite\'s Assets API).
   */
  assetId: number;
}

export interface CreateModel3D {
  /**
   * The name of the model.
   */
  name: string;
}

export interface CreateRevision3D {
  /**
   * True if the revision is marked as published.
   */
  published?: boolean;

  rotation?: number[];

  camera?: RevisionCameraProperties;
  /**
   * The file id to a file uploaded to Cognite\'s Files API. Can only be set on revision creation, and can never be updated. _Only FBX files are supported_.
   */
  fileId: number;
}
/**
 * Cursor for paging through results
 */
export interface Cursor {
  cursor?: string;
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

export interface DataExternalAssetItem {
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalId?: string;
  /**
   * Name of asset. Often referred to as tag.
   */
  name: string;
  /**
   * Javascript friendly internal ID given to the object.
   */
  parentId?: number;
  /**
   * Description of asset.
   */
  description?: string;
  /**
   * Custom, application specific metadata. String key -> String value
   */
  metadata?: { [key: string]: string };
  /**
   * The source of this asset
   */
  source?: string;
  /**
   * External Id provided by client. Should be unique within the project.
   */
  parentExternalId?: string;
}

export interface DataExternalAssetItemAllOf {
  /**
   * External Id provided by client. Should be unique within the project.
   */
  parentExternalId?: string;
}

export interface DataExternalEvent {
  items: ExternalEvent[];
}

export interface DataExternalFileMetadata {
  items?: ExternalFilesMetadata[];
}

export interface DataFileChange {
  items: FileChangeItem[];
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
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
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
  items: number[];
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

export type DatapointOrAggregate =
  | DatapointsGetAggregateDatapoint
  | DatapointsGetDatapoint;

export interface DatapointsDeleteQuery {
  /**
   * List of delete filters
   */
  items: DatapointsDeleteRequest[];
}

export interface DatapointsDeleteRange {
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  inclusiveBegin: number;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  exclusiveEnd?: number;
}
/**
 * Select timeseries and datapoints to delete.
 */
export interface DatapointsDeleteRequest {
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  inclusiveBegin: number;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  exclusiveEnd?: number;
  /**
   * Javascript friendly internal ID given to the object.
   */
  id?: number;
}

export interface DatapointsGetAggregateDatapoint {
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
  /**
   * External id of the timeseries the datapoints belong to.
   */
  externalId?: string;
  /**
   * The list of datapoints
   */
  datapoints: GetAggregateDatapoint[];
}

export interface DatapointsGetAggregateDatapointAllOf {
  /**
   * The list of datapoints
   */
  datapoints: GetAggregateDatapoint[];
}

export type DatapointsGetDatapoint =
  | DatapointsGetDoubleDatapoint
  | DatapointsGetStringDatapoint;

export interface DatapointsGetDoubleDatapoint {
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
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

export interface DatapointsGetDoubleDatapointAllOf {
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
   * Javascript friendly internal ID given to the object.
   */
  id: number;
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

export interface DatapointsGetStringDatapointAllOf {
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
   * Javascript friendly internal ID given to the object.
   */
  id: number;
  /**
   * External id of the timeseries the datapoints belong to.
   */
  externalId?: string;
}

export interface DatapointsMultiQuery {
  items: DatapointsQuery[];
  /**
   * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: \'2d-ago\' will get everything that is up to 2 days old. Can also send time in ms since epoch. Note that when using aggregates, the start time will be rounded down to a whole granularity unit (in UTC timezone). For granularity 2d it will be rounded to 0:00 AM on the same day, for 3h it will be rounded to the start of the hour, etc.
   */
  start?: string;
  /**
   * Get datapoints up to this time. Same format as for start. Note that when using aggregates, the end will be rounded up such that the last aggregate represents a full aggregation interval containing the original end, where the interval is the granularity unit times the granularity multiplier. For granularity 2d, the aggregation interval is 2 days, if end was originally 3 days after the start, it will be rounded to 4 days after the start.
   */
  end?: string;
  /**
   * Return up to this number of datapoints.
   */
  limit?: number;
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
/**
 * List of responses. Order matches the requests order.
 */
export interface DatapointsOrAggregatesResponse {
  items: DatapointOrAggregate[];
}

export interface DatapointsPostDatapoint {
  /**
   * The list of datapoints. Total limit per request is 100000 datapoints.
   */
  datapoints: PostDatapoint[];
  /**
   * Javascript friendly internal ID given to the object.
   */
  id?: number;
}
/**
 * Parameters describing a query for datapoints.
 */
export interface DatapointsQuery {
  /**
   * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: \'2d-ago\' will get everything that is up to 2 days old. Can also send time in ms since epoch. Note that when using aggregates, the start time will be rounded down to a whole granularity unit (in UTC timezone). For granularity 2d it will be rounded to 0:00 AM on the same day, for 3h it will be rounded to the start of the hour, etc.
   */
  start?: string;
  /**
   * Get datapoints up to this time. Same format as for start. Note that when using aggregates, the end will be rounded up such that the last aggregate represents a full aggregation interval containing the original end, where the interval is the granularity unit times the granularity multiplier. For granularity 2d, the aggregation interval is 2 days, if end was originally 3 days after the start, it will be rounded to 4 days after the start.
   */
  end?: string;
  /**
   * Return up to this number of datapoints.
   */
  limit?: number;
  /**
   * The aggregates to be returned.  Use default if null. An empty string must be sent to get raw data if the default is a set of aggregates.
   */
  aggregates?: Aggregate[];
  /**
   * The granularity size and granularity of the aggregates.
   */
  granularity?: string;
  /**
   * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
   */
  includeOutsidePoints?: boolean;
  /**
   * Javascript friendly internal ID given to the object.
   */
  id?: number;
}

export interface DatapointsQueryProperties {
  /**
   * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: \'2d-ago\' will get everything that is up to 2 days old. Can also send time in ms since epoch. Note that when using aggregates, the start time will be rounded down to a whole granularity unit (in UTC timezone). For granularity 2d it will be rounded to 0:00 AM on the same day, for 3h it will be rounded to the start of the hour, etc.
   */
  start?: string;
  /**
   * Get datapoints up to this time. Same format as for start. Note that when using aggregates, the end will be rounded up such that the last aggregate represents a full aggregation interval containing the original end, where the interval is the granularity unit times the granularity multiplier. For granularity 2d, the aggregation interval is 2 days, if end was originally 3 days after the start, it will be rounded to 4 days after the start.
   */
  end?: string;
  /**
   * Return up to this number of datapoints.
   */
  limit?: number;
  /**
   * The aggregates to be returned.  Use default if null. An empty string must be sent to get raw data if the default is a set of aggregates.
   */
  aggregates?: Aggregate[];
  /**
   * The granularity size and granularity of the aggregates.
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

export interface DeleteAssetMapping3D {
  /**
   * The ID of the node.
   */
  nodeId: number;
  /**
   * The ID of the associated asset (Cognite\'s Assets API).
   */
  assetId: number;
}

export interface DetailedErrorResponse {
  error?: DetailedErrorResponseError;
}
/**
 * Cognite API error
 */
export interface DetailedErrorResponseError {
  /**
   * HTTP status code
   */
  code: number;
  /**
   * Error message
   */
  message: string;
  /**
   * List of lookup objects that have not matched any results.
   */
  missing?: { [key: string]: string }[];
  /**
   * List of objects that violate the uniqueness constraint.
   */
  duplicated?: { [key: string]: string }[];
}

export interface DuplicatedIdsInRequestResponse {
  error: DuplicatedIdsInRequestResponseError;
}
/**
 * Error details
 */
export interface DuplicatedIdsInRequestResponseError {
  /**
   * HTTP status code
   */
  code: number;
  /**
   * Error message
   */
  message: string;
  /**
   * Items which are duplicated
   */
  duplicated: InternalIdOrExternalId[];
}

export type EitherId = ExternalId | InternalId;

/**
 * Range between two timestamps
 */
export interface EpochTimestampRange {
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  max?: number;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  min?: number;
}

export type ErrorMissingItem =
  | AssetChangeByExternalIdAllOf
  | AssetChangeByIdAllOf;

export interface Event {
  /**
   * External Id provided by client. Should be unique within the project
   */
  externalId?: string;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  startTime?: number;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  endTime?: number;
  /**
   * Type of the event, e.g \'failure\'.
   */
  type?: string;
  /**
   * Subtype of the event, e.g \'electrical\'.
   */
  subtype?: string;
  /**
   * Textual description of the event.
   */
  description?: string;
  /**
   * Custom, application specific metadata. String key -> String value
   */
  metadata?: { [key: string]: string };
  /**
   * Asset IDs of related equipment that this event relates to.
   */
  assetIds?: number[];
  /**
   * The source of this event.
   */
  source?: string;
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  lastUpdatedTime: Date;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  createdTime: Date;
}

export interface EventAllOf {
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  lastUpdatedTime: Date;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  createdTime: Date;
}

export type EventChange = EventChangeByExternalId | EventChangeById;

export interface EventChangeByExternalId {
  update: EventPatchUpdate;
  /**
   * External Id provided by client. Should be unique within the project
   */
  externalId: string;
}

export interface EventChangeByExternalIdAllOf {
  /**
   * External Id provided by client. Should be unique within the project
   */
  externalId: string;
}

export interface EventChangeById {
  update: EventPatchUpdate;
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
}

export interface EventChangeByIdAllOf {
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
}
/**
 * Filter on events filter with exact match
 */
export interface EventFilter {
  startTime?: EpochTimestampRange;

  endTime?: EpochTimestampRange;
  /**
   * Custom, application specific metadata. String key -> String value
   */
  metadata?: { [key: string]: string };
  /**
   * Asset IDs of related equipment that this event relates to.
   */
  assetIds?: number[];
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
  /**
   * External Id provided by client. Should be unique within the project
   */
  externalIdPrefix?: string;
}
/**
 * Filter request for events. Filters exact field matching or timestamp ranges inclusive min and max.
 */
export interface EventFilterRequest {
  filter?: EventFilter;
  /**
   * <- Limits the maximum number of results to be returned by single request. In case there are more results to the request \'nextCursor\' attribute will be provided as part of response. Request may contain less results than request limit.
   */
  limit?: number;

  cursor?: string;
}

export interface EventFilterRequestAllOf {
  filter?: EventFilter;
  /**
   * <- Limits the maximum number of results to be returned by single request. In case there are more results to the request \'nextCursor\' attribute will be provided as part of response. Request may contain less results than request limit.
   */
  limit?: number;
}
/**
 * Changes will be applied to event.
 */
export interface EventPatch {
  update: EventPatchUpdate;
}

export interface EventPatchUpdate {
  externalId?: SinglePatchString;

  startTime?: SinglePatchLong;

  endTime?: SinglePatchLong;

  description?: SinglePatchString;

  metadata?: ObjectPatch;

  assetIds?: ArrayPatchLong;

  source?: SinglePatchString;

  type?: SinglePatchString;

  subtype?: SinglePatchString;
}

export interface EventResponse {
  items: Event[];
}

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
   * <- Limits the maximum number of results to be returned by single request. In case there are more results to the request \'nextCursor\' attribute will be provided as part of response. Request may contain less results than request limit.
   */
  limit?: number;
}

export interface EventWithCursorResponse {
  items: Event[];
  /**
   * Cursor to get the next page of results (if available).
   */
  nextCursor?: string;
}

export interface EventsAcl {
  eventsAcl?: CogniteeventsAclAcl;
}
/**
 * Representation of a physical asset, e.g plant or piece of equipment
 */
export interface ExternalAsset {
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalId?: string;
  /**
   * Name of asset. Often referred to as tag.
   */
  name: string;
  /**
   * Javascript friendly internal ID given to the object.
   */
  parentId?: number;
  /**
   * Description of asset.
   */
  description?: string;
  /**
   * Custom, application specific metadata. String key -> String value
   */
  metadata?: { [key: string]: string };
  /**
   * The source of this asset
   */
  source?: string;
}
/**
 * An event represents something that happened at a given interval in time, e.g a failure, a work order etc.
 */
export interface ExternalEvent {
  /**
   * External Id provided by client. Should be unique within the project
   */
  externalId?: string;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  startTime?: number;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  endTime?: number;
  /**
   * Type of the event, e.g \'failure\'.
   */
  type?: string;
  /**
   * Subtype of the event, e.g \'electrical\'.
   */
  subtype?: string;
  /**
   * Textual description of the event.
   */
  description?: string;
  /**
   * Custom, application specific metadata. String key -> String value
   */
  metadata?: { [key: string]: string };
  /**
   * Asset IDs of related equipment that this event relates to.
   */
  assetIds?: number[];
  /**
   * The source of this event.
   */
  source?: string;
}

export interface ExternalFilesMetadata {
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalId?: string;
  /**
   * Name of the file.
   */
  name: string;
  /**
   * The source of the file.
   */
  source?: string;
  /**
   * File type. E.g. text/plain, application/pdf, ..
   */
  mimeType?: string;
  /**
   * Custom, application specific metadata. String key -> String value
   */
  metadata?: { [key: string]: string };

  assetIds?: number[];
}

export interface ExternalId {
  /**
   * External Id provided by client. Should be unique within the project
   */
  externalId: string;
}

export interface ExternalIdsAlreadyExistResponse {
  error: ExternalIdsAlreadyExistResponseError;
}
/**
 * Error details
 */
export interface ExternalIdsAlreadyExistResponseError {
  /**
   * HTTP status code
   */
  code: number;
  /**
   * Error message
   */
  message: string;
  /**
   * Items which are duplicated
   */
  duplicated: ExternalIdsAlreadyExistResponseErrorDuplicated[];
}
/**
 * ExternalIds which already exist
 */
export interface ExternalIdsAlreadyExistResponseErrorDuplicated {
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalId: string;
}
/**
 * Changes will be applied to file.
 */
export interface FileChange {
  update: FileChangeUpdate;
}

export type FileChangeItem =
  | FileChangeUpdateByExternalId
  | FileChangeUpdateById;

/**
 * Object change
 */
export type FileChangeMetadata =
  | FileChangeMetadataOneOf
  | FileChangeMetadataOneOf1;

export interface FileChangeMetadataOneOf {
  /**
   * Set the key-value pairs. All existing key-value pairs will be removed.
   */
  set: { [key: string]: string };
}

export interface FileChangeMetadataOneOf1 {
  /**
   * Add the key-value pairs. Values for existing keys will be overwritten.
   */
  add?: { [key: string]: string };
  /**
   * Remove the key-value pairs with given keys.
   */
  remove?: string[];
}

export interface FileChangeUpdate {
  externalId?: SinglePatchString;

  source?: SinglePatchString;

  metadata?: FileChangeMetadata;

  assetIds?: ArrayPatchLong;
}

export interface FileChangeUpdateByExternalId {
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalId: string;

  update: FileChangeUpdate;
}

export interface FileChangeUpdateById {
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;

  update: FileChangeUpdate;
}

export interface FileExternalId {
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalId?: string;
}
/**
 * Filter on files with exact match
 */
export interface FileFilter {
  filter?: FileFilterFilter;
  /**
   * <- Maximum number of items that the client want to get back.
   */
  limit?: number;
}

export interface FileFilterFilter {
  /**
   * Name of the file.
   */
  name?: string;

  mimeType?: MimeType;
  /**
   * Custom, application specific metadata. String key -> String value
   */
  metadata?: { [key: string]: string };
  /**
   * Only include files that reference these specific asset IDs.
   */
  assetIds?: number[];
  /**
   * The source of this event.
   */
  source?: string;

  createdTime?: EpochTimestampRange;

  lastUpdatedTime?: EpochTimestampRange;

  uploadedTime?: EpochTimestampRange;
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalIdPrefix?: string;
  /**
   * Whether or not the actual file is uploaded. This field is returned only by the API, it has no effect in a post body.
   */
  uploaded?: boolean;
}

export type FileIdEither = FileExternalId | FileInternalId;

export interface FileInternalId {
  /**
   * Javascript friendly internal ID given to the object.
   */
  id?: number;
}

export interface FileLink {
  downloadUrl?: string;
}

export interface FileLinkIds {
  items?: FileIdEither[];
}

export interface FilesAcl {
  filesAcl?: CognitefilesAclAcl;
}

export interface FilesMetadata {
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalId?: string;
  /**
   * Name of the file.
   */
  name: string;
  /**
   * The source of the file.
   */
  source?: string;
  /**
   * File type. E.g. text/plain, application/pdf, ..
   */
  mimeType?: string;
  /**
   * Custom, application specific metadata. String key -> String value
   */
  metadata?: { [key: string]: string };

  assetIds?: number[];
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
  /**
   * Whether or not the actual file is uploaded.  This field is returned only by the API, it has no effect in a post body.
   */
  uploaded: boolean;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  uploadedTime?: Date;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  createdTime: Date;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  lastUpdatedTime: Date;
}

export interface FilesMetadataAllOf {
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
  /**
   * Whether or not the actual file is uploaded.  This field is returned only by the API, it has no effect in a post body.
   */
  uploaded: boolean;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  uploadedTime?: Date;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  createdTime: Date;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  lastUpdatedTime: Date;
}
/**
 * Filter on files with exact match
 */
export interface FilesSearchFilter {
  filter?: FileFilterFilter;
  /**
   * <- Maximum number of items that the client want to get back.
   */
  limit?: number;

  search?: FilesSearchFilterAllOfSearch;
}

export interface FilesSearchFilterAllOf {
  search?: FilesSearchFilterAllOfSearch;
}

export interface FilesSearchFilterAllOfSearch {
  /**
   * Name of the file.
   */
  name?: string;
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
   * Filter out timeseries that do not match these metadata fields and values (case-sensitive). Format is {\"key1\":\"value1\",\"key2\":\"value2\"}.
   */
  metadata?: object;
  /**
   * Filter out time series that are not linked to any of these assets.
   */
  assetIds?: number[];

  createdTime?: EpochTimestampRange;

  lastUpdatedTime?: EpochTimestampRange;
}

export interface GetAggregateDatapoint {
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  timestamp: Date;
  /**
   * The integral average value in the aggregate period
   */
  average?: number;
  /**
   * The maximum value in the aggregate period
   */
  max?: number;
  /**
   * The minimum value in the aggregate period
   */
  min?: number;
  /**
   * The number of datapoints in the aggregate period
   */
  count?: number;
  /**
   * The sum of the datapoints in the aggregate period
   */
  sum?: number;
  /**
   * The interpolated value of the series in the beginning of the aggregate
   */
  interpolation?: number;
  /**
   * The last value before or at the beginning of the aggregate.
   */
  stepInterpolation?: number;
  /**
   * The variance of the interpolated underlying function.
   */
  continuousVariance?: number;
  /**
   * The variance of the datapoint values.
   */
  discreteVariance?: number;
  /**
   * The total variation of the interpolated underlying function.
   */
  totalVariation?: number;
}

export interface GetAggregateDatapointAllOf {
  /**
   * The integral average value in the aggregate period
   */
  average?: number;
  /**
   * The maximum value in the aggregate period
   */
  max?: number;
  /**
   * The minimum value in the aggregate period
   */
  min?: number;
  /**
   * The number of datapoints in the aggregate period
   */
  count?: number;
  /**
   * The sum of the datapoints in the aggregate period
   */
  sum?: number;
  /**
   * The interpolated value of the series in the beginning of the aggregate
   */
  interpolation?: number;
  /**
   * The last value before or at the beginning of the aggregate.
   */
  stepInterpolation?: number;
  /**
   * The variance of the interpolated underlying function.
   */
  continuousVariance?: number;
  /**
   * The variance of the datapoint values.
   */
  discreteVariance?: number;
  /**
   * The total variation of the interpolated underlying function.
   */
  totalVariation?: number;
}

export interface GetDatapointMetadata {
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  timestamp: Date;
}

export interface GetDoubleDatapoint {
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  timestamp: Date;
  /**
   * The data value.
   */
  value: number;
}

export interface GetDoubleDatapointAllOf {
  /**
   * The data value.
   */
  value: number;
}

export interface GetStringDatapoint {
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  timestamp: Date;
  /**
   * The data value.
   */
  value: string;
}

export interface GetStringDatapointAllOf {
  /**
   * The data value.
   */
  value: string;
}

export interface GetTimeSeriesMetadataDTO {
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
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
  /**
   * Additional metadata. String key -> String value.
   */
  metadata?: object;
  /**
   * The physical unit of the time series.
   */
  unit?: string;
  /**
   * Javascript friendly internal ID given to the object.
   */
  assetId?: number;
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
  securityCategories?: number[];
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  createdTime: Date;
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  lastUpdatedTime: Date;
}

export interface Group {
  /**
   * Name of the group
   */
  name: string;
  /**
   * ID of the group in the source. If this is the same ID as a group in the IDP, a user in that group will implicitly be a part of this group as well.
   */
  sourceId?: string;

  capabilities?: CogniteCapabilityItem[];

  id: number;

  isDeleted: boolean;

  deletedTime?: Date;
}
/**
 * A specification for creating a new group
 */
export interface GroupSpec {
  /**
   * Name of the group
   */
  name: string;
  /**
   * ID of the group in the source. If this is the same ID as a group in the IDP, a user in that group will implicitly be a part of this group as well.
   */
  sourceId?: string;

  capabilities?: CogniteCapabilityItem[];
}

export interface GroupsAcl {
  groupsAcl?: CognitegroupsAclAcl;
}
/**
 * An ID JWT token
 */
export interface IdToken {
  /**
   * The subject of the token
   */
  sub: string;
  /**
   * Which CDF project the subject is in
   */
  projectName: string;
  /**
   * Which groups (by id) the subject is in
   */
  groups: number[];
  /**
   * The signing key id
   */
  signingKey: string;
  /**
   * The expiration time of the token in seconds (unix)
   */
  exp: number;
}

export interface InlineObject {
  items: CreateModel3D[];
}

export interface InlineObject1 {
  items: UpdateModel3D[];
}

export interface InlineObject2 {
  items: CreateRevision3D[];
}

export interface InlineObject3 {
  items: UpdateRevision3D[];
}

export interface InlineObject4 {
  items: CreateAssetMapping3D[];
}

export interface InlineObject5 {
  items: DeleteAssetMapping3D[];
}

export interface InlineObject6 {
  items: number[];
}

export interface InlineObject7 {
  items: ServiceAccountInput[];
}

export interface InlineResponse200 {
  items?: FileLink[];
}

export interface InlineResponse2001 {
  data: URLResponse;
}

export interface InlineResponse2002 {
  /**
   * List of service accounts
   */
  items: InlineResponse2002Items[];
}

export interface InlineResponse2002Items {
  /**
   * Unique name of the service account
   */
  name: string;
  /**
   * List of group ids
   */
  groups: number[];

  id: number;
  /**
   * If this service account has been logically deleted
   */
  isDeleted: boolean;
  /**
   * Time of deletion
   */
  deletedTime?: Date;
}

export interface InlineResponse2003 {
  /**
   * The display name of the project.
   */
  name: string;
  /**
   * The url name of the project. This is used as part of API calls. It should only contain letters, digits and hyphens, as long as the hyphens are not at the start or end.
   */
  urlName: string;
  /**
   * A default group for all project users. Can be used to establish default capabilities.WARNING: this group may be logically deleted
   */
  defaultGroupId?: number;

  authentication?: OutputProjectAuthentication;
}

export interface InlineResponse2004 {
  /**
   * List of service accounts
   */
  items: ServiceAccount[];
}

export interface InlineResponse400 {
  error: Error;
}
/**
 * Some required fields are missing
 */
export interface InlineResponse4001 {
  /**
   * HTTP status code
   */
  code: number;
  /**
   * Error message
   */
  message: string;
  /**
   * Additional data
   */
  extra?: object;
  /**
   * Fields that are missing.
   */
  missingFields: object[];
}
/**
 * Data about how to authenticate and authorize users
 */
export interface InputProjectAuthentication {
  azureADConfiguration?: AzureADConfigurationDTO;
  /**
   * List of valid domains. If left empty, any user registered with the OAuth2 provider will get access.
   */
  validDomains?: string[];

  oAuth2Configuration?: OAuth2ConfigurationDTO;
}
/**
 * Range between two integers
 */
export interface IntegerRange {
  max?: number;

  min?: number;
}

export interface InternalId {
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
}

export type InternalIdOrExternalId =
  | AssetChangeByExternalIdAllOf
  | AssetChangeByIdAllOf;

/**
 * Describes latest query
 */
export interface LatestDataBeforeRequest {
  /**
   * Get first datapoint before this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: \'2d-ago\' will get everything that is up to 2 days old. Can also send time in ms since epoch.
   */
  before?: string;
  /**
   * Javascript friendly internal ID given to the object.
   */
  id?: number;
}

export interface LatestDataPropertyFilter {
  /**
   * Get first datapoint before this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: \'2d-ago\' will get everything that is up to 2 days old. Can also send time in ms since epoch.
   */
  before?: string;
}
/**
 * Represents the current authentication status of the request
 */
export interface LoginStatusDTO {
  /**
   * The user principal, e.g john.doe@corporation.com.
   */
  user: string;
  /**
   * Whether the user is logged in or not.
   */
  loggedIn: boolean;
  /**
   * Name of project user belongs to
   */
  project: string;
  /**
   * Internal project id of the project
   */
  projectId: number;
  /**
   * ID of the api key making the request. This is optional and only present if an api key is used as authentication.
   */
  apiKeyId?: number;
}

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

export interface MissingFieldError {
  error: MissingFieldErrorError;
}

export interface MissingFieldErrorError {
  /**
   * HTTP status code
   */
  code: number;
  /**
   * Error message
   */
  message: string;
  /**
   * Fields that are missing.
   */
  missingFields: object[];
}

export interface Model3D {
  /**
   * The name of the model.
   */
  name: string;
  /**
   * The ID of the model.
   */
  id: number;
  /**
   * The creation time of the resource, in milliseconds since January 1, 1970 at 00:00 UTC.
   */
  createdTime: Date;
}

export interface Model3DList {
  items: Model3D[];
}
/**
 * Cognite API error
 */
export interface ModelError {
  /**
   * HTTP status code
   */
  code: number;
  /**
   * Error message
   */
  message: string;
  /**
   * List of lookup objects that have not matched any results.
   */
  missing?: { [key: string]: string }[];
  /**
   * List of objects that violate the uniqueness constraint.
   */
  duplicated?: { [key: string]: string }[];
}

export interface NewApiKeyResponse extends ApiKeyObject {
  /**
   * The api key to be used against the API
   */
  value: string;
}

export interface NewApiKeyResponseDTO {
  /**
   * Internal id for the api key
   */
  id: number;
  /**
   * id of the service account
   */
  serviceAccountId: number;
  /**
   * Time of creating in unix ms
   */
  createdTime: Date;
  /**
   * The status of the api key.
   */
  status: ApiKeyObjectStatusEnum;
  /**
   * The api key to be used against the API
   */
  value: string;
}

export interface NextCursorData {
  /**
   * Cursor to get the next page of results (if available).
   */
  nextCursor?: string;
}

export interface Node3D {
  /**
   * The ID of the node.
   */
  id: number;
  /**
   * The index of the node in the 3D model hierarchy, starting from 0. The tree is traversed in a depth-first order.
   */
  treeIndex: number;
  /**
   * The parent of the node, null if it is the root node.
   */
  parentId: number | null;
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

  boundingBox: BoundingBox3D;
}

export interface Node3DList {
  items: Node3D[];
}

export interface NotFoundResponse {
  error: NotFoundResponseError;
}
/**
 * Error details
 */
export interface NotFoundResponseError {
  /**
   * HTTP status code
   */
  code: number;
  /**
   * Error message
   */
  message: string;
  /**
   * Items which are not found
   */
  missing: ErrorMissingItem[];
}
/**
 * Change that will be applied to assetId.
 */
export type NullableSinglePatchLong =
  | NullableSinglePatchLongOneOf
  | NullableSinglePatchLongOneOf1;

export interface NullableSinglePatchLongOneOf {
  set: number;
}

export interface NullableSinglePatchLongOneOf1 {
  setNull: NullableSinglePatchLongOneOf1SetNullEnum;
}

export enum NullableSinglePatchLongOneOf1SetNullEnum {
  True = 'true',
}

/**
 * Change that will be applied to description.
 */
export type NullableSinglePatchString =
  | NullableSinglePatchLongOneOf1
  | NullableSinglePatchStringOneOf;

export interface NullableSinglePatchStringOneOf {
  set: string;
}
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
export type ObjectPatch = ObjectPatchAddRemove | ObjectPatchSet;

export interface ObjectPatchAddRemove {
  /**
   * Add the key-value pairs. Values for existing keys will be overwritten.
   */
  add?: { [key: string]: string };
  /**
   * Remove the key-value pairs with given keys.
   */
  remove?: string[];
}

export interface ObjectPatchSet {
  /**
   * Set the key-value pairs. All existing key-value pairs will be removed.
   */
  set: { [key: string]: string };
}
/**
 * Data about how to authenticate and authorize users. The authentication configuration is hidden.
 */
export interface OutputProjectAuthentication {
  /**
   * List of valid domains. If left empty, any user registered with the OAuth2 provider will get access.
   */
  validDomains?: string[];
}

export type PostDatapoint = PostDatapointOneOf | PostDatapointOneOf1;

export interface PostDatapointOneOf {
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  timestamp: Date;
  /**
   * The numerical data value of a numerical metric
   */
  value: number;
}

export interface PostDatapointOneOf1 {
  /**
   * It is the number of seconds that have elapsed since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
   */
  timestamp: Date;
  /**
   * The string data value of a string metric
   */
  value: string;
}

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
  /**
   * Additional metadata. String key -> String value.
   */
  metadata?: object;
  /**
   * The physical unit of the time series.
   */
  unit?: string;
  /**
   * Javascript friendly internal ID given to the object.
   */
  assetId?: number;
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
  securityCategories?: number[];
}
/**
 * Project object
 */
export interface ProjectObject {
  /**
   * The display name of the project.
   */
  name?: string;
  /**
   * A default group for all project users. Can be used to establish default capabilities.WARNING: this group may be logically deleted
   */
  defaultGroupId?: number;

  authentication?: InputProjectAuthentication;
}

export interface ProjectsAcl {
  projectsAcl?: CogniteprojectsAclAcl;
}

export interface RawAcl {
  rawAcl?: CogniterawAclAcl;
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
  rows?: object[][];
}

export interface RemoveField {
  setNull: boolean;
}

export interface RevealNode3D {
  /**
   * The ID of the node.
   */
  id: number;
  /**
   * The index of the node in the 3D model hierarchy, starting from 0. The tree is traversed in a depth-first order.
   */
  treeIndex: number;
  /**
   * The parent of the node, null if it is the root node.
   */
  parentId: number | null;
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

  boundingBox: BoundingBox3D;
  /**
   * The sector the node is contained in.
   */
  sectorId?: number;
}

export interface RevealNode3DAllOf {
  /**
   * The sector the node is contained in.
   */
  sectorId?: number;
}

export interface RevealNode3DList {
  items: RevealNode3D[];
}

export interface RevealRevision3D {
  /**
   * The ID of the revision.
   */
  id: number;
  /**
   * The file id.
   */
  fileId: number;
  /**
   * True if the revision is marked as published.
   */
  published: boolean;

  rotation?: number[];

  camera?: RevisionCameraProperties;
  /**
   * The status of the revision.
   */
  status: RevealRevision3DStatusEnum;
  /**
   * The threed file ID of a thumbnail for the revision. Use /3d/files/{id} to retrieve the file.
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
   * The creation time of the resource, in milliseconds since January 1, 1970 at 00:00 UTC.
   */
  createdTime: Date;

  sceneThreedFiles: Versioned3DFile[];
}

export enum RevealRevision3DStatusEnum {
  Queued = 'Queued',
  Processing = 'Processing',
  Done = 'Done',
  Failed = 'Failed',
}

export interface RevealRevision3DAllOf {
  sceneThreedFiles: Versioned3DFile[];
}

export interface RevealSector3D {
  /**
   * The id of the sector.
   */
  id: number;
  /**
   * The parent of the sector, null if it is the root sector.
   */
  parentId: number | null;
  /**
   * String representing the path to the sector: 0/2/6/ etc.
   */
  path: string;
  /**
   * The depth of the sector in the sector tree, starting from 0 at the root sector.
   */
  depth: number;

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
   */
  id: number;
  /**
   * The file id.
   */
  fileId: number;
  /**
   * True if the revision is marked as published.
   */
  published: boolean;

  rotation?: number[];

  camera?: RevisionCameraProperties;
  /**
   * The status of the revision.
   */
  status: Revision3DStatusEnum;
  /**
   * The threed file ID of a thumbnail for the revision. Use /3d/files/{id} to retrieve the file.
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
   * The creation time of the resource, in milliseconds since January 1, 1970 at 00:00 UTC.
   */
  createdTime: Date;
}

export enum Revision3DStatusEnum {
  Queued = 'Queued',
  Processing = 'Processing',
  Done = 'Done',
  Failed = 'Failed',
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
  target?: number[];
  /**
   * Initial camera position.
   */
  position?: number[];
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
   * Search on name and description using wildcard search on each of the words (separated by spaces). Retrieves results where at least one word must match. Example: \'*some* *other*\'
   */
  query?: string;
}

export interface SecurityCategoriesAcl {
  securityCategoriesAcl?: CognitesecuritycategoriesAclAcl;
}

export interface SecurityCategoryDTO {
  /**
   * Name of the security category
   */
  name: string;
  /**
   * Id of the security category
   */
  id: number;
}

export interface SecurityCategoryResponse {
  items?: SecurityCategoryDTO[];
}

export interface SecurityCategorySpecDTO {
  /**
   * Name of the security category
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

export interface SequencesAcl {
  sequencesAcl?: CognitesequencesAclAcl;
}

export interface ServiceAccount {
  /**
   * Unique name of the service account
   */
  name: string;
  /**
   * List of group ids
   */
  groups: number[];

  id: number;
  /**
   * If this service account has been logically deleted
   */
  isDeleted: boolean;
  /**
   * Time of deletion
   */
  deletedTime?: Date;
}

export interface ServiceAccountInput {
  /**
   * Unique name of the service account
   */
  name: string;
  /**
   * List of group ids
   */
  groups?: number[];
}

export interface SetLongField {
  set?: number;
}

export interface SetModelNameField {
  set?: string;
}

export interface SetObjectField {
  set?: object;
}

export interface SetRevisionCameraProperties {
  set?: RevisionCameraProperties;
}

export interface SetRevisionRotation {
  set?: number[];
}

export interface SetStringField {
  set: string;
}
/**
 * Object change
 */
export type SinglePatch = RemoveField | SetObjectField;

export type SinglePatchLong = RemoveField | SetLongField;

/**
 * Non removable string change.
 */
export interface SinglePatchRequiredString {
  set: string;
}
/**
 * Removable string change.
 */
export type SinglePatchString = RemoveField | SetStringField;

export interface SingleTokenStatusDTOResponse {
  data: TokenStatusDTO;
}

export interface ThreedAcl {
  threedAcl?: CognitethreedAclAcl;
}

export interface TimeSeriesAcl {
  timeSeriesAcl?: CognitetimeseriesAclAcl;
}

export interface TimeSeriesCreateRequest {
  items: PostTimeSeriesMetadataDTO[];
}

export interface TimeSeriesLookupById {
  /**
   * List of ID objects
   */
  items: InternalIdOrExternalId[];
}
/**
 * Changes will be applied to timeseries.
 */
export interface TimeSeriesPatch {
  update: TimeSeriesPatchUpdate;
}

export interface TimeSeriesPatchUpdate {
  externalId?: NullableSinglePatchString;

  name?: NullableSinglePatchString;

  metadata?: ObjectPatch;

  unit?: NullableSinglePatchString;

  assetId?: NullableSinglePatchLong;

  description?: NullableSinglePatchString;

  securityCategories?: ArrayPatchLong;
}

export interface TimeSeriesSearchDTO {
  filter?: Filter;

  search?: Search;
  /**
   * Return up to this many results.
   */
  limit?: number;
}

export type TimeSeriesUpdate =
  | TimeSeriesUpdateByExternalId
  | TimeSeriesUpdateById;

export interface TimeSeriesUpdateByExternalId {
  update: TimeSeriesPatchUpdate;
  /**
   * External Id provided by client. Should be unique within the project.
   */
  externalId: string;
}

export interface TimeSeriesUpdateById {
  update: TimeSeriesPatchUpdate;
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;
}

export interface TimeSeriesUpdateRequest {
  items: TimeSeriesUpdate[];
}

export interface TokenStatusDTO {
  /**
   * The token that was sent for validation
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
/**
 * Object containing the log out URL
 */
export interface URLResponse {
  /**
   * The url to send the user to in order to log out
   */
  url: string;
}

export interface UnrealRevision3D {
  /**
   * The ID of the revision.
   */
  id: number;
  /**
   * The file id.
   */
  fileId: number;
  /**
   * True if the revision is marked as published.
   */
  published: boolean;

  rotation?: number[];

  camera?: RevisionCameraProperties;
  /**
   * The status of the revision.
   */
  status: UnrealRevision3DStatusEnum;
  /**
   * The threed file ID of a thumbnail for the revision. Use /3d/files/{id} to retrieve the file.
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
   * The creation time of the resource, in milliseconds since January 1, 1970 at 00:00 UTC.
   */
  createdTime: Date;

  sceneThreedFiles: Versioned3DFile[];
}

export enum UnrealRevision3DStatusEnum {
  Queued = 'Queued',
  Processing = 'Processing',
  Done = 'Done',
  Failed = 'Failed',
}

export interface UpdateModel3D {
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;

  update?: UpdateModel3DAllOfUpdate;
}

export interface UpdateModel3DAllOf {
  update?: UpdateModel3DAllOfUpdate;
}

export interface UpdateModel3DAllOfUpdate {
  name?: SetModelNameField;
}

export interface UpdateRevision3D {
  /**
   * Javascript friendly internal ID given to the object.
   */
  id: number;

  update?: UpdateRevision3DAllOfUpdate;
}

export interface UpdateRevision3DAllOf {
  update?: UpdateRevision3DAllOfUpdate;
}

export interface UpdateRevision3DAllOfUpdate {
  published?: UpdateRevision3DAllOfUpdatePublished;

  rotation?: SetRevisionRotation;

  camera?: SetRevisionCameraProperties;
}

export interface UpdateRevision3DAllOfUpdatePublished {
  /**
   * True if the revision is marked as published.
   */
  set?: boolean;
}
/**
 * Request body for the updateModelRevisionThumbnail endpoint.
 */
export interface UpdateRevision3DThumbnail {
  /**
   * File ID of thumbnail file in Files API. _Only JPEG and PNG files are supported_.
   */
  fileId: number;
}

export interface UsersAcl {
  usersAcl?: CogniteusersAclAcl;
}
/**
 * The file ID of the data file for this resource, with multiple versions supported. Use /3d/files/{id} to retrieve the file.
 */
export interface Versioned3DFile {
  /**
   * Version of the file format.
   */
  version: number;
  /**
   * File ID. Use /3d/files/{id} to retrieve the file.
   */
  fileId: number;
}

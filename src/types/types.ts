// Copyright 2019 Cognite AS

export type CogniteInternalId = number;

/**
 * External Id provided by client. Should be unique within the project.
 */
export type CogniteExternalId = string;

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

/**
 * Range between two integers
 */
export interface IntegerRange {
  min?: number;
  max?: number;
}

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

export interface AssetInternalId {
  id: CogniteInternalId;
}

export interface AssetExternalId {
  externalId: CogniteExternalId;
}

export type AssetIdEither = AssetInternalId | AssetExternalId;

export interface SetStringField {
  set: string;
}

export interface RemoveField {
  setNull: boolean;
}

export type SinglePatchString = SetStringField | RemoveField;

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

export type NullableSinglePatchString = { set: string; } | { setNull: true };
export type NullableSinglePatchLong = { set: number; } | { setNull: true };
export type ArrayPatchLong = { set: number[]; } | { add?: number[]; remove?: number[]; };

export interface AssetPatch {
  update: {
    externalId?: SinglePatchString;
    name?: SinglePatchRequiredString;
    description?: SinglePatchString;
    metadata?: ObjectPatch;
    source?: SinglePatchString;
  };
}

export interface AssetChangeById extends AssetPatch {
  id: CogniteInternalId;
}

export interface AssetChangeByExternalId extends AssetPatch {
  externalId: CogniteExternalId;
}

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
export interface AssetFilter {
  filter?: {
    name?: AssetName;
    parentIds?: CogniteInternalId[];
    metadata?: Metadata;
    source?: AssetSource;
    createdTime?: Date;
    lastUpdatedTime?: Date;
    assetSubtrees?: CogniteInternalId[];
    depth?: IntegerRange;
    externalIdPrefix?: CogniteExternalId;
  };
  limit?: number;
}

export interface AssetListScope extends AssetFilter, Cursor {}

export interface AssetSearchFilter extends AssetFilter {
  search?: {
    name?: AssetName;
    description?: AssetDescription;
  };
}

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
export interface TimeseriesFilter {
  limit?: number;
  /**
   * Decide if the metadata field should be returned or not.
   */
  includeMetadata?: boolean;
  /**
   * Cursor for paging through time series.
   */
  cursor: string;
  /**
   * Get time series related to these assets. Takes [ 1 .. 100 ] unique items.
   */
  assetIds: number[];
}

export interface GetTimeSeriesMetadataDTO {
  /**
   * Generated id of the time series
   */
  id: CogniteInternalId;
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

export interface TimeSeriesSearchDTO {
  filter?: Filter;
  search?: Search;
  /**
   * Return up to this many results.
   */
  limit?: number;
}

export type TimeseriesIdEither = { id: CogniteInternalId } | { externalId: CogniteExternalId };

export interface TimeSeriesPatch {
  update: {
    externalId: NullableSinglePatchString;
    name: NullableSinglePatchString;
    metadata: ObjectPatch;
    unit: NullableSinglePatchString;
    assetId: NullableSinglePatchLong;
    description: NullableSinglePatchString;
    securityCategories: ArrayPatchLong;
  };
}

export interface TimeSeriesUpdateById extends TimeSeriesPatch {
  id: CogniteInternalId;
}

export interface TimeSeriesUpdateByExternalId extends TimeSeriesPatch {
  externalId: CogniteExternalId;
}

export type TimeSeriesUpdate = TimeSeriesUpdateById | TimeSeriesUpdateByExternalId;

export interface CogniteResponse<T> {
  data: T;
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

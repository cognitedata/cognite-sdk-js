// Copyright 2019 Cognite AS

/**
 * Representation of a physical asset, e.g plant or piece of equipment
 */
export interface Asset {
  /**
   * ID of the asset.
   */
  id: number;
  /**
   * Description of asset.
   */
  description?: string;
  /**
   * IDs of assets on the path to the asset.
   */
  path?: number[];
  /**
   * Asset path depth (number of levels below root node).
   */
  depth?: number;
  /**
   * Name of asset. Often referred to as tag.
   */
  name?: string;
  /**
   * ID of parent asset, if any
   */
  parentId?: number;
  /**
   * Custom, application specific metadata. String key -> String value
   */
  metadata?: { [key: string]: string };
  /**
   * The source of this asset
   */
  source?: string;
  /**
   * ID of the asset in the source. Only applicable if source is specified. The combination of source and sourceId must be unique.
   */
  sourceId?: string;
  /**
   * Time when the resource was created
   */
  createdTime?: Date;
  /**
   * Time when the resource was last modified
   */
  lastUpdatedTime?: Date;
}

/**
 * Representation of a physical asset, e.g plant or piece of equipment
 */
export interface CreateAsset {
  /**
   * Name of asset. Often referred to as tag.
   */
  name?: string;
  /**
   * Description of asset.
   */
  description?: string;
  /**
   * Reference ID used only in post request to disambiguate references to duplicate names.
   */
  refId?: string;
  /**
   * Reference ID of parent, to disambiguate if multiple nodes have the same name.
   */
  parentRefId?: string;
  /**
   * ID of parent asset in CDP, if any. If parentName or parentRefId are also specified, this will be ignored.
   */
  parentId?: number;
  /**
   * The source of this asset
   */
  source?: string;
  /**
   * ID of the asset in the source. Only applicable if source is specified. The combination of source and sourceId must be unique.
   */
  sourceId?: string;
  /**
   * Custom, application specific metadata. Format is {"key1": "value1", "key2": "value2"}. The maximum number of entries (pairs of key+value) is 64. The maximum length in characters of the sum of all keys and values is 10240. There is also a maximum length of 128 characters per key and 512 per value.
   */
  metadata?: { [key: string]: string };
}

export interface ListAssetsParams {
  /**
   * The name of the asset(s) to get.
   */
  name?: string;
  /**
   * Get sub assets up to this many levels below the specified path.
   */
  depth?: number;
  /**
   * The metadata values used to filter the results. Format is {"key1": "value1", "key2": "value2"}. The maximum number of entries (pairs of key+value) is 64. The maximum length in characters of the sum of all keys and values is 10240. There is also a maximum length of 128 characters per key and 512 per value.
   */
  metadata?: { [key: string]: string };
  /**
   * Only return assets that contain this description
   */
  description?: string;
}

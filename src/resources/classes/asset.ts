// Copyright 2019 Cognite AS

import {
  Asset as TypeAsset,
  AssetDescription,
  AssetName,
  AssetSource,
  CogniteClient,
  CogniteExternalId,
  CogniteInternalId,
  EventFilter,
  FileFilter,
  Metadata,
  TimeseriesFilter,
} from '../../index';
import { AssetList } from './assetList';

export interface SubtreeOptions {
  depth?: number;
}
export interface DeleteOptions {
  recursive?: boolean;
}
export class Asset implements TypeAsset {
  public id: CogniteInternalId;
  public externalId?: CogniteExternalId;
  public parentId?: CogniteInternalId;
  public name: AssetName;
  public description?: AssetDescription;
  public metadata?: Metadata;
  public source?: AssetSource;
  public lastUpdatedTime: Date;
  public createdTime: Date;
  public rootId: CogniteInternalId;
  private client: CogniteClient;

  constructor(client: CogniteClient, props: TypeAsset) {
    this.client = client;
    this.id = props.id;
    this.externalId = props.externalId;
    this.parentId = props.parentId;
    this.name = props.name;
    this.description = props.description;
    this.metadata = props.metadata;
    this.source = props.source;
    this.lastUpdatedTime = props.lastUpdatedTime;
    this.createdTime = props.createdTime;
    this.rootId = props.rootId;
  }

  /**
   * Deletes the current asset
   *
   * @param {DeleteOptions} options Allow to delete recursively, default ({}) is recursive = false
   * ```js
   * await asset.delete();
   * ```
   */
  public delete = async (options: DeleteOptions = {}) => {
    return this.client.assets.delete(
      [
        {
          id: this.id,
        },
      ],
      options
    );
  };

  /**
   * Retrieves the parent of the current asset
   * ```js
   * const parentAsset = await asset.parent();
   * ```
   */
  public parent = async () => {
    if (this.parentId) {
      const [parentAsset] = await this.client.assets.retrieve([
        { id: this.parentId },
      ]);
      return parentAsset;
    }
    return null;
  };

  /**
   * Returns an AssetList object with all children of the current asset
   * ```js
   * const children = await asset.children();
   * ```
   */
  public children = async () => {
    const childAssets = await this.client.assets
      .list({
        filter: {
          parentIds: [this.id],
        },
      })
      .autoPagingToArray({ limit: Infinity });
    return new AssetList(this.client, childAssets);
  };

  /**
   * Returns the full subtree of the current asset, including the asset itself
   * ```js
   * const subtree = await asset.subtree();
   * ```
   */
  public subtree = async (options?: SubtreeOptions) => {
    const query: SubtreeOptions = options || {};
    return this.client.assets.retrieveSubtree(
      { id: this.id },
      query.depth || Infinity
    );
  };

  /**
   * Returns all timeseries for the current asset
   * ```js
   * const timeSeries = await asset.timeSeries();
   * ```
   */
  public timeSeries = async (filter: TimeseriesFilter = {}) => {
    return this.client.timeseries
      .list({
        ...filter,
        assetIds: [this.id],
      })
      .autoPagingToArray({ limit: Infinity });
  };

  /**
   * Returns all events for the current asset
   * ```js
   * const events = await asset.events();
   * ```
   */
  public events = async (filter: EventFilter = {}) => {
    return this.client.events
      .list({
        filter: { ...filter, assetIds: [this.id] },
      })
      .autoPagingToArray({ limit: Infinity });
  };

  /**
   * Returns all files for the current asset
   * ```js
   * const files = await asset.files();
   * ```
   */
  public files = async (filter: FileFilter = {}) => {
    return this.client.files
      .list({
        filter: { ...filter, assetIds: [this.id] },
      })
      .autoPagingToArray({ limit: Infinity });
  };
}

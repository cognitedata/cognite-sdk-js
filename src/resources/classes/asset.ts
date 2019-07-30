// Copyright 2019 Cognite AS

import { CogniteClient } from '../..';
import * as types from '../../types/types';
import { AssetList } from './assetList';

export interface SubtreeOptions {
  depth?: number;
}
export class Asset implements types.Asset {
  public id: types.CogniteInternalId;
  public externalId?: types.CogniteExternalId;
  public parentId?: types.CogniteInternalId;
  public name: types.AssetName;
  public description?: types.AssetDescription;
  public metadata?: types.Metadata;
  public source?: types.AssetSource;
  public lastUpdatedTime: Date;
  public createdTime: Date;
  private client: CogniteClient;

  constructor(client: CogniteClient, props: types.Asset) {
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
  }

  public delete = (recursive: boolean = false) => {
    return this.client.assets.delete(
      [
        {
          id: this.id,
        },
      ],
      { recursive }
    );
  };

  public parent: () => Promise<null | Asset> = async () => {
    const { parentId } = this;
    if (!parentId) {
      return null;
    }
    const [parentAsset] = await this.client.assets.retrieve([{ id: parentId }]);
    return parentAsset;
  };

  public children: () => Promise<AssetList> = async () => {
    const childAssets = await this.client.assets
      .list({
        filter: {
          parentIds: [this.id],
        },
      })
      .autoPagingToArray({ limit: Infinity });
    return new AssetList(this.client, childAssets);
  };

  public subtree = async (options?: SubtreeOptions) => {
    const query: SubtreeOptions = options || {};
    return this.client.assets.retrieveSubtree(this.id, query.depth || Infinity);
  };

  public timeSeries = async (filter?: types.TimeseriesFilter) => {
    return this.client.timeseries
      .list({
        ...(filter || {}),
        assetIds: [this.id],
      })
      .autoPagingToArray({ limit: Infinity });
  };

  public events = async (filter?: types.EventFilter) => {
    return this.client.events
      .list({
        filter: { ...(filter || {}), assetIds: [this.id] },
      })
      .autoPagingToArray({ limit: Infinity });
  };

  public files = async (filter?: types.FileFilter) => {
    return this.client.files
      .list({
        filter: { ...(filter || {}), assetIds: [this.id] },
      })
      .autoPagingToArray({ limit: Infinity });
  };
}

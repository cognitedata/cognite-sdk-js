// Copyright 2019 Cognite AS

import { CogniteClient } from '../..';
import { CogniteAsyncIterator } from '../../autoPagination';
import * as types from '../../types/types';
import { EventsListEndpoint } from '../events/eventsApi';
import { FilesListEndpoint } from '../files/filesApi';
import { TimeSeriesListEndpoint } from '../timeSeries/timeSeriesApi';
import { AssetList } from './assetList';

export class Asset implements types.Asset {
  public id: types.CogniteInternalId;
  public externalId?: types.CogniteExternalId;
  public parentId?: types.CogniteInternalId;
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
    this.description = props.description;
    this.metadata = props.metadata;
    this.source = props.source;
    this.lastUpdatedTime = props.lastUpdatedTime;
    this.createdTime = props.createdTime;
  }

  public delete = () => {
    return this.client.assets.delete([
      {
        id: this.id,
      },
    ]);
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
      .autoPagingToArray();
    return new AssetList(this.client, childAssets);
  };

  public subtree: () => Promise<AssetList> = async (
    depth: number = this.depth
  ) => {
    const [subtree] = await this.client.assets.retrieveSubtree(
      this.id,
      this.externalId,
      depth
    );
    return subtree;
  };

  public timeSeries = async (filter?: types.TimeseriesFilter) => {
    return this.client.timeseries.list({
      assetIds: [this.id],
      ...(filter || {}),
    });
  };

  public events = async (filter?: types.EventFilter) => {
    return this.client.events.list({
      filter: { assetIds: [this.id], ...(filter || {}) },
    });
  };

  public files = async (filter?: types.FileFilter) => {
    return this.client.files.list({
      filter: { assetIds: [this.id], ...(filter || {}) },
    });
  };
}

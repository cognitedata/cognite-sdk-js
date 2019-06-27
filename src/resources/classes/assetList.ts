// Copyright 2019 Cognite AS

import { Asset } from './asset';
import { CogniteClient } from '../..';
import { AssetsAPI } from '../assets/assetsApi';
import { chunk } from 'lodash';

export class AssetList extends Array<Asset> {
  private client: CogniteClient;
  constructor(client: CogniteClient, items: Asset[]) {
    super(...items);
    this.client = client;
  }

  public delete = () => {
    return this.client.assets.delete(this.map(asset => ({ id: asset.id })));
  };

  public timeSeries = async () => {
    type TimeSeries = object;
    let timeSeriesArray: Array<TimeSeries> = [];
    this.toChunkedArrayOfIds().forEach(async idArray => {
      const response = await this.client.timeseries.list({ assetIds: idArray });
      timeSeriesArray.push(response);
    });
    return timeSeriesArray;
  }

  public files = async () => {
    type Files = object;
    let filesArray: Array<Files> = [];
    this.toChunkedArrayOfIds().forEach(async idArray => {
      const response = await this.client.files.list({filter : { assetIds: idArray }});
      filesArray.push(response);
    });
    return filesArray;
  }

  private toChunkedArrayOfIds = (): number[][] => {
    const ids = this.map(asset => asset.id);
    let chunks: number[][] = [[]];
    if (ids.length) {
      chunks = chunk(ids, 100);
    }
    return chunks;
  }
}
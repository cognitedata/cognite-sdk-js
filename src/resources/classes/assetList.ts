// Copyright 2019 Cognite AS

import { chunk } from 'lodash';
import { CogniteClient } from '../..';
import { AssetsAPI } from '../assets/assetsApi';
import { Asset } from './asset';

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
    // return this.getResourcesFromAssets<TimeSeries>(this.client.timeseries);
    // Replace this codeblock with return statement above when TimeSeries-class is implemented
    const timeSeriesArray: TimeSeries[] = [];
    this.toChunkedArrayOfIds().forEach(async idArray => {
      const response = await this.client.timeseries.list({ assetIds: idArray });
      timeSeriesArray.push(response);
    });
    return timeSeriesArray;
  };

  public files = async () => {
    type Files = object;
    // return this.getResourcesFromAssets<Files>(this.client.files);
    // Replace this codeblock with return statement above when Files-class is implemented
    const filesArray: Files[] = [];
    this.toChunkedArrayOfIds().forEach(async idArray => {
      const response = await this.client.files.list({
        filter: { assetIds: idArray },
      });
      filesArray.push(response);
    });
    return filesArray;
  };

  public events = async () => {
    type Event = object;
    // return this.getResourcesFromAssets<Event>(this.client.events);
    // Replace this codeblock with return statement above when Event-class is implemented
    const eventArray: Event[] = [];
    this.toChunkedArrayOfIds().forEach(async idArray => {
      const response = await this.client.events.list({
        filter: { assetIds: idArray },
      });
      eventArray.push(response);
    });
    return eventArray;
  };

  private toChunkedArrayOfIds = (): number[][] => {
    const ids = this.map(asset => asset.id);
    let chunks: number[][] = [[]];
    if (ids.length) {
      chunks = chunk(ids, 100);
    }
    return chunks;
  };
}

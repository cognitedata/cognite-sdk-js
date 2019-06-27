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

  // Cant really be implemented until we have own classes for TimeSeries, Files, Events as well
  // because we need to pass the correct RequestType
  // --------------------------------------------------
  // private getResourcesFromAssets<RequestType>(accessedApi: any) {
  //   let resourcesArray: Array<RequestType> = [];
  //   this.toChunkedArrayOfIds().forEach(async idArray => {
  //     const assetIds = { assetIds: idArray};
  //     if (resourcesArray instanceof Array<TimeSeries>) {
  //       const response = await accessedApi.list(assetIds);
  //       resourcesArray.push(response);
  //     } else {
  //       const response = await accessedApi.list({filter : assetIds});
  //       resourcesArray.push(response);
  //     }
  //   });
  //   return resourcesArray;
  // }
}

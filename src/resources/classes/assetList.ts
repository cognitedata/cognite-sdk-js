// Copyright 2019 Cognite AS

import { chunk } from 'lodash';
import { types } from 'util';
import { CogniteClient } from '../..';
import {
  CogniteEvent,
  FilesMetadata,
  GetTimeSeriesMetadataDTO,
} from '../../types/types';
import { EventsAPI } from '../events/eventsApi';
import { FilesAPI } from '../files/filesApi';
import { TimeSeriesAPI } from '../timeSeries/timeSeriesApi';
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
    // return this.getResourcesFromAssets<TimeSeries>(this.client.timeseries);
    const timeSeriesArray: GetTimeSeriesMetadataDTO[] = [];
    this.toChunkedArrayOfIds().forEach(async idArray => {
      const response = await this.client.timeseries
        .list({ assetIds: idArray })
        .autoPagingToArray({ limit: Infinity });
      timeSeriesArray.push(...response);
    });
    return timeSeriesArray;
  };

  public files = async () => {
    // return this.getResourcesFromAssets<Files>(this.client.files);
    const filesArray: FilesMetadata[] = [];
    this.toChunkedArrayOfIds().forEach(async idArray => {
      const response = await this.client.files
        .list({
          filter: { assetIds: idArray },
        })
        .autoPagingToArray({ limit: Infinity });
      filesArray.push(...response);
    });
    return filesArray;
  };

  public events = async () => {
    // return this.getResourcesFromAssets<Event>(this.client.events);
    const eventArray: CogniteEvent[] = [];
    this.toChunkedArrayOfIds().forEach(async idArray => {
      const response = await this.client.events
        .list({
          filter: { assetIds: idArray },
        })
        .autoPagingToArray({ limit: Infinity });
      eventArray.push(...response);
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

  private getResourcesFromAssets<Type>(
    accessedApi: TimeSeriesAPI | FilesAPI | EventsAPI
  ) {
    const resourcesArray: Type[] = [];
    this.toChunkedArrayOfIds().forEach(async idArray => {
      const assetIds = { assetIds: idArray };
      if (resourcesArray instanceof TimeSeriesAPI) {
        const response = await accessedApi
          .list(assetIds)
          .autoPagingToArray({ limit: Infinity });
        resourcesArray.push(...response);
      } else {
        const response = await accessedApi
          .list({ filter: assetIds })
          .autoPagingToArray({ limit: Infinity });
        resourcesArray.push(...response);
      }
    });
    return resourcesArray;
  }
}

// Copyright 2019 Cognite AS

import { chunk } from 'lodash';
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

  public timeSeries = async (): Promise<GetTimeSeriesMetadataDTO[]> => {
    return (await this.getResourcesFromAssets(
      this.client.timeseries
    )) as GetTimeSeriesMetadataDTO[];
  };

  public files = async (): Promise<FilesMetadata[]> => {
    return (await this.getResourcesFromAssets(
      this.client.files
    )) as FilesMetadata[];
  };

  public events = async (): Promise<CogniteEvent[]> => {
    return this.getResourcesFromAssets(this.client.events);
  };

  private getResourcesFromAssets = async (
    accessedApi: TimeSeriesAPI | FilesAPI | EventsAPI
  ) => {
    type Type = GetTimeSeriesMetadataDTO | FilesMetadata | CogniteEvent;
    const chunks = this.toChunkedArrayOfIds();
    const promises: Promise<Type[]>[] = [];
    for (const idArray of chunks) {
      const assetIds = { assetIds: idArray };
      if (accessedApi instanceof TimeSeriesAPI) {
        promises.push(
          accessedApi.list(assetIds).autoPagingToArray({ limit: Infinity })
        );
      } else {
        promises.push(
          accessedApi
            .list({ filter: assetIds })
            .autoPagingToArray({ limit: Infinity })
        );
      }
    }
    const results = await Promise.all(promises);
    const responses: Type[] = [];
    results.forEach(result => {
      responses.push(...result);
    });
    return responses;
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

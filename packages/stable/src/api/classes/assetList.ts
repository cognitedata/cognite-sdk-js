// Copyright 2020 Cognite AS

import { chunk } from 'lodash';
import CogniteClient from '../../cogniteClient';
import {
  CogniteEvent,
  CogniteInternalId,
  FileInfo,
  TimeSeries,
} from '../../types';
import { EventsAPI } from '../events/eventsApi';
import { FilesAPI } from '../files/filesApi';
import { TimeSeriesAPI } from '../timeSeries/timeSeriesApi';
import { AssetImpl } from './asset';

export class AssetList extends Array<AssetImpl> {
  constructor(private client: CogniteClient, items: AssetImpl[]) {
    super(...items);
  }

  /**
   * Deletes all assets in the AssetList
   * ```js
   * await assetList.delete();
   * ```
   */
  public delete = async () => {
    return this.client.assets.delete(this.map(asset => ({ id: asset.id })));
  };

  /**
   * Return all timeseries for assets in the AssetList
   * ```js
   * const timeseries = await assetList.timeSeries();
   * ```
   */
  public timeSeries = async () => {
    return (await this.getResourcesFromAssets(
      this.client.timeseries
    )) as TimeSeries[];
  };

  /**
   * Return all files for assets in the AssetList
   * ```js
   * const files = await assetList.files();
   * ```
   */
  public files = async () => {
    return (await this.getResourcesFromAssets(this.client.files)) as FileInfo[];
  };

  /**
   * Return all events for assets in the AssetList
   * ```js
   * const events = await assetList.events();
   * ```
   */
  public events = async () => {
    return (await this.getResourcesFromAssets(
      this.client.events
    )) as CogniteEvent[];
  };

  private getResourcesFromAssets = async (
    accessedApi: TimeSeriesAPI | FilesAPI | EventsAPI
  ) => {
    type Type = TimeSeries | FileInfo | CogniteEvent;
    const chunks = this.toChunkedArrayOfIds();
    const promises: Promise<Type[]>[] = [];
    for (const idArray of chunks) {
      const assetIds = { assetIds: idArray };
      promises.push(
        accessedApi
          .list({ filter: assetIds })
          .autoPagingToArray({ limit: Infinity })
      );
    }
    const results = await Promise.all(promises);
    const responses: Type[] = [];
    results.forEach(result => {
      responses.push(...result);
    });
    return responses;
  };

  private toChunkedArrayOfIds = (): CogniteInternalId[][] => {
    const ids = this.map(asset => asset.id);
    let chunks: CogniteInternalId[][] = [[]];
    if (ids.length) {
      chunks = chunk(ids, 100);
    }
    return chunks;
  };
}

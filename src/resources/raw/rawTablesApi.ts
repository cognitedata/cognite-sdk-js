// Copyright 2019 Cognite AS

import { MetadataMap } from '@/metadata';
import { BaseResourceAPI } from '@/resources/baseResourceApi';
import { CursorAndAsyncIterator } from '@/standardMethods';
import {
  CursorResponse,
  ItemsResponse,
  ListRawTables,
  RawDB,
  RawDBTable,
} from '@/types/types';
import { CDFHttpClient } from '@/utils/http/cdfHttpClient';
import { promiseAllWithData } from '../assets/assetUtils';

export class RawTablesAPI extends BaseResourceAPI<RawDBTable> {
  /** @hidden */
  constructor(
    resourcePath: string,
    httpClient: CDFHttpClient,
    map: MetadataMap
  ) {
    super(resourcePath, httpClient, map);
  }

  public async create(
    databaseName: string,
    items: RawDBTable[],
    ensureParent: boolean = false
  ): Promise<RawDBTable[]> {
    const path = `${this.encodeUrl(databaseName)}/tables`;
    const params = { ensureParent };
    const responses = await promiseAllWithData(
      BaseResourceAPI.chunk(items, 1000),
      singleChunk =>
        this.httpClient.post<ItemsResponse<RawDBTable[]>>(path, {
          params,
          data: { items: singleChunk },
        }),
      false
    );
    const mergedItems = this.mergeItemsFromItemsResponse(responses);
    return mergedItems;
  }

  public list(
    databaseName: string,
    scope?: ListRawTables
  ): CursorAndAsyncIterator<RawDBTable> {
    const path = `${this.encodeUrl(databaseName)}/tables`;
    return super.listEndpoint(async params => {
      const response = await this.httpClient.get<CursorResponse<RawDBTable[]>>(
        path,
        {
          params,
        }
      );
      return response;
    }, scope);
  }

  public async delete(databaseName: string, items: RawDBTable[]) {
    const path = `${this.encodeUrl(databaseName)}/tables/delete`;
    await this.postInParallelWithAutomaticChunking(path, items);
    return {};
  }

  protected transformToList(items: RawDB[]) {
    return items;
  }

  protected transformToClass(items: RawDB[]) {
    return items;
  }

  private encodeUrl(databaseName: string) {
    return this.url(`${encodeURIComponent(databaseName)}`);
  }
}

export interface RawDatabaseDeleteParams {
  recursive?: boolean;
}

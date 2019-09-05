// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator } from '../../autoPagination';
import { BaseResourceAPI } from '../../resources/baseResourceApi';
import {
  CursorResponse,
  ItemsWrapper,
  ListRawTables,
  RawDB,
  RawDBTable,
} from '../../types/types';
import { promiseAllWithData } from '../assets/assetUtils';

export class RawTablesAPI extends BaseResourceAPI<RawDBTable> {
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
        this.httpClient.post<ItemsWrapper<RawDBTable[]>>(path, {
          params,
          data: { items: singleChunk },
        }),
      false
    );
    return this.mergeItemsFromItemsResponse(responses);
  }

  public list(
    databaseName: string,
    scope?: ListRawTables
  ): CursorAndAsyncIterator<RawDBTable> {
    const path = `${this.encodeUrl(databaseName)}/tables`;
    return super.listEndpoint(
      async params =>
        this.httpClient.get<CursorResponse<RawDBTable[]>>(path, {
          params,
        }),
      scope
    );
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

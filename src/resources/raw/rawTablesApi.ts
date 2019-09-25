// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator } from '../../autoPagination';
import { BaseResourceAPI } from '../../resources/baseResourceApi';
import { CursorResponse, ListRawTables, RawDBTable } from '../../types/types';

export class RawTablesAPI extends BaseResourceAPI<RawDBTable> {
  public async create(
    databaseName: string,
    items: RawDBTable[],
    ensureParent: boolean = false
  ): Promise<RawDBTable[]> {
    const path = `${this.encodeUrl(databaseName)}/tables`;
    const params = { ensureParent };
    const responses = await this.postInParallelWithAutomaticChunking({
      params,
      items,
      path,
    });
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

  public delete(databaseName: string, items: RawDBTable[]) {
    const path = `${this.encodeUrl(databaseName)}/tables/delete`;
    return this.deleteEndpoint(items, {}, path);
  }

  private encodeUrl(databaseName: string) {
    return this.url(`${encodeURIComponent(databaseName)}`);
  }
}

export interface RawDatabaseDeleteParams {
  recursive?: boolean;
}

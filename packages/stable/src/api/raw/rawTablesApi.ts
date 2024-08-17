// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  CursorResponse,
  ListRawTables,
  RawDBTable,
  RawDBTableName,
} from '../../types';

export class RawTablesAPI extends BaseResourceAPI<RawDBTable> {
  public async create(
    databaseName: string,
    items: RawDBTableName[],
    ensureParent = false,
  ): Promise<RawDBTable[]> {
    const path = `${this.encodeUrl(databaseName)}/tables`;
    const responses = await this.postInParallelWithAutomaticChunking({
      queryParams: { ensureParent },
      items,
      path,
    });
    return this.mergeItemsFromItemsResponse(responses);
  }

  public list(
    databaseName: string,
    scope?: ListRawTables,
  ): CursorAndAsyncIterator<RawDBTable> {
    const path = `${this.encodeUrl(databaseName)}/tables`;
    return super.listEndpoint(
      async (params) =>
        this.get<CursorResponse<RawDBTable[]>>(path, {
          params,
        }),
      scope,
    );
  }

  public delete(databaseName: string, items: RawDBTableName[]) {
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

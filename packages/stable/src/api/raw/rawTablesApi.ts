// Copyright 2020 Cognite AS

import { BaseResourceAPI, CursorAndAsyncIterator } from '@cognite/sdk-core';
import {
  RawDBTableName,
  CursorResponse,
  ListRawTables,
  RawDBTable,
} from '../../types';

export class RawTablesAPI extends BaseResourceAPI<RawDBTable> {
  /**
   * [Create tables in a database](https://doc.cognitedata.com/api/v1/#operation/createTables)
   *
   * ```js
   * const tables = await client.rawTablesApi.create('My company', [{ name: 'Customers' }]);
   * ```
   */
  public async create(
    databaseName: string,
    items: RawDBTableName[],
    ensureParent: boolean = false
  ): Promise<RawDBTable[]> {
    const path = `${this.encodeUrl(databaseName)}/tables`;
    const responses = await this.postInParallelWithAutomaticChunking({
      queryParams: { ensureParent },
      items,
      path,
    });
    return this.mergeItemsFromItemsResponse(responses);
  }

  /**
   * [List tables in database](https://doc.cognitedata.com/api/v1/#operation/getTables)
   *
   * ```js
   * const tables = await client.rawTablesApi.list('My company');
   * ```
   */
  public list(
    databaseName: string,
    scope?: ListRawTables
  ): CursorAndAsyncIterator<RawDBTable> {
    const path = `${this.encodeUrl(databaseName)}/tables`;
    return super.listEndpoint(
      async (params) =>
        this.get<CursorResponse<RawDBTable[]>>(path, {
          params,
        }),
      scope
    );
  }

  /**
   * [Delete tables in a database](https://doc.cognitedata.com/api/v1/#operation/deleteTables)
   *
   * ```js
   * await client.rawTablesApi.delete('My company', [{ name: 'Customers' }]);
   * ```
   */
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

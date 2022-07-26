// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  HttpHeaders,
} from '@cognite/sdk-core';
import {
  CursorResponse,
  ListRawRows,
  RawDBRow,
  RawDBRowInsert,
  RawDBRowKey,
} from '../../types';

export class RawRowsAPI extends BaseResourceAPI<RawDBRow> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['lastUpdatedTime']);
  }

  /**
   *
   * [Insert rows into a table](https://docs.cognite.com/api/v1/#tag/Raw/operation/postRows)
   *
   * ```js
   * await client.rawRowsApi.insert('My company', 'Customers', [{ key: 'customer1', columns: { 'First name': 'Steve', 'Last name': 'Jobs' } }]);
   * ```
   *
   * @param databaseName
   * @param tableName
   * @param items
   * @param ensureParent
   * @returns
   */
  public async insert(
    databaseName: string,
    tableName: string,
    items: RawDBRowInsert[],
    ensureParent: boolean = false
  ): Promise<{}> {
    const path = `${this.encodeUrl(databaseName, tableName)}/rows`;
    await this.postInParallelWithAutomaticChunking({
      path,
      items,
      chunkSize: 10000,
      queryParams: { ensureParent },
    });
    return {};
  }

  /**
   * [Retrieve rows from a table](https://docs.cognite.com/api/v1/#tag/Raw/operation/getRows)
   *
   * ```js
   * await client.rawRowsApi.list(databaseName, tableName);
   * ```
   *
   * @param databaseName
   * @param tableName
   * @param scope
   * @returns
   */
  public list(
    databaseName: string,
    tableName: string,
    scope: ListRawRows = {}
  ): CursorAndAsyncIterator<RawDBRow> {
    const { onlyRowKeys, columns, ...rest } = scope;
    const query: HttpHeaders = rest as HttpHeaders;
    if (onlyRowKeys) {
      query.columns = ',';
    }
    if (columns) {
      query.columns = columns.join(',');
    }

    const path = `${this.encodeUrl(databaseName, tableName)}/rows`;
    return super.listEndpoint(
      async (params) =>
        this.get<CursorResponse<RawDBRow[]>>(path, {
          params,
        }),
      query
    );
  }

  /**
   * [Retrieve a single row from a table](https://doc.cognitedata.com/api/v1/#operation/getRow)
   *
   * ```js
   * await client.rawRowsApi.retrieve('My company', 'Customers', 'customer1');
   * ```
   */
  public async retrieve(
    databaseName: string,
    tableName: string,
    rowKey: string
  ): Promise<RawDBRow> {
    const path = `${this.encodeUrl(
      databaseName,
      tableName
    )}/rows/${encodeURIComponent(rowKey)}`;
    const response = await this.get<RawDBRow>(path);
    return this.addToMapAndReturn(response.data, response);
  }

  /**
   * [Delete rows in a table](https://doc.cognitedata.com/api/v1/#operation/deleteRows)
   *
   * ```js
   * await client.rawRowsApi.delete('My company', 'Customers', [{key: 'customer1'}]);
   * ```
   */
  public async delete(
    databaseName: string,
    tableName: string,
    items: RawDBRowKey[]
  ) {
    const path = `${this.encodeUrl(databaseName, tableName)}/rows/delete`;
    await this.postInParallelWithAutomaticChunking({ path, items });
    return {};
  }

  private encodeUrl(databaseName: string, tableName: string) {
    return this.url(
      `${encodeURIComponent(databaseName)}/tables/${encodeURIComponent(
        tableName
      )}`
    );
  }
}

export interface RawDatabaseDeleteParams {
  recursive?: boolean;
}

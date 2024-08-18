// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type HttpHeaders,
} from '@cognite/sdk-core';
import type {
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

  public async insert(
    databaseName: string,
    tableName: string,
    items: RawDBRowInsert[],
    ensureParent = false
  ): Promise<object> {
    const path = `${this.encodeUrl(databaseName, tableName)}/rows`;
    await this.postInParallelWithAutomaticChunking({
      path,
      items,
      chunkSize: 5000,
      queryParams: { ensureParent },
    });
    return {};
  }

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

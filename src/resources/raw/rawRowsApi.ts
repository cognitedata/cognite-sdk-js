// Copyright 2019 Cognite AS

import { BaseResourceAPI } from '@/resources/baseResourceApi';
import { CursorAndAsyncIterator } from '@/standardMethods';
import {
  CursorResponse,
  ListRawRows,
  RawDBRow,
  RawDBRowInsert,
  RawDBRowKey,
} from '@/types/types';
import { HttpHeaders } from '@/utils/http/basicHttpClient';
import { promiseAllWithData } from '../assets/assetUtils';

export class RawRowsAPI extends BaseResourceAPI<RawDBRow> {
  public async insert(
    databaseName: string,
    tableName: string,
    items: RawDBRowInsert[],
    ensureParent: boolean = false
  ): Promise<{}> {
    const path = `${this.encodeUrl(databaseName, tableName)}/rows`;
    const params = { ensureParent };
    await promiseAllWithData(
      BaseResourceAPI.chunk(items, 10000),
      singleChunk =>
        this.httpClient.post(path, {
          params,
          data: { items: singleChunk },
        }),
      false
    );
    return {};
  }

  public list(
    databaseName: string,
    tableName: string,
    scope: ListRawRows = {}
  ): CursorAndAsyncIterator<RawDBRow> {
    const query: HttpHeaders = {};
    if (scope.onlyRowKeys) {
      query.columns = ',';
    }
    if (scope.columns) {
      query.columns = scope.columns.join(',');
    }

    const path = `${this.encodeUrl(databaseName, tableName)}/rows`;
    return super.listEndpoint(async params => {
      const response = await this.httpClient.get<CursorResponse<RawDBRow[]>>(
        path,
        {
          params,
        }
      );
      return response;
    }, query);
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
    const response = await this.httpClient.get<RawDBRow>(path);
    return this.addToMapAndReturn(response.data, response);
  }

  public async delete(
    databaseName: string,
    tableName: string,
    items: RawDBRowKey[]
  ) {
    const path = `${this.encodeUrl(databaseName, tableName)}/rows/delete`;
    await this.postInParallelWithAutomaticChunking(path, items);
    return {};
  }

  protected transformToList(items: RawDBRow[]) {
    return items;
  }

  protected transformToClass(items: RawDBRow[]) {
    return items;
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

// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, projectUrl, rawGet, rawPost } from './core';

export interface Database {
  dbName: string;
}

export interface Table {
  tableName: string;
}

export interface Row {
  key: string;
  columns?: object;
}

interface RawDatabaseResponse {
  data: {
    items: Database[];
  };
}

interface RawTableResponse {
  data: {
    items: Table[];
  };
}

interface RawRowResponse {
  data: {
    items: Row[];
  };
}

interface RawInsertRowsParams {
  ensureParent?: boolean;
}

interface RawListRowsParams {
  limit?: number;
  cursor?: string;
  columns?: string[];
}

interface RawListDatabasesParams {
  limit?: number;
  cursor?: string;
}

interface RawListTablesParams {
  limit?: number;
  cursor?: string;
}

/**
 * @hidden
 */
const rawUrl = (): string => `${apiUrl(0.5)}/${projectUrl()}/raw`;

/**
 * @hidden
 */
async function retrieveRows(
  dbName: string,
  tableName: string,
  params: RawListRowsParams = {},
  contentType: string
): Promise<any> {
  const url = `${rawUrl()}/${encodeURIComponent(dbName)}/${encodeURIComponent(
    tableName
  )}`;
  interface RequestParams {
    limit?: number;
    cursor?: string;
    columns?: string;
  }
  const reqParams: RequestParams = {};
  if (params.limit !== undefined) {
    reqParams.limit = params.limit;
  }
  if (params.cursor !== undefined) {
    reqParams.cursor = params.cursor;
  }
  if (Array.isArray(params.columns)) {
    reqParams.columns = params.columns.join(',');
  }
  return await rawGet(url, {
    params: reqParams,
    headers: { Accept: contentType },
  });
}

export class Raw {
  public static async createDatabases(dbNames: string[]): Promise<void> {
    const body = {
      items: dbNames.map(dbName => ({ dbName })),
    };
    const url = `${rawUrl()}/create`;
    await rawPost(url, { data: body });
  }

  public static async createTables(
    dbName: string,
    tableNames: string[]
  ): Promise<void> {
    const body = {
      items: tableNames.map(tableName => ({ tableName })),
    };
    const url = `${rawUrl()}/${encodeURIComponent(dbName)}/create`;
    await rawPost(url, { data: body });
  }

  public static async insertRows(
    dbName: string,
    tableName: string,
    rows: Row[],
    params?: RawInsertRowsParams
  ): Promise<void> {
    const body = {
      items: rows,
    };
    const url = `${rawUrl()}/${encodeURIComponent(dbName)}/${encodeURIComponent(
      tableName
    )}/create`;
    await rawPost(url, { data: body, params });
  }

  public static async retrieveRow(
    dbName: string,
    tableName: string,
    rowKey: string
  ): Promise<Row> {
    const url = `${rawUrl()}/${encodeURIComponent(dbName)}/${encodeURIComponent(
      tableName
    )}/${encodeURIComponent(rowKey)}`;
    const result = (await rawGet(url)) as AxiosResponse<RawRowResponse>;
    return result.data.data.items[0];
  }

  public static async retrieveRowsAsJSON(
    dbName: string,
    tableName: string,
    params: RawListRowsParams = {}
  ): Promise<Row[]> {
    const result = (await retrieveRows(
      dbName,
      tableName,
      params,
      'application/json'
    )) as AxiosResponse<RawRowResponse>;
    return result.data.data.items;
  }

  public static async retrieveRowsAsCSV(
    dbName: string,
    tableName: string,
    params: RawListRowsParams = {}
  ): Promise<string> {
    const result = (await retrieveRows(
      dbName,
      tableName,
      params,
      'text/csv'
    )) as AxiosResponse<string>;
    return result.data;
  }

  public static async deleteDatabases(dbNames: string[]): Promise<void> {
    const url = `${rawUrl()}/delete`;
    const body = {
      items: dbNames.map(dbName => ({ dbName })),
    };
    await rawPost(url, { data: body });
  }

  public static async deleteTables(
    dbName: string,
    tableNames: string[]
  ): Promise<void> {
    const url = `${rawUrl()}/${encodeURIComponent(dbName)}/delete`;
    const body = {
      items: tableNames.map(tableName => ({ tableName })),
    };
    await rawPost(url, { data: body });
  }

  public static async deleteRows(
    dbName: string,
    tableName: string,
    rowKeys: string[]
  ): Promise<void> {
    const url = `${rawUrl()}/${encodeURIComponent(dbName)}/${encodeURIComponent(
      tableName
    )}/delete`;
    const body = {
      items: rowKeys.map(key => ({ key })),
    };
    await rawPost(url, { data: body });
  }

  public static async listDatabases(
    params?: RawListDatabasesParams
  ): Promise<string[]> {
    const url = rawUrl();
    const result = (await rawGet(url, { params })) as AxiosResponse<
      RawDatabaseResponse
    >;
    return result.data.data.items.map((item: Database) => item.dbName);
  }

  public static async listTables(
    dbName: string,
    params?: RawListTablesParams
  ): Promise<string[]> {
    const url = `${rawUrl()}/${encodeURIComponent(dbName)}`;
    const result = (await rawGet(url, { params })) as AxiosResponse<
      RawTableResponse
    >;
    return result.data.data.items.map((item: Table) => item.tableName);
  }
}

// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../autoPagination';
import { rawRequest } from '../axiosWrappers';
import { MetadataMap } from '../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveSingleEndpoint,
} from '../standardMethods';
import {
  ItemsResponse,
  ListRawDatabases,
  ListRawRows,
  ListRawTables,
  RawDB,
  RawDBRow,
  RawDBRowInsert,
  RawDBRowKey,
  RawDBTable,
} from '../types/types';
import { projectUrl } from '../utils';

export interface RawAPI {
  /**
   * [List databases](https://doc.cognitedata.com/api/v1/#operation/getDBs)
   *
   * ```js
   * const databases = await client.raw.listDatabases();
   * ```
   */
  listDatabases: (query?: ListRawDatabases) => CogniteAsyncIterator<RawDB>;

  /**
   * [Create databases](https://doc.cognitedata.com/api/v1/#operation/createDBs)
   *
   * ```js
   * const databases = await client.raw.createDatabases([{ name: 'My company' }]);
   * ```
   */
  createDatabases: (items: RawDB[]) => Promise<RawDB[]>;

  /**
   * [Delete databases](https://doc.cognitedata.com/api/v1/#operation/deleteDBs)
   *
   * ```js
   * await client.raw.deleteDatabases([{ name: 'My company' }]);
   */
  deleteDatabases: (items: RawDB[]) => Promise<{}>;

  /**
   * [List tables in database](https://doc.cognitedata.com/api/v1/#operation/getTables)
   *
   * ```js
   * const tables = await client.raw.listTables('My company');
   * ```
   */
  listTables: (
    databaseName: string,
    query?: ListRawTables
  ) => CogniteAsyncIterator<RawDBTable>;

  /**
   * [Create tables in a database](https://doc.cognitedata.com/api/v1/#operation/createTables)
   *
   * ```js
   * const tables = await client.raw.createTables('My company', [{ name: 'Customers' }]);
   * ```
   */
  createTables: (
    databaseName: string,
    items: RawDBTable[],
    // tslint:disable-next-line:bool-param-default
    ensureParent?: boolean
  ) => Promise<RawDBTable[]>;

  /**
   * [Delete tables in a database](https://doc.cognitedata.com/api/v1/#operation/deleteTables)
   *
   * ```js
   * await client.raw.deleteTables('My company', [{ name: 'Customers' }]);
   */
  deleteTables: (databaseName: string, items: RawDBTable[]) => Promise<{}>;

  /**
   * [List rows in a table](https://doc.cognitedata.com/api/v1/#operation/getRows)
   *
   * ```js
   * await client.raw.listRows('My company', [{ name: 'Customers' }]);
   */
  listRows: (
    databaseName: string,
    tableName: string,
    query?: ListRawRows
  ) => CogniteAsyncIterator<RawDBRow>;

  /**
   * [Insert rows into a table](https://doc.cognitedata.com/api/v1/#operation/postRows)
   *
   * ```js
   * await client.raw.insertRows('My company', 'Customers' [{ key: 'customer1', columns: { 'First name': 'Steve', 'Last name': 'Jobs' } }]);
   */
  insertRows: (
    databaseName: string,
    tableName: string,
    items: RawDBRowInsert[],
    // tslint:disable-next-line:bool-param-default
    ensureParent?: boolean
  ) => Promise<{}>;

  /**
   * [Retrieve a single row from a table](https://doc.cognitedata.com/api/v1/#operation/getRow)
   *
   * ```js
   * await client.raw.retrieveRow('My company', 'Customers', 'customer1');
   */
  retrieveRow: (
    databaseName: string,
    tableName: string,
    rowKey: string
  ) => Promise<RawDBRow>;

  /**
   * [Delete rows in a table](https://doc.cognitedata.com/api/v1/#operation/deleteRows)
   *
   * ```js
   * await client.raw.deleteRows('My company', 'Customers', [{key: 'customer1'}]);
   */
  deleteRows: (
    databaseName: string,
    tableName: string,
    items: RawDBRowKey[]
  ) => Promise<{}>;
}

/** @hidden */
export function generateRawObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): RawAPI {
  const path = projectUrl(project) + '/raw/dbs';
  const tablePath = (databaseName: string) =>
    `${path}/${encodeURIComponent(databaseName)}/tables`;
  const rowPath = (databaseName: string, tableName: string) =>
    `${tablePath(databaseName)}/${encodeURIComponent(tableName)}/rows`;
  return {
    listDatabases: generateListEndpoint(instance, path, map, false),
    createDatabases: generateCreateEndpoint(instance, path, map),
    deleteDatabases: generateDeleteEndpoint(instance, path, map),
    listTables: (databaseName, query) => {
      const endpoint = generateListEndpoint<ListRawTables, RawDBTable>(
        instance,
        tablePath(databaseName),
        map,
        false
      );
      return endpoint(query);
    },
    createTables: async (databaseName, items, ensureParent = false) => {
      type Response = ItemsResponse<RawDBTable>;
      const response = await rawRequest<Response>(instance, {
        method: 'post',
        url: tablePath(databaseName),
        data: { items },
        params: { ensureParent },
      });
      return map.addAndReturn(response.data.items, response);
    },
    deleteTables: (databaseName, items) => {
      const endpoint = generateDeleteEndpoint<RawDBTable>(
        instance,
        tablePath(databaseName),
        map
      );
      return endpoint(items);
    },
    listRows: (databaseName, tableName, query) => {
      const endpoint = generateListEndpoint<ListRawRows, RawDBRow>(
        instance,
        rowPath(databaseName, tableName),
        map,
        false
      );
      if (query && query.onlyRowKeys) {
        // @ts-ignore - we transform it
        return endpoint({ columns: ',' });
      }
      if (query && query.columns) {
        // @ts-ignore - we transform it
        return endpoint({ columns: query.columns.join(',') });
      }
      return endpoint();
    },
    insertRows: async (
      databaseName,
      tableName,
      items,
      ensureParent = false
    ) => {
      type Response = ItemsResponse<{}>;
      const response = await rawRequest<Response>(instance, {
        method: 'post',
        url: rowPath(databaseName, tableName),
        data: { items },
        params: { ensureParent },
      });
      return map.addAndReturn({}, response);
    },
    retrieveRow: (databaseName, tableName, rowKey) => {
      const endpoint = generateRetrieveSingleEndpoint<string, RawDBRow>(
        instance,
        rowPath(databaseName, tableName),
        map
      );
      return endpoint(rowKey);
    },
    deleteRows: (databaseName, tableName, items) => {
      const endpoint = generateDeleteEndpoint<RawDBRowKey>(
        instance,
        rowPath(databaseName, tableName),
        map
      );
      return endpoint(items);
    },
  };
}

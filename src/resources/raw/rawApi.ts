// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../../autoPagination';
import { rawRequest } from '../../axiosWrappers';
import { MetadataMap } from '../../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveSingleEndpoint,
} from '../../standardMethods';
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
} from '../../types/types';
import { projectUrl } from '../../utils';

export class RawAPI {
  /**
   * [List databases](https://doc.cognitedata.com/api/v1/#operation/getDBs)
   *
   * ```js
   * const databases = await client.raw.listDatabases();
   * ```
   */
  public listDatabases: RawListDatabasesEndpoint;

  /**
   * [Create databases](https://doc.cognitedata.com/api/v1/#operation/createDBs)
   *
   * ```js
   * const databases = await client.raw.createDatabases([{ name: 'My company' }]);
   * ```
   */
  public createDatabases: RawCreateDatabasesEndpoint;

  /**
   * [Delete databases](https://doc.cognitedata.com/api/v1/#operation/deleteDBs)
   *
   * ```js
   * await client.raw.deleteDatabases([{ name: 'My company' }]);
   * ```
   */
  public deleteDatabases: RawDeleteDatabasesEndpoint;
  private path: string;
  private instance: AxiosInstance;
  private map: MetadataMap;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    this.instance = instance;
    this.map = map;
    const path = (this.path = projectUrl(project) + '/raw/dbs');
    this.listDatabases = generateListEndpoint<ListRawDatabases, RawDB, RawDB>(
      instance,
      this.path,
      map,
      false,
      items => items
    );
    this.createDatabases = generateCreateEndpoint<RawDB, RawDB, RawDB>(
      instance,
      path,
      map,
      items => items
    );
    this.deleteDatabases = generateDeleteEndpoint(instance, path, map);
  }

  /**
   * [List tables in database](https://doc.cognitedata.com/api/v1/#operation/getTables)
   *
   * ```js
   * const tables = await client.raw.listTables('My company');
   * ```
   */
  public listTables: RawListTablesEndpoint = (databaseName, query) => {
    const endpoint = generateListEndpoint<
      ListRawTables,
      RawDBTable,
      RawDBTable
    >(
      this.instance,
      this.tablePath(databaseName),
      this.map,
      false,
      items => items
    );
    return endpoint(query);
  };

  /**
   * [Create tables in a database](https://doc.cognitedata.com/api/v1/#operation/createTables)
   *
   * ```js
   * const tables = await client.raw.createTables('My company', [{ name: 'Customers' }]);
   * ```
   */
  public createTables: RawCreateTablesEndpoint = async (
    databaseName,
    items,
    ensureParent = false
  ) => {
    type Response = ItemsResponse<RawDBTable>;
    const response = await rawRequest<Response>(this.instance, {
      method: 'post',
      url: this.tablePath(databaseName),
      data: { items },
      params: { ensureParent },
    });
    return this.map.addAndReturn(response.data.items, response);
  };

  /**
   * [Delete tables in a database](https://doc.cognitedata.com/api/v1/#operation/deleteTables)
   *
   * ```js
   * await client.raw.deleteTables('My company', [{ name: 'Customers' }]);
   * ```
   */
  public deleteTables: RawDeleteTablesEndpoint = (databaseName, items) => {
    const endpoint = generateDeleteEndpoint<RawDBTable>(
      this.instance,
      this.tablePath(databaseName),
      this.map
    );
    return endpoint(items);
  };

  /**
   * [List rows in a table](https://doc.cognitedata.com/api/v1/#operation/getRows)
   *
   * ```js
   * await client.raw.listRows('My company', [{ name: 'Customers' }]);
   * ```
   */
  public listRows: RawListRowsEndpoint = (databaseName, tableName, query) => {
    const endpoint = generateListEndpoint<ListRawRows, RawDBRow, RawDBRow>(
      this.instance,
      this.rowPath(databaseName, tableName),
      this.map,
      false,
      items => items
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
  };

  /**
   * [Insert rows into a table](https://doc.cognitedata.com/api/v1/#operation/postRows)
   *
   * ```js
   * await client.raw.insertRows('My company', 'Customers' [{ key: 'customer1', columns: { 'First name': 'Steve', 'Last name': 'Jobs' } }]);
   * ```
   */
  public insertRows: RawInsertRowsEndpoint = async (
    databaseName,
    tableName,
    items,
    ensureParent = false
  ) => {
    type Response = ItemsResponse<{}>;
    const response = await rawRequest<Response>(this.instance, {
      method: 'post',
      url: this.rowPath(databaseName, tableName),
      data: { items },
      params: { ensureParent },
    });
    return this.map.addAndReturn({}, response);
  };

  /**
   * [Retrieve a single row from a table](https://doc.cognitedata.com/api/v1/#operation/getRow)
   *
   * ```js
   * await client.raw.retrieveRow('My company', 'Customers', 'customer1');
   * ```
   */
  public retrieveRow: RawRetrieveRowEndpoint = (
    databaseName,
    tableName,
    rowKey
  ) => {
    const endpoint = generateRetrieveSingleEndpoint<string, RawDBRow>(
      this.instance,
      this.rowPath(databaseName, tableName),
      this.map
    );
    return endpoint(rowKey);
  };

  /**
   * [Delete rows in a table](https://doc.cognitedata.com/api/v1/#operation/deleteRows)
   *
   * ```js
   * await client.raw.deleteRows('My company', 'Customers', [{key: 'customer1'}]);
   * ```
   */
  public deleteRows: RawDeleteRowsEndpoint = async (
    databaseName,
    tableName,
    items
  ) => {
    const endpoint = generateDeleteEndpoint<RawDBRowKey>(
      this.instance,
      this.rowPath(databaseName, tableName),
      this.map
    );
    return endpoint(items);
  };

  private tablePath = (databaseName: string) =>
    `${this.path}/${encodeURIComponent(databaseName)}/tables`;
  private rowPath = (databaseName: string, tableName: string) =>
    `${this.tablePath(databaseName)}/${encodeURIComponent(tableName)}/rows`;
}

export type RawListDatabasesEndpoint = (
  query?: ListRawDatabases
) => CogniteAsyncIterator<RawDB>;

export type RawCreateDatabasesEndpoint = (items: RawDB[]) => Promise<RawDB[]>;

export type RawDeleteDatabasesEndpoint = (items: RawDB[]) => Promise<{}>;

export type RawListTablesEndpoint = (
  databaseName: string,
  query?: ListRawTables
) => CogniteAsyncIterator<RawDBTable>;

export type RawCreateTablesEndpoint = (
  databaseName: string,
  items: RawDBTable[],
  // tslint:disable-next-line:bool-param-default
  ensureParent?: boolean
) => Promise<RawDBTable[]>;

export type RawDeleteTablesEndpoint = (
  databaseName: string,
  items: RawDBTable[]
) => Promise<{}>;

export type RawListRowsEndpoint = (
  databaseName: string,
  tableName: string,
  query?: ListRawRows
) => CogniteAsyncIterator<RawDBRow>;

export type RawInsertRowsEndpoint = (
  databaseName: string,
  tableName: string,
  items: RawDBRowInsert[],
  // tslint:disable-next-line:bool-param-default
  ensureParent?: boolean
) => Promise<{}>;

export type RawRetrieveRowEndpoint = (
  databaseName: string,
  tableName: string,
  rowKey: string
) => Promise<RawDBRow>;

export type RawDeleteRowsEndpoint = (
  databaseName: string,
  tableName: string,
  items: RawDBRowKey[]
) => Promise<{}>;

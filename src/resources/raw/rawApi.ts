// Copyright 2019 Cognite AS

import { MetadataMap } from '../../metadata';
import { BaseResourceAPI } from '../../resources/baseResourceApi';
import { CursorAndAsyncIterator } from '../../standardMethods';
import {
  ListRawDatabases,
  ListRawRows,
  ListRawTables,
  RawDB,
  RawDBRow,
  RawDBRowInsert,
  RawDBRowKey,
  RawDBTable,
} from '../../types/types';
import { CDFHttpClient } from '../../utils/http/cdfHttpClient';
import { RawRowsAPI } from './rawRowsApi';
import { RawTablesAPI } from './rawTablesApi';

export class RawAPI extends BaseResourceAPI<RawDB> {
  private rawTablesApi: RawTablesAPI;
  private rawRowsApi: RawRowsAPI;
  /** @hidden */
  constructor(
    resourcePath: string,
    httpClient: CDFHttpClient,
    map: MetadataMap
  ) {
    super(resourcePath, httpClient, map);
    this.rawTablesApi = new RawTablesAPI(resourcePath, httpClient, map);
    this.rawRowsApi = new RawRowsAPI(resourcePath, httpClient, map);
  }

  /**
   * [Create databases](https://doc.cognitedata.com/api/v1/#operation/createDBs)
   *
   * ```js
   * const databases = await client.raw.createDatabases([{ name: 'My company' }]);
   * ```
   */
  public createDatabases = (items: RawDB[]): Promise<RawDB[]> => {
    return super.createEndpoint(items);
  };

  /**
   * [List databases](https://doc.cognitedata.com/api/v1/#operation/getDBs)
   *
   * ```js
   * const databases = await client.raw.listDatabases();
   * ```
   */
  public listDatabases = (
    scope?: ListRawDatabases
  ): CursorAndAsyncIterator<RawDB> => {
    return super.listEndpoint(this.callListEndpointWithGet, scope);
  };

  /**
   * [Delete databases](https://doc.cognitedata.com/api/v1/#operation/deleteDBs)
   *
   * ```js
   * await client.raw.deleteDatabases([{ name: 'My company' }]);
   * ```
   */
  public deleteDatabases = (
    items: RawDB[],
    params?: RawDatabaseDeleteParams
  ) => {
    return super.deleteEndpoint<RawDatabaseDeleteParams, RawDB>(items, params);
  };

  /**
   * [Create tables in a database](https://doc.cognitedata.com/api/v1/#operation/createTables)
   *
   * ```js
   * const tables = await client.raw.createTables('My company', [{ name: 'Customers' }]);
   * ```
   */
  public createTables = (
    databaseName: string,
    items: RawDBTable[],
    ensureParent: boolean = false
  ): Promise<RawDBTable[]> => {
    return this.rawTablesApi.create(databaseName, items, ensureParent);
  };

  /**
   * [List tables in database](https://doc.cognitedata.com/api/v1/#operation/getTables)
   *
   * ```js
   * const tables = await client.raw.listTables('My company');
   * ```
   */
  public listTables = (
    databaseName: string,
    scope?: ListRawTables
  ): CursorAndAsyncIterator<RawDBTable> => {
    return this.rawTablesApi.list(databaseName, scope);
  };

  /**
   * [Delete tables in a database](https://doc.cognitedata.com/api/v1/#operation/deleteTables)
   *
   * ```js
   * await client.raw.deleteTables('My company', [{ name: 'Customers' }]);
   * ```
   */
  public deleteTables = (
    databaseName: string,
    items: RawDBTable[]
  ): Promise<{}> => {
    return this.rawTablesApi.delete(databaseName, items);
  };

  /**
   * [Insert rows into a table](https://doc.cognitedata.com/api/v1/#operation/postRows)
   *
   * ```js
   * await client.raw.insertRows('My company', 'Customers', [{ key: 'customer1', columns: { 'First name': 'Steve', 'Last name': 'Jobs' } }]);
   * ```
   */
  public insertRows = (
    databaseName: string,
    tableName: string,
    items: RawDBRowInsert[],
    ensureParent: boolean = false
  ): Promise<{}> => {
    return this.rawRowsApi.insert(databaseName, tableName, items, ensureParent);
  };

  /**
   * [List rows in a table](https://doc.cognitedata.com/api/v1/#operation/getRows)
   *
   * ```js
   * await client.raw.listRows('My company', 'Employees', { columns: ['last_name'] });
   * ```
   */
  public listRows = (
    databaseName: string,
    tableName: string,
    query?: ListRawRows
  ): CursorAndAsyncIterator<RawDBRow> => {
    return this.rawRowsApi.list(databaseName, tableName, query);
  };

  /**
   * [Retrieve a single row from a table](https://doc.cognitedata.com/api/v1/#operation/getRow)
   *
   * ```js
   * await client.raw.retrieveRow('My company', 'Customers', 'customer1');
   * ```
   */
  public retrieveRow = (
    databaseName: string,
    tableName: string,
    rowKey: string
  ): Promise<RawDBRow> => {
    return this.rawRowsApi.retrieve(databaseName, tableName, rowKey);
  };

  /**
   * [Delete rows in a table](https://doc.cognitedata.com/api/v1/#operation/deleteRows)
   *
   * ```js
   * await client.raw.deleteRows('My company', 'Customers', [{key: 'customer1'}]);
   * ```
   */
  public deleteRows = (
    databaseName: string,
    tableName: string,
    items: RawDBRowKey[]
  ): Promise<{}> => {
    return this.rawRowsApi.delete(databaseName, tableName, items);
  };
}

export interface RawDatabaseDeleteParams {
  recursive?: boolean;
}

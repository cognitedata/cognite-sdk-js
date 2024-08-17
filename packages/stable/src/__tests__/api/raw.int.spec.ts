// Copyright 2020 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { RawDB, RawDBTable } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

let index = 0;
const createName = (prefix: string) => `${prefix}_${index++}_${randomInt()}`;
const createDb = () => ({ name: createName('Database') });
const createTable = () => ({ name: createName('Table') });
const getNamesOnly = (dbs: (RawDB | RawDBTable)[]) =>
  dbs.map(({ name }) => ({ name }));

const columns = {
  'First name': createName('firstName'),
  'Last name': createName('lastName'),
  timestamp: Date.now(),
  object: { a: { b: 1 } },
};
const createRow = () => ({
  key: createName('key'),
  columns,
});

describe('Raw integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  describe('databases', () => {
    let databases: RawDB[];
    test('create', async () => {
      const databasesToCreate = [createDb(), createDb()];
      databases = await client.raw.createDatabases(databasesToCreate);
      expect(getNamesOnly(databases)).toEqual(databasesToCreate);
      expect(databases[0].createdTime).toBeDefined();
    });

    test('list', async () => {
      const result = await client.raw
        .listDatabases()
        .autoPagingToArray({ limit: 2 });
      expect(result.length).toBe(2);
      expect(result[0].name).toBeDefined();
    });

    test('delete', async () => {
      await client.raw.deleteDatabases(databases);
    });
  });

  describe('tables', () => {
    let database: RawDB;
    beforeAll(async () => {
      [database] = await client.raw.createDatabases([createDb()]);
    });
    afterAll(async () => {
      await client.raw.deleteDatabases([database]);
    });

    let tables: RawDBTable[];
    test('create', async () => {
      const tablesToCreate = [createTable(), createTable()];
      tables = await client.raw.createTables(database.name, tablesToCreate);
      expect(getNamesOnly(tables)).toEqual(tablesToCreate);
      expect(tables[0].createdTime).toBeDefined();
    });

    test('list', async () => {
      const result = await client.raw
        .listTables(database.name)
        .autoPagingToArray({ limit: 2 });
      expect(result.length).toBe(2);
      expect(result[0].name).toBeDefined();
    });

    test('delete', async () => {
      await client.raw.deleteTables(database.name, tables);
    });

    test('ensureParent', async () => {
      const tmpDatabase = createDb();
      const tmpTable = createTable();
      await client.raw.createTables(tmpDatabase.name, [tmpTable], true);
      await expect(client.raw.deleteDatabases([tmpDatabase])).rejects.toThrow();
      // clean up
      await client.raw.deleteDatabases([tmpDatabase], { recursive: true });
    });
  });

  describe('rows', () => {
    let database: RawDB;
    let table: RawDBTable;
    beforeAll(async () => {
      [database] = await client.raw.createDatabases([createDb()]);
      [table] = await client.raw.createTables(database.name, [createTable()]);
    });
    afterAll(async () => {
      await client.raw.deleteDatabases([database], { recursive: true });
    });

    const rows = [createRow(), createRow()];
    test('insert', async () => {
      const result = await client.raw.insertRows(
        database.name,
        table.name,
        rows,
      );
      expect(result).toEqual({});
    });

    test('list only row keys', async () => {
      const result = await client.raw
        .listRows(database.name, table.name, {
          onlyRowKeys: true,
        })
        .autoPagingToArray({ limit: 2 });
      expect(result.length).toBe(2);
      expect(result[0].key).toBeDefined();
      expect(result[0].key.length).toBeGreaterThan(0);
      expect(result[0].columns).toEqual({});
    });

    test('list with limit', async () => {
      const { items } = await client.raw.listRows(database.name, table.name, {
        limit: 1,
      });
      expect(items.length).toBe(1);
    });

    test('list all columns', async () => {
      const result = await client.raw
        .listRows(database.name, table.name)
        .autoPagingToArray({ limit: 2 });
      expect(result.length).toBe(2);
      expect(result[0].key).toBeDefined();
      expect(result[0].key.length).toBeGreaterThan(0);
      const columnName = Object.keys(rows[0].columns)[0];
      expect(result[0].columns[columnName]).toBeDefined();
    });

    test('list custom columns', async () => {
      const result = await client.raw
        .listRows(database.name, table.name, { columns: ['First name'] })
        .autoPagingToArray({ limit: 2 });
      expect(result.length).toBe(2);
      expect(result[0].key).toBeDefined();
      expect(result[0].key.length).toBeGreaterThan(0);
      expect(Object.keys(result[0].columns).length).toBe(1);
    });

    test('retrieve a row', async () => {
      const row = await client.raw.retrieveRow(
        database.name,
        table.name,
        rows[0].key,
      );
      expect(row.lastUpdatedTime).toBeInstanceOf(Date);
      expect(row).toEqual({
        ...rows[0],
        lastUpdatedTime: row.lastUpdatedTime,
      });
    });

    test('delete', async () => {
      const result = await client.raw.deleteRows(database.name, table.name, [
        { key: rows[0].key },
      ]);
      expect(result).toEqual({});
    });

    test('ensureParent', async () => {
      const tmpDatabase = createDb();
      const tmpTable = createTable();
      const tmpRow = createRow();
      await client.raw.insertRows(
        tmpDatabase.name,
        tmpTable.name,
        [tmpRow],
        true,
      );
      await expect(client.raw.deleteDatabases([tmpDatabase])).rejects.toThrow();
      // clean up
      await client.raw.deleteDatabases([tmpDatabase], { recursive: true });
    });
  });
});

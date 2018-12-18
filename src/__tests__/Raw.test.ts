// Copyright 2018 Cognite AS

import { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { instance, Raw, Row } from '../index';

let mock: MockAdapter;

beforeAll(() => {
  mock = new MockAdapter(instance);
});

afterAll(() => {
  mock.restore();
});

afterEach(() => {
  // cleaning up the mess left behind the previous test
  mock.reset();
});

const rows: Row[] = [
  {
    key: 'first row',
    columns: {
      column1: 'Some data',
      column2: 'Some other data',
    },
  },
  {
    key: 'row 2',
    columns: {
      column1: 'Some data...',
      column2: 'Some other data...',
    },
  },
];

describe('Raw', () => {
  test('create databases', async () => {
    const dbNames = ['cognite 1', 'cognite 2'];
    mock
      .onPost(/\/raw\/create$/, {
        items: dbNames.map(dbName => ({ dbName })),
      })
      .reply(200, {
        data: {
          items: dbNames.map(dbName => ({ dbName })),
        },
      });
    await Raw.createDatabases(dbNames);
  });

  test('create tables', async () => {
    const dbName = 'cognite 1';
    const tableNames = ['table 1', 'table 2'];
    const reg = new RegExp(`/raw/${encodeURIComponent(dbName)}/create$`);
    mock
      .onPost(reg, {
        items: tableNames.map(tableName => ({ tableName })),
      })
      .reply(200, {
        data: {
          items: tableNames.map(tableName => ({ tableName })),
        },
      });
    await Raw.createTables(dbName, tableNames);
  });

  test('insert rows', async () => {
    const params = {
      ensureParent: true,
    };
    const dbName = 'cognite 1';
    const tableName = 'table 1!';
    const reg = new RegExp(
      `/raw/${encodeURIComponent(dbName)}/${encodeURIComponent(
        tableName
      )}/create$`
    );
    mock
      .onPost(reg, {
        items: rows,
      })
      .reply((config: AxiosRequestConfig) => {
        if (config.params.ensureParent !== true) {
          return [404, {}];
        }
        return [200, {}];
      });
    await Raw.insertRows(dbName, tableName, rows, params);
  });

  test('retrieve single row', async () => {
    const dbName = 'cognite 1';
    const tableName = 'table 1';
    const rowKey = rows[1].key;
    const reg = new RegExp(
      `/raw/${encodeURIComponent(dbName)}/${encodeURIComponent(
        tableName
      )}/${encodeURIComponent(rowKey)}$`
    );
    mock.onGet(reg).reply(200, {
      data: {
        items: [rows[0]],
      },
    });
    const result = await Raw.retrieveRow(dbName, tableName, rowKey);
    expect(result).toEqual(rows[0]);
  });

  test('retrieve all rows as CSV', async () => {
    const dbName = 'cognite 1';
    const tableName = 'table 1';
    const reg = new RegExp(
      `/raw/${encodeURIComponent(dbName)}/${encodeURIComponent(tableName)}$`
    );
    const csv = '"key","abc"\nrow2,13\n';
    mock.onGet(reg).reply((config: AxiosRequestConfig) => {
      if (config.headers.Accept !== 'text/csv') {
        return [404];
      }
      if (config.params.limit !== 2) {
        return [404];
      }
      if (config.params.cursor !== 'abc') {
        return [404];
      }
      if (config.params.columns !== 'first,second') {
        return [404];
      }
      return [200, csv];
    });
    const result = await Raw.retrieveRowsAsCSV(dbName, tableName, {
      limit: 2,
      cursor: 'abc',
      columns: ['first', 'second'],
    });
    expect(result).toEqual(csv);
  });

  test('retrieve all rows as JSON', async () => {
    const dbName = 'cognite 1';
    const tableName = 'table 1';
    const reg = new RegExp(
      `/raw/${encodeURIComponent(dbName)}/${encodeURIComponent(tableName)}$`
    );
    mock.onGet(reg).reply((config: AxiosRequestConfig) => {
      if (config.headers.Accept !== 'application/json') {
        return [404];
      }
      if (config.params.limit !== 2) {
        return [404];
      }
      if (config.params.cursor !== 'abc') {
        return [404];
      }
      if (config.params.columns !== 'first,second') {
        return [404];
      }
      return [
        200,
        {
          data: {
            items: rows,
          },
        },
      ];
    });
    const result = await Raw.retrieveRowsAsJSON(dbName, tableName, {
      limit: 2,
      cursor: 'abc',
      columns: ['first', 'second'],
    });
    expect(result).toEqual(rows);
  });

  test('delete databases', async () => {
    const dbNames = ['cognite 1', 'cognite2'];
    mock
      .onPost(/\/raw\/delete$/, {
        items: dbNames.map(dbName => ({ dbName })),
      })
      .reply(200, {});
    await Raw.deleteDatabases(dbNames);
  });

  test('delete tables', async () => {
    const dbName = 'cognite 1';
    const tableNames = ['table 1', 'table 2'];
    const reg = new RegExp(`/raw/${encodeURIComponent(dbName)}/delete$`);
    mock
      .onPost(reg, {
        items: tableNames.map(tableName => ({ tableName })),
      })
      .reply(200, {});
    await Raw.deleteTables(dbName, tableNames);
  });

  test('delete rows', async () => {
    const dbName = 'cognite 1';
    const tableName = 'table 1';
    const reg = new RegExp(
      `/raw/${encodeURIComponent(dbName)}/${encodeURIComponent(
        tableName
      )}/delete$`
    );
    mock
      .onPost(reg, {
        items: rows.map(row => ({ key: row.key })),
      })
      .reply(200, {});
    await Raw.deleteRows(dbName, tableName, rows.map(row => row.key));
  });

  test('list all databases', async () => {
    mock
      .onGet(/\/raw$/, {
        params: { limit: 3, cursor: 'abc' },
      })
      .reply(200, {
        data: {
          items: [{ dbName: 'first' }, { dbName: 'second' }],
        },
      });
    const result = await Raw.listDatabases({ limit: 3, cursor: 'abc' });
    expect(result).toEqual(['first', 'second']);
  });

  test('list all tables', async () => {
    const dbName = 'cognite 1';
    const reg = new RegExp(`/raw/${encodeURIComponent(dbName)}$`);
    mock
      .onGet(reg, {
        params: { limit: 3, cursor: 'abc' },
      })
      .reply(200, {
        data: {
          items: [{ tableName: 'first' }, { tableName: 'second' }],
        },
      });
    const result = await Raw.listTables(dbName, { limit: 3, cursor: 'abc' });
    expect(result).toEqual(['first', 'second']);
  });
});

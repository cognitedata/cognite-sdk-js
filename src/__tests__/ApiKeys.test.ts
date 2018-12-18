// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { ApiKeys, instance } from '../index';

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

describe('ApiKeys', () => {
  test('create api keys', async () => {
    const generatedApiKeys = [
      {
        value: 'def2OGRjMmQtYI3Ny00OWVlLNDAtYzdda3YzI3YjY5',
        id: 232523307275,
        userId: 3,
        createdTime: 1540283929314,
        status: 'ACTIVE',
      },
      {
        value: 'abc2OGRjMmQtY20OWVlLTlkfaaNDtYzg1MGU3YzIjY5',
        id: 232523307275,
        userId: 4,
        createdTime: 1540283929314,
        status: 'ACTIVE',
      },
    ];
    mock
      .onPost(/\/apikeys$/, {
        items: [{ userId: 3 }, { userId: 4 }],
      })
      .reply(200, {
        data: {
          items: generatedApiKeys,
        },
      });
    const result = await ApiKeys.create([3, 4]);
    expect(result).toEqual(generatedApiKeys);
  });

  test('delete api keys', async () => {
    mock
      .onPost(/\/apikeys\/delete$/, {
        items: [3, 4],
      })
      .reply(200, {});
    await ApiKeys.delete([3, 4]);
  });

  test('list api keys', async () => {
    const apiKeys = [
      {
        id: 232523307275,
        userId: 3,
        createdTime: 1540283929314,
        status: 'ACTIVE',
      },
      {
        id: 6829447805944,
        userId: 4,
        createdTime: 1539951631927,
        status: 'ACTIVE',
      },
    ];

    const params = {
      all: true,
      userId: 3,
      includeDeleted: true,
    };
    mock.onGet(/\/apikeys$/, { params }).reply(200, {
      data: {
        items: apiKeys,
      },
    });
    const result = await ApiKeys.list(params);
    expect(result).toEqual(apiKeys);
  });
});

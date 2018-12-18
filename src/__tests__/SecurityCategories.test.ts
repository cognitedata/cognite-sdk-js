// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { instance, SecurityCategories, Securitycategory } from '../index';

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

const securityCategories: Securitycategory[] = [
  {
    name: 'first category',
    id: 123,
  },
  {
    name: 'second category',
    id: 456,
  },
];

describe('Security categories', () => {
  test('create security categories', async () => {
    mock
      .onPost(/\/securitycategories$/, {
        items: securityCategories.map(item => ({ name: item.name })),
      })
      .reply(200, {
        data: {
          items: securityCategories,
        },
      });
    const result = await SecurityCategories.create(
      securityCategories.map(item => item.name)
    );
    expect(result).toEqual(securityCategories);
  });

  test('delete security categories', async () => {
    mock
      .onPost(/\/securitycategories\/delete$/, {
        items: securityCategories.map(item => item.id),
      })
      .reply(200, {});
    await SecurityCategories.delete(securityCategories.map(item => item.id));
  });

  test('list security categories', async () => {
    const params = {
      sort: 'ASC',
      cursor: 'crs',
      limit: 123,
    };
    const previousCursor = 'z7w7dRasAxURbBDEbNovh3AqV5HG-U0EQFjOSUuTHwQ';
    const nextCursor = 'KRAug0mIb7VIqURPDa5Yh5wQKU3rV66KlVhYuQdCwc0';
    mock
      .onGet(/\/securitycategories$/, {
        params,
      })
      .reply(200, {
        data: {
          previousCursor,
          nextCursor,
          items: securityCategories,
        },
      });
    const result = await SecurityCategories.list(params);
    expect(result).toEqual({
      previousCursor,
      nextCursor,
      items: securityCategories,
    });
  });
});

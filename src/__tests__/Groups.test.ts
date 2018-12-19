// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { Group, Groups, instance } from '../index';

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

const groups: Group[] = [
  {
    id: 65786047556978,
    isDeleted: false,
    name: 'Test name',
    source: 'sourceStr',
    sourceId: 'sourceId',
    permissions: {
      accessTypes: ['READ'],
      assetIds: [123],
      securityCategoryIds: [456],
    },
  },
];

const requestGroups: Partial<Group>[] = [
  {
    name: 'Test name',
    source: 'sourceStr',
    sourceId: 'sourceId',
    permissions: {
      accessTypes: ['READ'],
      assetIds: [123],
      securityCategoryIds: [456],
    },
  },
];

describe('Groups', () => {
  test('create groups', async () => {
    mock
      .onPost(/\/groups$/, {
        items: requestGroups,
      })
      .reply(200, {
        data: {
          items: groups,
        },
      });
    const result = await Groups.create(requestGroups);
    expect(result).toEqual(groups);
  });

  test('delete groups', async () => {
    mock
      .onPost(/\/groups\/delete$/, {
        items: [123, 456],
      })
      .reply(200, {});
    await Groups.delete([123, 456]);
  });

  test('list groups', async () => {
    mock
      .onGet(/\/groups$/, {
        params: { all: true },
      })
      .reply(200, {
        data: {
          items: groups,
        },
      });
    const result = await Groups.list({ all: true });
    expect(result).toEqual(groups);
  });

  test('list users in group', async () => {
    const users = [
      {
        uniqueName: 'f1@cognite.com',
        groups: [12345, 54321],
        id: 314159265,
        isDeleted: true,
        deletedTime: 31415,
      },
    ];
    mock.onGet(/\/groups\/12345\/users$/).reply(200, {
      data: {
        items: users,
      },
    });
    const result = await Groups.listUsers(12345);
    expect(result).toEqual(users);
  });

  test('add user to group', async () => {
    mock
      .onPost(/\/groups\/12345\/users$/, {
        items: [{ id: 123 }, { id: 456 }],
      })
      .reply(200, {});
    await Groups.addUsers(12345, [123, 456]);
  });

  test('remove user from group', async () => {
    mock
      .onPost(/\/groups\/12345\/users\/remove$/, {
        items: [123, 456],
      })
      .reply(200, {});
    await Groups.removeUsers(12345, [123, 456]);
  });
});

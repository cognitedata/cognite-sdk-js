// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { instance, User, Users } from '../index';

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

const users: User[] = [
  {
    id: 2216036744518,
    isDeleted: false,
    uniqueName: 'f2@cognite.com',
  },
  {
    id: 86387845434305,
    isDeleted: false,
    uniqueName: 'admin@cognite.com',
    groups: [123, 456],
  },
];

const requestUsers: Partial<User>[] = [
  { uniqueName: 'f2@cognite.com' },
  {
    uniqueName: 'admin@cognite.com',
    groups: [123, 456],
  },
];

describe('Users', () => {
  test('create users', async () => {
    mock
      .onPost(/\/users$/, {
        items: requestUsers,
      })
      .reply(200, {
        data: {
          items: users,
        },
      });
    const result = await Users.create(requestUsers);
    expect(result).toEqual(users);
  });

  test('delete users', async () => {
    mock
      .onPost(/\/users\/delete$/, {
        items: users.map(user => user.id),
      })
      .reply(200, {});
    await Users.delete(users.map(user => user.id as number));
  });

  test('list all users', async () => {
    mock.onGet(/\/users$/).reply(200, {
      data: {
        items: users,
      },
    });
    const result = await Users.list();
    expect(result).toEqual(users);
  });
});

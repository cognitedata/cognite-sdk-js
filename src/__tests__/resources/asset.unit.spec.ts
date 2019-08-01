// Copyright 2019 Cognite AS
import MockAdapter from 'axios-mock-adapter';
import { CogniteClient } from '../..';
import { Asset } from '../../resources/classes/asset';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Asset class unit test', () => {
  let axiosMock: MockAdapter;
  let client: CogniteClient;
  beforeAll(() => {
    client = setupLoggedInClient();
    axiosMock = new MockAdapter(client.instance);
  });
  beforeEach(() => {
    axiosMock.reset();
  });

  test('children', async () => {
    const newRoot = {
      externalId: 'test-root' + randomInt(),
      id: 1,
      name: 'root',
    };
    const childArray = [];
    for (let index = 0; index < 50; index++) {
      childArray.push({
        parentExternalId: newRoot.externalId,
        name: 'child' + index,
      });
    }
    axiosMock
      .onPost(new RegExp('/assets$'), {
        items: [newRoot, ...childArray],
      })
      .replyOnce(200, {
        items: [newRoot, ...childArray],
      });
    axiosMock
      .onPost(new RegExp('/assets/list$'), {
        filter: {
          parentIds: [newRoot.id],
        },
      })
      .replyOnce(200, { items: childArray });
    const createdAssets = await client.assets.create([newRoot, ...childArray]);
    const children = await createdAssets[0].children();
    expect(children.length).toBe(50);
    expect(children[0]).toBeInstanceOf(Asset);
    expect(children[0].name).toEqual(childArray[0].name);
  });
});

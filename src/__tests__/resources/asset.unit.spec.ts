// Copyright 2019 Cognite AS
import MockAdapter from 'axios-mock-adapter';
import { CogniteClient } from '../..';
import { Asset } from '../../resources/classes/asset';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Asset class unit test', () => {
  let axiosMock: MockAdapter;
  let client: CogniteClient;
  let newRoot: any;
  let childArray: any[];
  let newGrandChild: any;
  beforeAll(() => {
    client = setupLoggedInClient();
    axiosMock = new MockAdapter(client.instance);
  });
  beforeEach(() => {
    axiosMock.reset();
    newRoot = {
      externalId: 'test-root' + randomInt(),
      name: 'root',
      id: 1,
    };
    childArray = [];
    for (let index = 0; index < 102; index++) {
      childArray.push({
        externalId: 'test-child' + randomInt() + index,
        parentExternalId: newRoot.externalId,
        name: 'child' + index,
      });
    }
    newGrandChild = {
      externalId: 'test-grandchild' + randomInt(),
      name: 'grandchild',
      parentExternalId: childArray[0].externalId,
    };
  });

  test('children', async () => {
    axiosMock
      .onPost(new RegExp('/assets$'), {
        items: [newRoot, ...childArray],
      })
      .replyOnce(200, {
        items: [newRoot, ...childArray],
      });
    axiosMock
      // tslint:disable-next-line:no-duplicate-string
      .onPost(new RegExp('/assets/list$'), {
        filter: {
          parentIds: [newRoot.id],
        },
      })
      .replyOnce(200, { items: childArray });
    const createdAssets = await client.assets.create([newRoot, ...childArray]);
    const children = await createdAssets[0].children();
    expect(children.length).toBe(102);
    expect(children[0]).toBeInstanceOf(Asset);
    expect(children[0].name).toEqual(childArray[0].name);
  });

  test.only('subtree', async () => {
    axiosMock
      .onPost(new RegExp('/assets$'), {
        items: [newRoot, childArray[0], newGrandChild],
      })
      .replyOnce(200, {
        items: [newRoot, childArray[0], newGrandChild],
      });
    const createdAssets = await client.assets.create([
      newRoot,
      childArray[0],
      newGrandChild,
    ]);
    axiosMock
      .onPost(new RegExp('/assets/byids$'), {
        items: [{ id: newRoot.id }],
      })
      .replyOnce(200, { items: [createdAssets[0]] });
    axiosMock
      .onPost(new RegExp('/assets/list$'), {
        filter: {
          parentIds: [newRoot.id],
        },
      })
      .replyOnce(200, {
        items: childArray[0],
      });
    axiosMock
      .onPost(new RegExp('/assets/list$'), {
        filter: {
          parentIds: [childArray[0].id],
        },
      })
      .replyOnce(200, {
        items: [newGrandChild],
      });

    expect(createdAssets).toHaveLength(3);
    const fullSubtree = await createdAssets[0].subtree({ depth: 2 });
    expect(fullSubtree).toHaveLength(3);
  });
});

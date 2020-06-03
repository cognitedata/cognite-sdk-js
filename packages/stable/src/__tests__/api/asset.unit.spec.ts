// Copyright 2020 Cognite AS
import { mockBaseUrl, randomInt } from '@cognite/sdk-core/testUtils';
import * as nock from 'nock';
import { Asset } from '../../api/classes/asset';
import CogniteClient from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Asset class unit test', () => {
  let client: CogniteClient;
  let newRoot: any;
  let childArray: any[];
  beforeAll(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });
  beforeEach(() => {
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
  });
  test('children', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/assets'), {
        items: [newRoot, ...childArray],
      })
      .once()
      .reply(200, {
        items: [newRoot, ...childArray],
      });

    nock(mockBaseUrl)
      .post(new RegExp('/assets/list'), {
        filter: {
          parentIds: [newRoot.id],
        },
      })
      .once()
      .reply(200, { items: childArray });
    const createdAssets = await client.assets.create([newRoot, ...childArray]);
    const children = await createdAssets[0].children();
    expect(children.length).toBe(102);
    expect(children[0]).toBeInstanceOf(Asset);
    expect(children[0].name).toEqual(childArray[0].name);
  });
});

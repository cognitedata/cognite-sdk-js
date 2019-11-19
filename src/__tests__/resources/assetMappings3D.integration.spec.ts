// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('AssetMappings3D integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('list with wrong intersectsBoundingBox query fails', async () => {
    await expect(
      client.assetMappings3D.list(1, 1, {
        intersectsBoundingBox: { min: [], max: [] },
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"max and min must have length 3 | code: 400"`
    );
  });
});

// Copyright 2019 Cognite AS

import { createClientWithApiKey } from '../index';

describe('createClientWithApiKey - integration', () => {
  test('handle non-exisiting api-key', async () => {
    const client = createClientWithApiKey({
      project: 'cognitesdk-js',
      apiKey: 'non-exisiting-api-key',
    });
    await expect(
      client.assets.list({ limit: 1 }).autoPagingToArray({ limit: 1 })
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"Unauthorized | code: 401"`);
  });
});

// Copyright 2020 Cognite AS

import type { ViewReference } from '@cognite/sdk-stable';
import nock from 'nock';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('instances unit tests', () => {
  const view: ViewReference = {
    externalId: 'Describable',
    space: 'cdf_core',
    type: 'view',
    version: 'v1',
  };

  beforeAll(async () => {
    nock.cleanAll();
  });

  test('search operator warning should be logged the first time making a search request with default operator', async () => {
    const freshClient = setupMockableClient();
    const warnMock = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    nock(mockBaseUrl)
      .persist()
      .post(/\/models\/instances\/search/)
      .reply(200, { items: [] });
    await freshClient.instances.search({
      view,
      limit: 1,
    });
    await freshClient.instances.search({
      view,
      limit: 1,
    });

    expect(warnMock).toHaveBeenCalledTimes(1);
  });

  test('search operator warning should not be logged if explicitly setting operator', async () => {
    const freshClient = setupMockableClient();
    const warnMock = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    nock(mockBaseUrl)
      .persist()
      .post(/\/models\/instances\/search/)
      .reply(200, { items: [] });
    await freshClient.instances.search({
      view,
      operator: 'OR',
      limit: 1,
    });

    expect(warnMock).not.toHaveBeenCalled();
  });
});

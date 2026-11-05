// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import type { DataDomain } from '../../types';
import { setupMockableClient } from '../testUtils';

describe('Data domains API unit tests', () => {
  let client: CogniteClientAlpha;
  const basePath = /\/api\/v1\/projects\/[^/]+\/datadomains$/;
  const domains: DataDomain[] = [
    { externalId: 'domain-a', name: 'Domain A', description: 'First' },
    { externalId: 'domain-b', name: 'Domain B' },
  ];

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(basePath, matches({ items: [domains[0]] }))
      .matchHeader('cdf-version', '20230101-alpha')
      .once()
      .reply(201, { items: [domains[0]] });

    const created = await client.dataDomains.create([domains[0]]);
    expect(created).toEqual([domains[0]]);
  });

  test('list with pagination', async () => {
    nock(mockBaseUrl)
      .get(/\/datadomains/)
      .query({ limit: 1 })
      .once()
      .reply(200, { items: [domains[0]], nextCursor: 'next' });
    nock(mockBaseUrl)
      .get(/\/datadomains/)
      .query({ limit: 1, cursor: 'next' })
      .once()
      .reply(200, { items: [domains[1]] });

    const all = await client.dataDomains.list({ limit: 1 }).autoPagingToArray();
    expect(all).toEqual(domains);
    expect(nock.isDone()).toBe(true);
  });

  test('retrieve', async () => {
    const ids = domains.map(({ externalId }) => ({ externalId }));
    nock(mockBaseUrl)
      .post(/\/datadomains\/byids/, { items: ids })
      .once()
      .reply(200, { items: domains });

    const retrieved = await client.dataDomains.retrieve(ids);
    expect(retrieved).toEqual(domains);
  });

  test('update', async () => {
    const change = {
      externalId: 'domain-a',
      update: { name: { set: 'Renamed' }, description: { setNull: true } },
    };
    const updated = { externalId: 'domain-a', name: 'Renamed' };
    nock(mockBaseUrl)
      .post(/\/datadomains\/update/, { items: [change] })
      .once()
      .reply(200, { items: [updated] });

    const response = await client.dataDomains.update([change]);
    expect(response).toEqual([updated]);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/datadomains\/delete/, { items: [{ externalId: 'domain-a' }] })
      .once()
      .reply(200, {});

    const response = await client.dataDomains.delete([
      { externalId: 'domain-a' },
    ]);
    expect(response).toEqual({});
  });
});

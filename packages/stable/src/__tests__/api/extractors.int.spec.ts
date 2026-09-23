// Copyright 2026 Cognite AS

import { describe, expect, it } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('extractors api', () => {
  const client: CogniteClient = setupLoggedInClient();

  it('list extractors', async () => {
    const response = await client.extractors.list();
    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[0].name).toBeDefined();
    expect(response.items[0].type).toBeDefined();
  });

  it('list source systems', async () => {
    const response = await client.extractors.sourceSystems.list();
    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[0].name).toBeDefined();
  });

  it('list solutions', async () => {
    const response = await client.extractors.solutions.list();
    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[0].sourceSystemExternalId).toBeDefined();
  });

  it('retrieve extractor by external id', async () => {
    const listResponse = await client.extractors.list();
    const extractor = listResponse.items[0];

    const retrieved = await client.extractors.retrieve([
      { externalId: extractor.externalId },
    ]);
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].externalId).toBe(extractor.externalId);
  });
});

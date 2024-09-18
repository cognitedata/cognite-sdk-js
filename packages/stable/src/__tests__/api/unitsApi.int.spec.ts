// Copyright 2023 Cognite AS

import { describe, expect, it } from 'vitest';
import type CogniteClientBeta from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('units api', () => {
  const client: CogniteClientBeta = setupLoggedInClient();

  it('list unit systems', async () => {
    const response = await client.units.listUnitSystems();
    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items[0].name).toBeDefined();
  });

  it('list units', async () => {
    const response = await client.units.list();
    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items[0].externalId).toBeDefined();
  });

  it('retrieve units', async () => {
    const response = await client.units.retrieve([
      { externalId: 'temperature:deg_c' },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe('temperature:deg_c');
  });
});

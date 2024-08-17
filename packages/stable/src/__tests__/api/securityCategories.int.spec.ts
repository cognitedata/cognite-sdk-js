// Copyright 2020 Cognite AS

import { beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { SecurityCategory } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Security categories integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  let securityCategories: SecurityCategory[];

  test('create', async () => {
    const securityCategoriesToCreate = [
      { name: `Security category 1 ${randomInt()}` },
      { name: `Security category 2 ${randomInt()}` },
    ];
    securityCategories = await client.securityCategories.create(
      securityCategoriesToCreate,
    );
    expect(securityCategories.length).toBe(securityCategoriesToCreate.length);
    expect(securityCategories[0].name).toBeDefined();
    expect(securityCategories[0].id).toBeDefined();
  });

  test('list', async () => {
    const response = await client.securityCategories
      .list()
      .autoPagingToArray({ limit: 2 });
    expect(response.length).toBe(2);
    expect(response[0].id).toBeDefined();
    expect(response[0].name).toBeDefined();
  });

  test('delete', async () => {
    const response = await client.securityCategories.delete(
      securityCategories.map((category) => category.id),
    );
    expect(response).toEqual({});
  });
});

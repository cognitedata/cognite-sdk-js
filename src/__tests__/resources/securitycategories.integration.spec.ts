// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import { SecurityCategory } from '../../types/types';
import { setupClient } from '../testUtils';

describe('Security categories integration test', async () => {
  let client: API;
  beforeAll(async () => {
    client = await setupClient();
  });
  let securityCategories: SecurityCategory[];

  test('create', async () => {
    const securityCategoriesToCreate = [
      { name: 'Security category 1 ' + new Date().getTime() },
      { name: 'Security category 2 ' + new Date().getTime() },
    ];
    securityCategories = await client.securitycategories.create(
      securityCategoriesToCreate
    );
    expect(securityCategories.length).toBe(securityCategoriesToCreate.length);
    expect(securityCategories[0].name).toBe(securityCategoriesToCreate[0].name);
    expect(securityCategories[0].id).toBeDefined();
  });

  test('list', async () => {
    const response = await client.securitycategories
      .list()
      .autoPagingToArray({ limit: 2 });
    expect(response.length).toBe(2);
    expect(response[0].id).toBeDefined();
    expect(response[0].name).toBeDefined();
  });

  test('delete', async () => {
    const response = await client.securitycategories.delete(
      securityCategories.map(category => category.id)
    );
    expect(response).toEqual({});
  });
});

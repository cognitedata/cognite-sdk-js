// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import { setupClient } from '../testUtils';

describe('Projects integration test', async () => {
  let client: API;
  beforeAll(async () => {
    jest.setTimeout(15000);
    client = await setupClient();
  });

  test('retrieve', async () => {
    const projectInfo = await client.projects.retrieve(client.project);
    expect(projectInfo.name).toBeDefined();
    expect(projectInfo.name.length).toBeGreaterThan(0);
    expect(projectInfo.urlName).toBe(client.project);
  });

  test('update', () => {
    // no tests because endpoint is overriding config
  });
});

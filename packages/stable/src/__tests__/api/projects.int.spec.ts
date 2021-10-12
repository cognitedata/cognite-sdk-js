// Copyright 2020 Cognite AS

import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('Projects integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('retrieve', async () => {
    const projectInfo = await client.projects.retrieve(client.project);
    expect(projectInfo.name).toBeDefined();
    expect(projectInfo.name.length).toBeGreaterThan(0);
    expect(projectInfo.urlName).toBe(client.project);
  });

  test('deprecated update', () => {
    // no tests because endpoint is overriding config
  });

  test('update', () => {
    // no tests because endpoint is overriding config
  });
});

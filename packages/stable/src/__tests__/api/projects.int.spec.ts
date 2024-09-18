// Copyright 2020 Cognite AS

import { beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('Projects integration test', () => {
  let client: CogniteClient;
  const project = process.env.COGNITE_PROJECT as string;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('retrieve', async () => {
    const projectInfo = await client.projects.retrieve(project);
    expect(projectInfo.name).toBeDefined();
    expect(projectInfo.name.length).toBeGreaterThan(0);
    expect(projectInfo.urlName).toBe(project);
  });
});

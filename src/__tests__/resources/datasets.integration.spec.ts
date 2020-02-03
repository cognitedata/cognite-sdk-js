// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { Dataset } from '../../types/types';
import { setupLoggedInClient } from '../testUtils';

describe('Datasets integration test', () => {
  let client: CogniteClient;
  let datasets: Dataset[];

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('create', async () => {
    datasets = await client.datasets.create([{}]);
    expect(datasets[0].id).toBeTruthy();
  });
});

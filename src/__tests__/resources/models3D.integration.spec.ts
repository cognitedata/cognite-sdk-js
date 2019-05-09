// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import { Model3d } from '../../types/types';
import { setupClient } from '../testUtils';

describe('Model3d integration test', async () => {
  let client: API;
  beforeAll(async () => {
    jest.setTimeout(20000);
    client = await setupClient();
  });

  let models: Model3d[];
  test('create', async () => {
    const now = Date.now();
    const modelsToCreate = [
      { name: `Model 0 ${now}` },
      { name: `Model 2 ${now}` },
    ];
    models = await client.models3D.create(modelsToCreate);
    expect(models.length).toBe(2);
  });

  test('retrieve', async () => {
    const retrieved = await client.models3D.retrieve(models[0].id);
    expect(retrieved.name).toBe(models[0].name);
  });

  test('update', async () => {
    const modelsToUpdate = models.map(model => ({
      id: model.id,
      update: {
        name: {
          set: `${model.name} updated`,
        },
      },
    }));
    const updatedModels = await client.models3D.update(modelsToUpdate);
    updatedModels.forEach(model => expect(model.name).toContain('updated'));
  });

  test('delete', async () => {
    await client.models3D.delete(models.map(model => ({ id: model.id })));
  });

  test('list', async () => {
    await client.models3D.list().autoPagingToArray();
  });
});

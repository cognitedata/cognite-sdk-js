// Copyright 2020 Cognite AS

import { beforeAll, describe, expect, test } from 'vitest';
import { getSortedPropInArray, randomInt, setupLoggedInClient } from '../testUtils';

describe('Model3d integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  let models: Model3D[];
  test('create', async () => {
    const modelsToCreate = [
      { name: `Model 0 ${randomInt()}` },
      { name: `Model 2 ${randomInt()}`, metadata: { prop: 'value' } },
    ];
    models = await client.models3D.create(modelsToCreate);
    expect(getSortedPropInArray(models, 'name')).toEqual(
      getSortedPropInArray(modelsToCreate, 'name')
    );
  });

  test('list', async () => {
    const list = await client.models3D.list().autoPagingToArray({ limit: 2 });
    expect(list.length).toEqual(2);
  });

  test('retrieve', async () => {
    const retrieved = await client.models3D.retrieve(models[0].id);
    expect(retrieved.name).toBe(models[0].name);
    expect(retrieved.createdTime).toBeInstanceOf(Date);
  });

  test('update', async () => {
    const modelsToUpdate = models.map((model) => ({
      id: model.id,
      update: {
        name: {
          set: `${model.name} updated`,
        },
      },
    }));
    const updatedModels = await client.models3D.update(modelsToUpdate);
    updatedModels.forEach((model) => expect(model.name).toContain('updated'));
  });

  test('delete', async () => {
    const deleted = await client.models3D.delete(
      models.map((model) => ({ id: model.id }))
    );
    expect(deleted).toEqual({});
  });
});

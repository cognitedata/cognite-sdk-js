import { beforeAll, describe, expect, test } from 'vitest';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Labels integration test', () => {
  let client: CogniteClient;
  const externalLabel: ExternalLabelDefinition = {
    externalId: 'ROTATING_EQUIPMENT' + randomInt(),
    name: 'Pump' + randomInt(),
    description: 'Asset with rotating parts',
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('create', async () => {
    const createdLabels = await client.labels.create([externalLabel]);

    expect(createdLabels[0].externalId).toBe(externalLabel.externalId);
  });

  test('list', async () => {
    const { items } = await client.labels.list({
      filter: { name: externalLabel.name },
    });

    expect(items.length).toBe(1);
    expect(items[0].externalId).toBe(externalLabel.externalId);
  });

  test('delete', async () => {
    const response = await client.labels.delete([
      { externalId: externalLabel.externalId },
    ]);

    expect(response).toEqual({});
  });
});

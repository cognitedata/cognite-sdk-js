// Copyright 2020 Cognite AS

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('relationships integration test', () => {
  const end = Date.now();
  const start = end - 60 * 1000;
  const assetName = 'relationship_test_asset' + randomInt();
  const eventName = 'relationship_test_event' + randomInt();
  const relationshipId = 'test_relationship' + randomInt();
  const labelId = 'test_label' + randomInt();
  const confidenceExternalId = 'relationship_test_confidence' + randomInt();
  const relationshipConf = {
    externalId: relationshipId,
    sourceExternalId: assetName,
    sourceType: 'asset' as const,
    targetExternalId: eventName,
    targetType: 'event' as const,
    startTime: start,
    endTime: end,
  };

  let client: CogniteClient;
  let asset: Asset;
  let event: CogniteEvent;
  let dataSet: DataSet;
  let label: Label;

  beforeEach(async () => {
    await client.relationships.delete([{ externalId: confidenceExternalId }], {
      ignoreUnknownIds: true,
    });
  });

  beforeAll(async () => {
    client = setupLoggedInClient();
    [asset] = await client.assets.create([
      { externalId: assetName, name: assetName },
    ]);
    [event] = await client.events.create([{ externalId: eventName }]);
    [label] = await client.labels.create([
      { externalId: labelId, name: labelId },
    ]);
    [dataSet] = await client.datasets
      .list({ filter: { externalIdPrefix: 'integration-test-data-set' } })
      .autoPagingToArray();
  });

  afterAll(async () => {
    await client.assets.delete([{ externalId: assetName }]);
    await client.events.delete([{ externalId: eventName }]);
    await client.labels.delete([{ externalId: labelId }]);
  });

  describe('create', () => {
    test('should create relationship', async () => {
      const [relationship] = await client.relationships.create([
        {
          ...relationshipConf,
          dataSetId: dataSet.id,
          labels: [{ externalId: label.externalId }],
        },
      ]);

      expect(relationship.externalId).toEqual(relationshipId);
      expect(relationship.sourceExternalId).toEqual(asset.externalId);
      expect(relationship.targetExternalId).toEqual(event.externalId);
    });
    test('should throw error if confidence param is out of 0..1 range', async () => {
      const createPromise = client.relationships.create([
        { ...relationshipConf, confidence: 5 },
      ]);
      await expect(createPromise).rejects.toThrow();
    });
    test('should retrieve just created relationship', async () => {
      const [relationship] = await client.relationships.create([
        {
          ...relationshipConf,
          confidence: 1.0,
          externalId: confidenceExternalId,
        },
      ]);

      const [retrieved] = await client.relationships.retrieve([
        { externalId: confidenceExternalId },
      ]);

      expect(retrieved).toEqual(relationship);
    });
    test('should list just created relationship', async () => {
      await client.relationships.create([
        {
          ...relationshipConf,
          confidence: 1.0,
          externalId: confidenceExternalId,
        },
      ]);
      const result = await client.relationships
        .list({ filter: { sourceExternalIds: [assetName] } })
        .autoPagingToArray();

      expect(result.length).toBe(2);
    });
  });

  describe('retrieve', () => {
    test('should retrieve relationship', async () => {
      const result = await client.relationships.retrieve([
        { externalId: relationshipId },
      ]);

      expect(result.length).toBe(1);
      expect(result[0].externalId).toBe(relationshipId);
    });
    test('should ignore unknown ids if provided', async () => {
      const result = await client.relationships.retrieve(
        [{ externalId: relationshipId }, { externalId: 'unknown_external_id' }],
        { ignoreUnknownIds: true }
      );

      expect(result.length).toBe(1);
    });
  });

  describe('filter', () => {
    test('should filter relationship', async () => {
      const result = await client.relationships
        .list({ filter: { sourceExternalIds: [assetName] } })
        .autoPagingToArray({ limit: 5 });

      expect(result.length).toBe(1);
      expect(result[0].sourceExternalId).toBe(assetName);
    });
    test('should filter relationships by labels', async () => {
      const result = await client.relationships
        .list({
          filter: {
            labels: { containsAny: [{ externalId: label.externalId }] },
          },
        })
        .autoPagingToArray({ limit: 5 });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].sourceExternalId).toBe(assetName);
    });
    test('should filter relationships by data set', async () => {
      const result = await client.relationships
        .list({ filter: { dataSetIds: [{ id: dataSet.id }] } })
        .autoPagingToArray({ limit: 5 });

      expect(result.length).toBeGreaterThan(0);
    });
    test('should filter relationships by active at', async () => {
      const result = await client.relationships
        .list({
          filter: {
            sourceExternalIds: [assetName],
            activeAtTime: { min: start, max: end },
          },
        })
        .autoPagingToArray({ limit: 5 });
      const emptyResult = await client.relationships
        .list({
          filter: {
            sourceExternalIds: [assetName],
            activeAtTime: { min: start - 2000, max: start - 1000 },
          },
        })
        .autoPagingToArray({ limit: 5 });

      expect(result.length).toBe(1);
      expect(emptyResult.length).toBe(0);
    });
  });

  describe('delete', () => {
    test('should delete relationship', async () => {
      const result = await client.relationships.delete([
        { externalId: relationshipId },
      ]);

      expect(result).toEqual({});
    });
  });
});

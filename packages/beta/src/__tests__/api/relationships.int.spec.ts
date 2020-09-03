// Copyright 2020 Cognite AS

import { Asset, CogniteEvent } from '@cognite/sdk';
import { runTestWithRetryWhenFailing } from '@cognite/sdk/src/__tests__/testUtils';
import CogniteClient from '../../cogniteClient';
import { RelationshipResourceType } from '../../types';
import { setupLoggedInClient } from '../testUtils';

describe('relationships integration test', () => {
  const assetName = 'relationship_test_asset';
  const eventName = 'relationship_test_event';
  const relationshipId = 'test_relationship';
  const confidenceExternalId = 'relationship_test_confidence';
  const relationshipConf = {
    externalId: relationshipId,
    sourceExternalId: assetName,
    sourceType: RelationshipResourceType.Asset,
    targetExternalId: eventName,
    targetType: RelationshipResourceType.Event,
  };

  let client: CogniteClient;
  let asset: Asset;
  let event: CogniteEvent;

  beforeEach(async () => {
    await client.relationships.delete([{externalId: confidenceExternalId}], {ignoreUnknownIds: true});
  })

  beforeAll(async () => {
    client = setupLoggedInClient();
    [asset] = await client.assets.create([
      { externalId: assetName, name: assetName },
    ]);
    [event] = await client.events.create([{ externalId: eventName }]);
  });

  afterAll(async () => {
    await client.assets.delete([{ externalId: assetName }]);
    await client.events.delete([{ externalId: eventName }]);
  });

  describe('create', () => {
    test('should create relationship', async () => {
      const [relationship] = await client.relationships.create([
        relationshipConf,
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
      const [relationship] = await client.relationships.create([{...relationshipConf, confidence: 1.0, externalId: confidenceExternalId}]);

      await runTestWithRetryWhenFailing(async () => {
        const [retrieved] = await client.relationships.retrieve([{externalId: confidenceExternalId}]);

        expect(retrieved).toEqual(relationship);
      });
    });
    test('should list just created relationship', async () => {
      await client.relationships.create([{...relationshipConf, confidence: 1.0, externalId: confidenceExternalId}]);
      await runTestWithRetryWhenFailing(async () => {
        const result = () => client.relationships.list({filter: {sourceExternalIds: [assetName]}}).autoPagingToArray();

        expect(result.length).toBeGreaterThan(2);
      });
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

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].sourceExternalId).toBe(assetName);
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

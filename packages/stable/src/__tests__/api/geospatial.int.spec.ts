// Copyright 2020 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type {
  FeatureType,
  GeospatialCreateFeatureType,
  GeospatialFeature,
  GeospatialUpdateFeatureType,
} from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

const FEATURE_TYPE_EXTERNAL_ID = `sdk_test_${randomInt()}`;
const DUMMY_FEATURE_TYPE_CREATE_DELETE = `sdk_test_dummy_${randomInt()}`;

const TEST_FEATURE_TYPES: GeospatialCreateFeatureType[] = [
  {
    externalId: FEATURE_TYPE_EXTERNAL_ID,
    properties: {
      temperature: { type: 'DOUBLE' as const },
      location: { type: 'POINT' as const, srid: 4326 },
    },
    searchSpec: { location_idx: { properties: ['location'] } },
  },
  {
    externalId: DUMMY_FEATURE_TYPE_CREATE_DELETE,
    properties: {
      temperature: { type: 'DOUBLE' as const },
      location: { type: 'MULTIPOLYGON' as const, srid: 4326 },
    },
    searchSpec: { location_idx: { properties: ['location'] } },
  },
];

const UPDATE_FEATURE_TYPE: GeospatialUpdateFeatureType[] = [
  {
    externalId: FEATURE_TYPE_EXTERNAL_ID,
    update: {
      properties: {
        add: { depth: { type: 'DOUBLE', optional: true } },
      },
      searchSpec: { add: { depth_idx: { properties: ['depth'] } } },
    },
  },
];

const TEST_FEATURES: GeospatialFeature[] = [
  {
    externalId: 'measurement_point_765',
    temperature: 5.65,
    location: { wkt: 'POINT(60.547602 -5.423433)' },
  },
  {
    externalId: 'measurement_point_863',
    temperature: 5.03,
    location: { wkt: 'POINT(60.585858 -6.474416)' },
  },
];

const TEST_FEATURE: GeospatialFeature[] = [
  {
    externalId: 'measurement_point_930',
    temperature: 3.2,
    location: { wkt: 'POINT(20.547602 5.423433)' },
  },
];

const UPDATE_FEATURE: GeospatialFeature[] = [
  {
    externalId: 'measurement_point_930',
    temperature: 9.2,
    location: { wkt: 'POINT(34.547602 35.423433)' },
    depth: 100.23,
  },
];

const DUMMY_TEST_FEATURE: GeospatialFeature[] = [
  {
    externalId: 'dummy_930',
    temperature: 3.2,
    location: { wkt: 'POINT(20.547602 5.423433)' },
  },
];

// re-enable this when geospacial is back to life
describe.skip('Geospatial integration test', () => {
  let client: CogniteClient;
  let featureType: FeatureType;

  beforeAll(async () => {
    client = setupLoggedInClient();
    try {
      [featureType] = await client.geospatial.featureType.create([
        TEST_FEATURE_TYPES[0],
      ]);
    } catch (e) {
      console.error(e);
    }
  });

  afterAll(async () => {
    try {
      await client.geospatial.featureType.delete(
        [{ externalId: featureType.externalId }],
        { recursive: true }
      );
    } catch (e) {
      console.error(e);
    }
  });

  describe('feature type', () => {
    test('create & delete', async () => {
      const [dummyFeatureType] = await client.geospatial.featureType.create([
        TEST_FEATURE_TYPES[1],
      ]);
      expect(dummyFeatureType.externalId).toEqual(
        TEST_FEATURE_TYPES[1].externalId
      );
      const deleteResponse = await client.geospatial.featureType.delete(
        [{ externalId: dummyFeatureType.externalId }],
        { recursive: true }
      );
      expect(deleteResponse).toEqual(expect.objectContaining({}));
    });
    test('retrieve', async () => {
      const [retrievedFeatureType] =
        await client.geospatial.featureType.retrieve([
          { externalId: featureType.externalId },
        ]);
      expect(retrievedFeatureType.externalId).toEqual(featureType.externalId);
    });

    test('list', async () => {
      const listResponse = await client.geospatial.featureType.list();
      expect(listResponse.items.length > 0).toBeTruthy();
    });

    test('update', async () => {
      const [updatedFeatureType] =
        await client.geospatial.featureType.update(UPDATE_FEATURE_TYPE);
      expect(updatedFeatureType.properties.depth).toBeDefined();
    });
  });

  describe('features', () => {
    let feature1: GeospatialFeature;
    let feature2: GeospatialFeature;

    beforeAll(async () => {
      try {
        [feature1, feature2] = await client.geospatial.feature.create(
          featureType.externalId,
          TEST_FEATURES
        );
      } catch (e) {
        console.error(e);
      }
    });

    afterAll(async () => {
      try {
        await client.geospatial.feature.delete(featureType.externalId, [
          { externalId: feature1.externalId },
          { externalId: feature2.externalId },
        ]);
      } catch (e) {
        console.error(e);
      }
    });

    test('create & delete', async () => {
      const [dummyTestFeature] = await client.geospatial.feature.create(
        featureType.externalId,
        DUMMY_TEST_FEATURE
      );
      expect(dummyTestFeature.externalId).toBe(
        DUMMY_TEST_FEATURE[0].externalId
      );
      const deleteResponse = await client.geospatial.feature.delete(
        featureType.externalId,
        [{ externalId: dummyTestFeature.externalId }]
      );

      expect(deleteResponse).toEqual(expect.objectContaining({}));
    });

    test('retrieve', async () => {
      const [retrievedFeature1, retrievedFeature2] =
        await client.geospatial.feature.retrieve(
          featureType.externalId,
          [
            { externalId: feature1.externalId },
            { externalId: feature2.externalId },
          ],
          { output: { geometryFormat: 'GEOJSON' } }
        );
      expect(feature1.externalId).toBe(retrievedFeature1.externalId);
      expect(feature1.temperature).toBe(retrievedFeature1.temperature);
      expect(feature2.externalId).toBe(retrievedFeature2.externalId);
      expect(feature2.temperature).toBe(retrievedFeature2.temperature);
      expect(retrievedFeature1.location).toEqual(
        expect.objectContaining({
          coordinates: [60.547602, -5.423433],
          crs: { properties: { name: 'EPSG:4326' }, type: 'name' },
          type: 'Point',
        })
      );
      expect(retrievedFeature2.location).toEqual(
        expect.objectContaining({
          coordinates: [60.585858, -6.474416],
          crs: { properties: { name: 'EPSG:4326' }, type: 'name' },
          type: 'Point',
        })
      );
    });

    test('update', async () => {
      await client.geospatial.feature.create(
        featureType.externalId,
        TEST_FEATURE
      );
      const [updatedFeature] = await client.geospatial.feature.update(
        featureType.externalId,
        UPDATE_FEATURE
      );
      expect(updatedFeature.temperature).toBe(UPDATE_FEATURE[0].temperature);
      expect(updatedFeature.depth).toBe(UPDATE_FEATURE[0].depth);
    });

    test('search', async () => {
      const [searchedFeature] = await client.geospatial.feature.search(
        featureType.externalId,
        {
          filter: {
            range: { property: 'temperature', gt: 5.04 },
          },
          limit: 100,
          sort: ['temperature:ASC', 'location'],
        }
      );
      expect(searchedFeature.temperature).toBe(TEST_FEATURES[0].temperature);
    });

    test('list', async () => {
      const featuresList = await client.geospatial.feature
        .list(featureType.externalId, {
          filter: {
            range: { property: 'temperature', gt: 1.02 },
          },
        })
        .autoPagingToArray();
      expect(featuresList.length > 1).toBeTruthy();
    });

    test('searchStream', async () => {
      const newlineDelimiedFeaturesString =
        await client.geospatial.feature.searchStream(featureType.externalId, {
          filter: {
            range: { property: 'temperature', gt: 2.03 },
          },
          output: {
            jsonStreamFormat: 'NEW_LINE_DELIMITED',
          },
        });
      expect(
        newlineDelimiedFeaturesString
          .split('\n')
          .map((featureString) => JSON.parse(featureString))
          .some((feature) =>
            // check if searched features has existing test features
            TEST_FEATURES.map((testFeature) => testFeature.externalId).includes(
              feature.externalId
            )
          )
      ).toBeTruthy();
    });
  });

  describe('compute', () => {
    test('crs', async () => {
      const response = await client.geospatial.compute.compute({
        output: {
          output: {
            stTransform: {
              geometry: {
                ewkt: 'SRID=4326;POLYGON((0 0,10 0,10 10,0 10,0 0))',
              },
              srid: 4326,
            },
          },
        },
      });
      const items = response.items;
      expect(items.length === 1).toBeTruthy();
      expect(items[0].output.srid).toEqual(4326);
      expect(items[0].output.wkt).toEqual('POLYGON((0 0,10 0,10 10,0 10,0 0))');
    });
  });
});

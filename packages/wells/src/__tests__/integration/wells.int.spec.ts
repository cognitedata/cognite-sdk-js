// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import CogniteClient from '../../client/cogniteClient';
import { GeoJson } from 'wells/src/client/model/GeoJson';
import { SearchWell, SearchWells, Well } from 'wells/src/client/model/Well';
import { assert } from 'console';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in wells - integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('standard filter - get well by asset name', async () => {
    const response = await client.wells.listByName('Well A');

    expect(response.length).toBe(1);
  });

  test('custom filter - get well by asset name', async () => {
    const name = 'Well A';
    const fn: SearchWells = async (args: string) =>
      await client.wells.listByName(args);
    const response = await client.wells.listByName(name, fn);
    expect(response.length).toBe(1);
  });

  test('standard filter - get well by asset name prefix', async () => {
    const response = await client.wells.listByNamePrefix('Well');

    response.forEach(function(well) {
      expect(well.name.startsWith('Well')).toBe(true);
    });
    expect(response.length).toBe(2);
  });

  test('custom filter - get well by asset name prefix', async () => {
    const namePrefix = 'Well';

    const fn: SearchWells = async (args: string) =>
      await client.wells.listByNamePrefix(args);

    const response = await client.wells.listByNamePrefix(namePrefix, fn);
    response.forEach(function(well) {
      expect(well.name.startsWith('Well')).toBe(true);
    });
    expect(response.length).toBe(2);
  });

  test('standard filter - get empty wells array with name suffix', async () => {
    const response = await client.wells.listByNamePrefix('A');

    expect(response.length).toBe(0);
  });

  test('standard filter - get well by asset id', async () => {
    const id = 2278618537691581;
    const response = await client.wells.getById(id);

    assert(typeof response != 'undefined');

    if (response) {
      expect(response.id).toBe(id);
    }
  });

  test('custom filter - get well by asset id', async () => {
    const id = 2278618537691581;

    const fn: SearchWell = async (args: number) => {
      const resp: Well[] = await client.wells.getByIds([{ id: args }]);
      return resp[0];
    };

    const response = await client.wells.getById(id, fn);

    assert(typeof response != 'undefined');

    if (response) {
      expect(response.id).toBe(id);
    }
  });

  test('standard filter - search and filter name', async () => {
    const polygon =
      'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

    const response = await client.wells.listWells({
      wellGeometry: { geometry: polygon },
      filter: { name: ['Well A'] },
      limit: 1,
    });

    response.forEach(function(well) {
      expect(well.name.startsWith('Well A')).toBe(true);
    });
    expect(response.length).toBe(1);
  });

  test('standard filter - search and filter data source', async () => {
    const polygon =
      'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

    const response = await client.wells.listWells({
      wellGeometry: { geometry: polygon },
      filter: { dataSource: ['A'] },
      limit: 1,
    });

    response.forEach(function(well) {
      expect(well.name.startsWith('Well A')).toBe(true);
    });
    expect(response.length).toBe(1);
  });

  test('standard filter - search and filter operator', async () => {
    const polygon =
      'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

    const response = await client.wells.listWells({
      wellGeometry: { geometry: polygon },
      filter: { operator: ['A'] },
      limit: 1,
    });

    response.forEach(function(well) {
      expect(well.name.startsWith('Well A')).toBe(true);
    });
    expect(response.length).toBe(1);
  });

  test('standard filter - search and filter field', async () => {
    const polygon =
      'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

    const response = await client.wells.listWells({
      wellGeometry: { geometry: polygon },
      filter: { field: ['A'] },
      limit: 1,
    });

    response.forEach(function(well) {
      expect(well.name.startsWith('Well A')).toBe(true);
    });
    expect(response.length).toBe(1);
  });

  test('standard filter - search and filter block', async () => {
    const polygon =
      'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

    const response = await client.wells.listWells({
      wellGeometry: { geometry: polygon },
      filter: { block: ['A'] },
      limit: 1,
    });

    response.forEach(function(well) {
      expect(well.name.startsWith('Well A')).toBe(true);
    });
    expect(response.length).toBe(1);
  });

  test('standard filter - search and filter multiple blocks', async () => {
    const polygon =
      'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

    const response = await client.wells.listWells({
      wellGeometry: { geometry: polygon },
      filter: { block: ['A', 'B'] },
      limit: 1,
    });

    response.forEach(function(well) {
      expect(well.name.startsWith('Well')).toBe(true);
    });
    expect(response.length).toBe(2);
  });

  test('standard filter - get well by polygon wkt', async () => {
    const polygon =
      'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

    const response = await client.wells.searchByPolygon({
      geometry: polygon,
      limit: 1,
      offset: 0,
    });

    response.forEach(function(well) {
      expect(well.name.startsWith('Well')).toBe(true);
    });
    expect(response.length).toBe(2);
  });

  test('custom filter - get well by polygon wkt', async () => {
    const polygon =
      'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

    const fn: SearchWells = async (geometry: GeoJson) =>
      await client.wells.searchByPolygon({
        geometry: geometry,
        limit: 1,
        offset: 0,
      });

    const response = await client.wells.searchByPolygon({
      geometry: polygon,
      limit: 1,
      offset: 0,
      customFilter: fn,
    });

    response.forEach(function(well) {
      expect(well.name.startsWith('Well')).toBe(true);
    });
    expect(response.length).toBe(2);
  });

  test('standard filter - get well by geoJson', async () => {
    const polygon = <GeoJson>{
      type: 'Polygon',
      coordinates: [
        [
          [-4.86423, 63.59999],
          [19.86423, 63.59999],
          [19.86423, 52.59999],
          [-4.86423, 52.59999],
          [-4.86423, 63.59999],
        ],
      ],
    };

    const response = await client.wells.searchByPolygon({
      geometry: polygon,
      limit: 1,
      offset: 0,
    });

    response.forEach(function(well) {
      expect(well.name.startsWith('Well')).toBe(true);
    });
    expect(response.length).toBe(2);
  });

  test('custom filter - get well by geoJson', async () => {
    const polygon = <GeoJson>{
      type: 'Polygon',
      coordinates: [
        [
          [-4.86423, 63.59999],
          [19.86423, 63.59999],
          [19.86423, 52.59999],
          [-4.86423, 52.59999],
          [-4.86423, 63.59999],
        ],
      ],
    };

    const fn: SearchWells = async (geometry: GeoJson) =>
      await client.wells.searchByPolygon({
        geometry: geometry,
        limit: 1,
        offset: 0,
      });

    const response = await client.wells.searchByPolygon({
      geometry: polygon,
      limit: 1,
      offset: 0,
      customFilter: fn,
    });

    response.forEach(function(well) {
      expect(well.name.startsWith('Well')).toBe(true);
    });
    expect(response.length).toBe(2);
  });
});

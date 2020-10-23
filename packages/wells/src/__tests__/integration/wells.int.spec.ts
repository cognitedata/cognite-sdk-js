// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import CogniteClient from '../../client/cogniteClient';
import { GeoJson } from 'wells/src/client/model/GeoJson';
import { SearchWell } from 'wells/src/client/model/Well';
//import { SearchWell, Well } from '../../client/model/Well';
//import { Wells } from '../../client/api/wells';

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
    const response = await client.wells.getWellByName('Well A');

    expect(response.length).toBe(1);
  });

  test('custom filter - get well by asset name', async () => {
    const name = 'Well A';
    const fn: SearchWell = async (args: string) =>
      await client.wells.getWellByName(args);
    const response = await client.wells.getWellByName(name, fn);
    expect(response.length).toBe(1);
  });

  test('standard filter - get well by asset name prefix', async () => {
    const response = await client.wells.getWellsByNamePrefix('Well');

    response.forEach(function(well) {
      expect(well.name.startsWith('Well')).toBe(true);
    });
    expect(response.length).toBe(2);
  });

  test('custom filter - get well by asset name prefix', async () => {
    const namePrefix = 'Well';

    const fn: SearchWell = async (args: string) =>
      await client.wells.getWellsByNamePrefix(args);

    const response = await client.wells.getWellsByNamePrefix(namePrefix, fn);
    response.forEach(function(well) {
      expect(well.name.startsWith('Well')).toBe(true);
    });
    expect(response.length).toBe(2);
  });

  test('standard filter - get empty wells array with name suffix', async () => {
    const response = await client.wells.getWellsByNamePrefix('A');

    expect(response.length).toBe(0);
  });

  test('standard filter - get well by asset id', async () => {
    const id = 2278618537691581;
    const response = await client.wells.getWellById(id);

    expect(response[0]);
    expect(response.length).toBe(1);
  });

  test('custom filter - get well by asset id', async () => {
    const id = 2278618537691581;

    const fn: SearchWell = async (args: number) =>
      await client.wells.getWellsByIds([{ id: args }]);

    const response = await client.wells.getWellById(id, fn);

    expect(response[0]);
    expect(response.length).toBe(1);
  });

  test('get well by polygon wkt', async () => {
    const polygon =
      'POLYGON ((-4.86423 63.59999, 19.86423 63.59999, 19.86423 52.59999, -4.86423 52.59999, -4.86423 63.59999))';

    const response = await client.wells.getWellsByPolygon({
      geometry: polygon,
      limit: 1,
      offset: 0,
    });

    response.forEach(function(well) {
      expect(well.name.startsWith('Well')).toBe(true);
    });
    expect(response.length).toBe(2);
  });

  test('get well by geoJson', async () => {
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

    const response = await client.wells.getWellsByPolygon({
      geometry: polygon,
      limit: 1,
      offset: 0,
    });

    response.forEach(function(well) {
      expect(well.name.startsWith('Well')).toBe(true);
    });
    expect(response.length).toBe(2);
  });
});

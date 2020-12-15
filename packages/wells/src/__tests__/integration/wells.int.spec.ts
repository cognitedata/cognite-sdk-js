// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import WellsClient from 'wells/src/client/CogniteWellsClient';
import { Well, WellItems } from 'wells/src/client/model/Well';
import { WellFilter } from 'wells/src/client/model/WellFilter';
import { GeoJson } from 'wells/src/client/model/GeoJson';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in wells - integration test', () => {
  let client: WellsClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('get by id - well returned for id', async () => {
    expect(client).not.toBeUndefined();
    const wellId: number = 8456650753594878;
    const well: Well | undefined = await client.wells.getById(wellId)

    expect(well).not.toBeUndefined();
    /* eslint-disable */
    expect(well?.id).toBe(wellId);
    /* eslint-enable */
  });

  test('get by id - 404 if well does not exist', async () => {
    expect(client).not.toBeUndefined();
    const wellId: number = 99999999999999;

    await client.wells.getById(wellId)
      .then(response => response)
      .catch(err => {
        expect(err.status).toBe(400);
        expect(err.data).toBe(`Failed to retrieve well from CDF`)
      });
  });

  test('get list of wells', async () => {
    expect(client).not.toBeUndefined();
    const wells: WellItems | undefined = await client.wells.list();
      
    expect(wells).not.toBeUndefined();
    const WdlNames = ["well:CasingWear", "well:Deepwater W", "well:Platform W", "well:34/10-24", "well:34/10-1", "well:34/10-8"];
    wells?.items.forEach(well => {
     expect(WdlNames).toContain(well.externalId)
    });
  });

  test('use cursor to get more wells', async () => {
    expect(client).not.toBeUndefined();
    const wells = await client.wells.list();
    expect(wells).not.toBeUndefined();
    const retrievedWells = wells?.items.map(x => x.id)
    if (wells?.cursor) {
      const newWells = await client.wells.list(wells?.cursor)
      newWells?.items.forEach(element => {
        expect(retrievedWells).not.toContain(element.id)
      });
    }
  });

  test('filter - gets wells in wkt polygon', async () => {
    expect(client).not.toBeUndefined();
    const testPolygon = "POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))"
    const filter: WellFilter = {'polygon': {'wktGeometry': testPolygon, 'crs': 'epsg:4326'}}
    const wells = await client.wells.filter(filter);
      
    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.externalId)
    const WdlNames = ["well:34/10-24", "well:34/10-1", "well:34/10-8"];
    WdlNames.forEach(name => {
     expect(retrievedNames).toContain(name)
    });
  });

  test('filter - gets wells in geoJson polygon', async () => {
    expect(client).not.toBeUndefined();
    const testPolygon = <GeoJson>{
      type: 'Polygon',
      coordinates: [
        [
          [0.0, 0.0],
          [0.0, 80.0],
          [80.0, 80.0],
          [80.0, 0.0],
          [0.0, 0.0],
        ],
      ],
    };
    const filter: WellFilter = {'polygon': {'geoJsonGeometry': testPolygon, 'crs': 'epsg:4326'}}
    const wells = await client.wells.filter(filter);
      
    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.externalId)
    const WdlNames = ["well:34/10-24", "well:34/10-1", "well:34/10-8"];
    WdlNames.forEach(name => {
     expect(retrievedNames).toContain(name)
    });
  });

  test('filter - get all wells with edm source', async () => {
    expect(client).not.toBeUndefined();
    const testPolygon = "POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))"
    const filter: WellFilter = {'polygon': {'wktGeometry': testPolygon, 'crs': 'epsg:4326'}, 'sources': ['edm']}
    const wells = await client.wells.filter(filter);

    wells?.items.forEach(well => {
      expect(well.sources).toContain('EDM');
    });
  });

  test('filter - get all block labels', async () => {
    expect(client).not.toBeUndefined();
    const blocks: String[] | undefined = await client.wells.blocks();

    expect(blocks).toContain("A")
    expect(blocks).toContain("B")
  });

  test('filter - get all field labels', async () => {
    expect(client).not.toBeUndefined();
    const fields = await client.wells.fields();

    expect(fields).toContain("A")
    expect(fields).toContain("B")
  });

  test('filter - get all operator labels', async () => {
    expect(client).not.toBeUndefined();
    const operators = await client.wells.operators();

    expect(operators).toContain("A")
    expect(operators).toContain("B")
  });

  test('filter - get all quadrants labels', async () => {
    expect(client).not.toBeUndefined();
    const quadrants = await client.wells.quadrants();

    expect(quadrants).toContain("A")
    expect(quadrants).toContain("B")
  });

  test('filter - get all source labels', async () => {
    expect(client).not.toBeUndefined();
    const sources = await client.wells.sources();

    expect(sources).toContain("EDM")
  });
});

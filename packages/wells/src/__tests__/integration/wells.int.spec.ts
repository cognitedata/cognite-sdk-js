// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import WellsClient from 'wells/src/client/CogniteWellsClient';
import { Well } from 'wells/src/client/model/Well';
import { WellFilter } from 'wells/src/client/model/WellFilter';

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
    const well: Well | undefined = await client.wells.getId(wellId)

    expect(well).not.toBeUndefined();
    /* eslint-disable */
    expect(well?.id).toBe(wellId);
    /* eslint-enable */
  });

  test('get by id - 404 if well does not exist', async () => {
    expect(client).not.toBeUndefined();
    const wellId: number = 99999999999999;

    await client.wells.getId(wellId)
      .then(response => response)
      .catch(err => {
        expect(err.status).toBe(400);
        expect(err.data).toBe(`Failed to retrieve well from CDF`)
      });
  });

  test('get list of wells', async () => {
    expect(client).not.toBeUndefined();
    const wells = await client.wells.list();
      
    expect(wells).not.toBeUndefined();
    const WdlNames = ["well:CasingWear", "well:Deepwater W", "well:Platform W", "well:34/10-24", "well:34/10-1", "well:34/10-8"];
    wells?.forEach(well => {
     expect(WdlNames).toContain(well.externalId)
    });
  });

  test('filter - gets wells in polygon', async () => {
    expect(client).not.toBeUndefined();
    const testPolygon = "POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))"
    const filter: WellFilter = {'polygon': {'geometry': testPolygon, 'crs': 'epsg:4326'}}
    const wells = await client.wells.filter(filter);
      
    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.map(well => well.externalId)
    const WdlNames = ["well:34/10-24", "well:34/10-1", "well:34/10-8"];
    WdlNames.forEach(name => {
     expect(retrievedNames).toContain(name)
    });
  });

  test('filter - get all wells with edm source', async () => {
    expect(client).not.toBeUndefined();
    const testPolygon = "POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))"
    const filter: WellFilter = {'polygon': {'geometry': testPolygon, 'crs': 'epsg:4326'}, 'sources': ['edm']}
    const wells = await client.wells.filter(filter);

    wells?.forEach(well => {
      expect(well.sources).toContain('edm');
    });
  });
});

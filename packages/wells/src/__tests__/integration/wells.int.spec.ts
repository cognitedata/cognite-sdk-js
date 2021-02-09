// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import WellsClient from 'wells/src/client/cogniteWellsClient';
import { Well, WellItems } from 'wells/src/client/model/Well';
import { Wellbore } from 'wells/src/client/model/Wellbore'
import { WellFilter, MeasurementFilter, MeasurementFilters } from 'wells/src/client/model/WellFilter';
import { GeoJson } from 'wells/src/client/model/GeoJson';
import { Asset } from 'wells/src/types';

enum MeasurementType {
  GammaRay = 'GammaRay',
  Caliper = 'Caliper',
  Resistivity = 'Resistivity',
  Density = 'Density',
  Neutron = 'Neutron',
  PPFG = 'PPFG',
  Geomechanics = 'Geomechanics',
  Core = 'Core',
}

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

  test('get source assets for well', async () => {
    expect(client).not.toBeUndefined();
    const wellId: number = 5432591169464385;
    const well: Well | undefined = await client.wells.getById(wellId)
    const sources: Asset[] | undefined = await well?.sourceAssets()
    expect(sources).not.toBeUndefined();
    expect(sources?.length).toBe(1);
    const source = sources![0];
    expect(source.externalId).toBe("EDM:Well:Qj2k7uJdSe")
  });

  test('get source assets for well of type EDM', async() => {
    const wellId: number = 5432591169464385;
    const well: Well | undefined = await client.wells.getById(wellId)
    const sources: Asset[] | undefined = await well?.sourceAssets("EDM")
    expect(sources).not.toBeUndefined();
    expect(sources?.length).toBe(1);
    const source = sources![0];
    expect(source.externalId).toBe("EDM:Well:Qj2k7uJdSe")
  });

  test('get by id - get wellbores', async () => {
    expect(client).not.toBeUndefined();
    const wellId: number = 2275887128760800;
    const well: Well | undefined = await client.wells.getById(wellId)

    expect(well).not.toBeUndefined();
    /* eslint-disable */
    expect(well?.id).toBe(wellId);
    /* eslint-enable */
    const wellbores: Wellbore[] | undefined = await well?.wellbores()
    expect(wellbores).not.toBeUndefined();
    const wellboreIds = [870793324939646, 1072803479704457, 8456650753594878]
    wellboreIds.forEach(id => {
      expect(wellbores!.map(wellbore => wellbore.id)).toContain(id)
    });
  });

  test('get by id - 404 if well does not exist', async () => {
    expect(client).not.toBeUndefined();
    const wellId: number = 99999999999999;

    await client.wells.getById(wellId)
      .then(response => response)
      .catch(err => {
        expect(err.status).toBe(400);
        //expect(err.data).toBe(`Failed to retrieve well from CDF`)
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

  test('filter - fuzzy search on name string matching 1', async () => {
    expect(client).not.toBeUndefined();
    const filter: WellFilter = {'stringMatching': '24'}
    const wells = await client.wells.filter(filter);
      
    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.name)
    const WdlNames = ["34/10-24"];
    WdlNames.forEach(name => {
     expect(retrievedNames).toContain(name)
    });
  });

  test('filter - fuzzy search on name string matching 2', async () => {
    expect(client).not.toBeUndefined();
    const filter: WellFilter = {'stringMatching': '10'}
    const wells = await client.wells.filter(filter);
      
    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.name)
    const WdlNames = ["34/10-24", "34/10-8", "34/10-1"];
    WdlNames.forEach(name => {
     expect(retrievedNames).toContain(name)
    });
  });

  test('filter - gets wells with description filter', async () => {
    expect(client).not.toBeUndefined();
    const filter: WellFilter = {'stringMatching': 'WDL Asset'}
    const wells = await client.wells.filter(filter);
      
    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.name)
    const WdlNames = ["CasingWear", "Deepwater W"];
    WdlNames.forEach(name => {
     expect(retrievedNames).toContain(name)
    });
  });

  test('filter - gets wells in polygon with description', async () => {
    expect(client).not.toBeUndefined();
    const testPolygon = "POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))"
    const filter: WellFilter = {
      'polygon': { 'wktGeometry': testPolygon, 'crs': 'epsg:4326' },
      'stringMatching': 'Field'
    }
    const wells = await client.wells.filter(filter);
      
    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.name)
    expect(retrievedNames?.length).toBe(1)
    const WdlNames = ["34/10-24"];
    WdlNames.forEach(name => {
     expect(retrievedNames).toContain(name)
    });
  });

  test('filter - gets wells in polygon with description and output crs', async () => {
    expect(client).not.toBeUndefined();
    const testPolygon = "POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))"
    const filter: WellFilter = {
      'polygon': { 'wktGeometry': testPolygon, 'crs': 'EPSG:4326' },
      'stringMatching': 'Field',
      'outputCrs': 'EPSG:23031' 
    }
    const wells = await client.wells.filter(filter);
      
    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.name)
    expect(retrievedNames?.length).toBe(1)
    const WdlNames = ["34/10-24"];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name)
    });

    const retrievedCrs = wells?.items.map(well => well.wellHead?.crs)
    const outputCrs = ['EPSG:23031']
    outputCrs.forEach(crs => {
      expect(retrievedCrs).toContain(crs)
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

  test('filter - get all wells with trajectory', async () => {
    expect(client).not.toBeUndefined();
    const filter: WellFilter = {"hasTrajectory": {}}
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.externalId)
    const WdlNames = ["well:34/10-1"];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name)
    });
  });

  test('filter - get all wells with trajectory in range', async () => {
    expect(client).not.toBeUndefined();
    const filter: WellFilter = {"hasTrajectory": {minDepth: 500, maxDepth: 1000}}
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.externalId)
    const WdlNames = ["well:34/10-1"];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name)
    });
  });

  test('filter - get all wells with trajectory - no returned in range', async () => {
    expect(client).not.toBeUndefined();
    const filter: WellFilter = {"hasTrajectory": {minDepth: 1000, maxDepth: 2000}}
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.externalId)
    expect(retrievedNames).not.toContain("well:34/10-1")
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

  test('filter - get all measurement types', async () => {
    expect(client).not.toBeUndefined();
    const quadrants = await client.wells.measurements();

    expect(quadrants).not.toBeUndefined()
    expect(quadrants).toContain("GammaRay")
    expect(quadrants).toContain("Density")
  });

  test('filter - has gamma measurement', async () => {
    expect(client).not.toBeUndefined();

    const measurementFilter: MeasurementFilter = { "measurementType": MeasurementType.GammaRay }
    const measurementFilters: MeasurementFilters = {"containsAll": [measurementFilter]}
    const filter: WellFilter = { "hasMeasurements": measurementFilters }
    
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.externalId)
    const WdlNames = ["well:34/10-8", "well:34/10-1"];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name)
    });
  });

  test('filter - has multiple measurements, must match on all', async () => {
    expect(client).not.toBeUndefined();

    const gammaRayFilter: MeasurementFilter = { "measurementType": MeasurementType.GammaRay }
    const densityFilter: MeasurementFilter = { "measurementType": MeasurementType.Density }
    const measurementFilters: MeasurementFilters = { "containsAll": [gammaRayFilter, densityFilter] }
    const filter: WellFilter = { "hasMeasurements": measurementFilters }
    
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.externalId)
    const WdlNames = ["well:34/10-8", "well:34/10-1"];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name)
    });
  });


  test('filter - has multiple measurements, fail to match on all', async () => {
    expect(client).not.toBeUndefined();

    const gammaRayFilter: MeasurementFilter = { "measurementType": MeasurementType.GammaRay }
    const densityFilter: MeasurementFilter = { "measurementType": MeasurementType.Density }
    const geomechanicsFilter: MeasurementFilter = { "measurementType": MeasurementType.Geomechanics }
    const measurementFilters: MeasurementFilters = { "containsAll": [gammaRayFilter, densityFilter, geomechanicsFilter] }
    const filter: WellFilter = { "hasMeasurements": measurementFilters }
    
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    expect(wells?.items.length).toBe(0);
  });

  test('filter - has multiple measurements, can match on any', async () => {
    expect(client).not.toBeUndefined();

    const gammaRayFilter: MeasurementFilter = { "measurementType": MeasurementType.GammaRay }
    const densityFilter: MeasurementFilter = { "measurementType": MeasurementType.Density }
    const geomechanicsFilter: MeasurementFilter = { "measurementType": MeasurementType.Geomechanics }
    const measurementFilters: MeasurementFilters = { "containsAny": [gammaRayFilter, densityFilter, geomechanicsFilter] }
    const filter: WellFilter = { "hasMeasurements": measurementFilters }
    
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells?.items.map(well => well.externalId)
    const WdlNames = ["well:34/10-8", "well:34/10-1"];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name)
    });
  });

});

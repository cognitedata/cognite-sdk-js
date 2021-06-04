// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import WellsClient from 'wells/src/client/cogniteWellsClient';
import { Well, WellItems, WellsLimits } from 'wells/src/client/model/Well';
import { Wellbore } from 'wells/src/client/model/Wellbore';
import { LengthRange } from 'wells/src/client/model/LengthRange';
import {
  WellFilter,
  MeasurementFilter,
  MeasurementFilters,
} from 'wells/src/client/model/WellFilter';
import { GeoJson } from 'wells/src/client/model/GeoJson';
import { Asset } from '@cognite/sdk';
import { DateRange } from 'wells/src/client/model/DateRange';

enum LengthUnitEnum {
  METER = 'meter',
  FOOT = 'foot',
  INCH = 'inch',
  YARD = 'yard',
}

enum MeasurementType {
  GammaRay = 'GammaRay',
  Caliper = 'Caliper',
  ResistivityDeep = 'ResistivityDeep',
  ResistivityMedium = 'ResistivityMedium',
  Density = 'Density',
  Neutron = 'Neutron',
  PPFG = 'PPFG',
  Geomechanics = 'Geomechanics',
  FIT = 'FIT',
  LOT = 'LOT',
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
    const wellId: number = 5432591169464385;
    const well: Well = await client.wells.getById(wellId);

    expect(well).not.toBeUndefined();

    expect(well.id).toBe(wellId);
  });

  test('get by id - test water depth is fetched', async () => {
    expect(client).not.toBeUndefined();
    const wellId: number = 5432591169464385;
    const well: Well = await client.wells.getById(wellId);

    expect(well).not.toBeUndefined();
    expect(well.id).toBe(wellId);

    /* eslint-disable */
    expect(well.waterDepth?.unit).toBe('meter');
    expect(well.waterDepth?.value).toBe(100.0);
    /* eslint-enable */
  });

  test('get wells limits', async() => {
    expect(client).not.toBeUndefined();
    const limits: WellsLimits = await client.wells.limits()
    expect(limits.spudDate).not.toBeUndefined()
    expect(limits.waterDepth).not.toBeUndefined()
    expect(limits.spudDate.max).toBeInstanceOf(Date)
    expect(limits.spudDate.min).toBeInstanceOf(Date)
    expect(limits.waterDepth.max.value).toBeGreaterThanOrEqual(limits.waterDepth.min.value)
    expect(limits.nptDuration.max!).toBeGreaterThanOrEqual(limits.nptDuration.min!)
  });

  test('get source assets for well', async () => {
    expect(client).not.toBeUndefined();
    const wellId: number = 5432591169464385;
    const well: Well = await client.wells.getById(wellId);
    const sources: Asset[] = await well.sourceAssets();
    expect(sources).not.toBeUndefined();
    expect(sources.length).toBe(1);
    const source = sources![0];
    expect(source.externalId).toBe('EDM:Well:Qj2k7uJdSe');
  });

  test('get source assets for well of type EDM', async () => {
    const wellId: number = 5432591169464385;
    const well: Well = await client.wells.getById(wellId);
    const sources: Asset[] = await well.sourceAssets('EDM');
    expect(sources).not.toBeUndefined();
    expect(sources.length).toBe(1);
    const source = sources![0];
    expect(source.externalId).toBe('EDM:Well:Qj2k7uJdSe');
  });

  test('get by id - get wellbores', async () => {
    expect(client).not.toBeUndefined();
    const wellId: number = 8091617722352417;
    const well: Well = await client.wells.getById(wellId);

    expect(well).not.toBeUndefined();
    expect(well.id).toBe(wellId);

    const wellbores: Wellbore[] = await well.wellbores();
    expect(wellbores).not.toBeUndefined();
    expect(wellbores.length).toBeGreaterThan(0);
    const wellboreIds = [
      'wellbore:Wellbore WDL 102',
      'wellbore:Platform WB 12.25 in OH',
      'wellbore:Platform WB 8.5 in OH',
    ];
    wellboreIds.forEach(id => {
      expect(wellbores!.map(wellbore => wellbore.externalId)).toContain(id);
    });
  });

  test('get by id - 404 if well does not exist', async () => {
    expect(client).not.toBeUndefined();
    const wellId = 99999999999999;

    await client.wells.getById(wellId).catch(err => {
      expect(err.status).toBe(400);
      //expect(err.data).toBe(`Failed to retrieve well from CDF`)
    });
  });

  test('get list of wells', async () => {
    expect(client).not.toBeUndefined();
    const wells: WellItems = await client.wells.list();

    expect(wells).not.toBeUndefined();
    const WdlNames = [
      'well:CasingWear',
      'well:Deepwater W',
      'well:Platform W',
      'well:34/10-24',
      'well:34/10-1',
      'well:34/10-8',
    ];
    wells.items.forEach(well => {
      expect(WdlNames).toContain(well.externalId);
    });
  });

  test('list with limit, then cursor and limit', async () => {
    const wellsWithLimit: WellItems = await client.wells.list(undefined, 3);
    expect(wellsWithLimit).not.toBeUndefined();
    expect(wellsWithLimit.items.length).toBe(3);

    const wellsWithCursor: WellItems = await client.wells.list(wellsWithLimit.nextCursor, 2);
    expect(wellsWithCursor).not.toBeUndefined();
    expect(wellsWithCursor.items.length).toBe(2);
  });

  test('filter with limit, then cursor and limit', async () => {
    const filter: WellFilter = { };
    const wellsWithLimit: WellItems = await client.wells.filter(filter, undefined, 3);
    expect(wellsWithLimit).not.toBeUndefined();
    expect(wellsWithLimit.items.length).toBe(3);

    const wellsWithCursor: WellItems = await client.wells.filter(filter, wellsWithLimit.nextCursor, 2);
    expect(wellsWithCursor).not.toBeUndefined();
    expect(wellsWithCursor.items.length).toBe(2);
  });

  test('use cursor to get more wells', async () => {
    const wells = await client.wells.list();
    expect(wells).not.toBeUndefined();
    const retrievedWells = wells.items.map(x => x.id);
    if (wells.nextCursor) {
      const newWells = await client.wells.list(wells.nextCursor);
      newWells.items.forEach(element => {
        expect(retrievedWells).not.toContain(element.id);
      });
    }
  });

  test('filter - gets wells in wkt polygon', async () => {
    const testPolygon =
      'POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))';
    const filter: WellFilter = {
      polygon: { wktGeometry: testPolygon, crs: 'epsg:4326' },
    };
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.externalId);
    const WdlNames = ['well:34/10-24', 'well:34/10-1', 'well:34/10-8'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });
  });

  test('filter - fuzzy search on name string matching 1', async () => {
    const filter: WellFilter = { stringMatching: '24' };
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.name);
    const WdlNames = ['34/10-24'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });
  });

  test('filter - fuzzy search on name string matching 2', async () => {
    const filter: WellFilter = { stringMatching: '10' };
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.name);
    const WdlNames = ['34/10-24', '34/10-8', '34/10-1'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });
  });

  test('filter wells slow', async () => {
    const filter: WellFilter = { stringMatching: '10' };
    const wells: Well[] = await client.wells.filterSlow(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.map(well => well.name);
    const WdlNames = ['34/10-24', '34/10-8', '34/10-1'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });
  });

  test('filter with slow with empty filter', async () => {
    const filter: WellFilter = {};
    const wells: Well[] = await client.wells.filterSlow(filter);

    expect(wells).not.toBeUndefined();
  });

  test('filter - gets wells with description filter', async () => {
    const filter: WellFilter = { stringMatching: 'WDL Asset' };
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.name);
    const WdlNames = ['CasingWear', 'Deepwater W'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });
  });

  test('filter - gets wells in polygon with description', async () => {
    const testPolygon =
      'POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))';
    const filter: WellFilter = {
      polygon: { wktGeometry: testPolygon, crs: 'epsg:4326' },
      stringMatching: 'Field',
    };
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.name);
    expect(retrievedNames.length).toBe(1);
    const WdlNames = ['34/10-24'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });
  });

  test('filter - gets wells in polygon with description and output crs', async () => {
    const testPolygon =
      'POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))';
    const filter: WellFilter = {
      polygon: { wktGeometry: testPolygon, crs: 'EPSG:4326' },
      stringMatching: 'Field',
      outputCrs: 'EPSG:23031',
    };
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.name);
    expect(retrievedNames?.length).toBe(1);
    const WdlNames = ['34/10-24'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });

    const retrievedCrs = wells.items.map(well => well.wellhead?.crs);
    const outputCrs = ['EPSG:23031'];
    outputCrs.forEach(crs => {
      expect(retrievedCrs).toContain(crs);
    });
  });

  test('filter - gets wells in geoJson polygon', async () => {
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
    const filter: WellFilter = {
      polygon: { geoJsonGeometry: testPolygon, crs: 'epsg:4326' },
    };
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.externalId);
    const WdlNames = ['well:34/10-24', 'well:34/10-1', 'well:34/10-8'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });
  });

  test('filter - get all wells with edm source', async () => {
    const testPolygon =
      'POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))';
    const filter: WellFilter = {
      polygon: { wktGeometry: testPolygon, crs: 'epsg:4326' },
      sources: ['edm'],
    };
    const wells = await client.wells.filter(filter);

    wells.items.forEach(well => {
      expect(well.sources).toContain('EDM');
    });
  });

  test('filter - get all wells with trajectory', async () => {
    const filter: WellFilter = { hasTrajectory: {} };
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.externalId);
    const WdlNames = ['well:34/10-8'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });
  });

  test('filter - get all wells with trajectory in range', async () => {
    const filter: WellFilter = {
      hasTrajectory: { minDepth: 1.0, maxDepth: 1.0 },
    };
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.externalId);
    const WdlNames = ['well:34/10-8'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });
  });

  test('filter - get all wells with trajectory - no returned in range', async () => {
    const filter: WellFilter = { hasTrajectory: { minDepth: 0, maxDepth: 0 } };
    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.externalId);
    expect(retrievedNames).not.toContain('well:34/10-1');
  });

  test('filter - get all block labels', async () => {
    const blocks: String[] = await client.wells.blocks();

    expect(blocks).toContain('34/10');
    expect(blocks).toContain('B');
  });

  test('filter - get all field labels', async () => {
    const fields = await client.wells.fields();

    expect(fields).toContain('A');
    expect(fields).toContain('B');
  });

  test('filter - get all operator labels', async () => {
    const operators = await client.wells.operators();

    expect(operators).toContain('B');
    expect(operators).toContain('Op1');
  });

  test('filter - get all quadrants labels', async () => {
    const quadrants = await client.wells.quadrants();

    expect(quadrants).toContain('8');
  });

  test('filter - get all source labels', async () => {
    const sources = await client.wells.sources();

    expect(sources).toContain('EDM');
  });

  test('filter - get all measurement types', async () => {
    const quadrants = await client.wells.measurements();

    expect(quadrants).not.toBeUndefined();
    expect(quadrants).toContain('GammaRay');
    expect(quadrants).toContain('Density');
  });

  test('filter - has gamma measurement', async () => {
    const measurementFilter: MeasurementFilter = {
      measurementType: MeasurementType.GammaRay,
    };
    const measurementFilters: MeasurementFilters = {
      containsAll: [measurementFilter],
    };
    const filter: WellFilter = { hasMeasurements: measurementFilters };

    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.externalId);
    const WdlNames = ['well:34/10-8', 'well:34/10-1'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });
  });

  test('filter - has multiple measurements, must match on all', async () => {
    const gammaRayFilter: MeasurementFilter = {
      measurementType: MeasurementType.GammaRay,
    };
    const densityFilter: MeasurementFilter = {
      measurementType: MeasurementType.Density,
    };
    const measurementFilters: MeasurementFilters = {
      containsAll: [gammaRayFilter, densityFilter],
    };
    const filter: WellFilter = { hasMeasurements: measurementFilters };

    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.externalId);
    const WdlNames = ['well:34/10-8', 'well:34/10-1'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });
  });

  test('filter - has multiple measurements, fail to match on all', async () => {
    const gammaRayFilter: MeasurementFilter = {
      measurementType: MeasurementType.GammaRay,
    };
    const densityFilter: MeasurementFilter = {
      measurementType: MeasurementType.Density,
    };
    const geomechanicsFilter: MeasurementFilter = {
      measurementType: MeasurementType.Geomechanics,
    };
    const measurementFilters: MeasurementFilters = {
      containsAll: [gammaRayFilter, densityFilter, geomechanicsFilter],
    };
    const filter: WellFilter = { hasMeasurements: measurementFilters };

    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    expect(wells.items.length).toBe(0);
  });

  test('filter - has multiple measurements, can match on any', async () => {
    const gammaRayFilter: MeasurementFilter = {
      measurementType: MeasurementType.GammaRay,
    };
    const densityFilter: MeasurementFilter = {
      measurementType: MeasurementType.Density,
    };
    const geomechanicsFilter: MeasurementFilter = {
      measurementType: MeasurementType.Geomechanics,
    };
    const measurementFilters: MeasurementFilters = {
      containsAny: [gammaRayFilter, densityFilter, geomechanicsFilter],
    };
    const filter: WellFilter = { hasMeasurements: measurementFilters };

    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();
    const retrievedNames = wells.items.map(well => well.externalId);
    const WdlNames = ['well:34/10-8', 'well:34/10-1'];
    WdlNames.forEach(name => {
      expect(retrievedNames).toContain(name);
    });
  });

  test('get spudDate on well', async () => {
    const well = await client.wells.getById(8091617722352417);
    const date = new Date('2017-05-17');

    expect(well.spudDate).toBeInstanceOf(Date);
    expect(well.spudDate?.toLocaleDateString()).toBe(date.toLocaleDateString());
  });

  test('filter wells on water depth', async () => {
    const waterDepthFilter: LengthRange = {
      unit: LengthUnitEnum.METER,
      min: 125.0,
      max: 250.0,
    };
    const filter: WellFilter = { waterDepth: waterDepthFilter };

    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();

    const externalIds = wells.items.map(well => well.externalId);
    expect(externalIds).toContain('well:CasingWear');
  });

  test('filter wells on water depth in feet', async () => {
    const waterDepthFilter: LengthRange = {
      unit: LengthUnitEnum.FOOT,
      min: 30.0,
      max: 40.0,
    };
    const filter: WellFilter = { waterDepth: waterDepthFilter };

    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();

    const externalIds = wells.items.map(well => well.externalId);
    expect(externalIds).toContain('well:34/10-8');
  });

  test('partial well filter', async () => {
    const waterDepthFilter: LengthRange = {
      unit: LengthUnitEnum.METER,
      max: 500.0,
    };
    const filter: WellFilter = { waterDepth: waterDepthFilter };

    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();

    const externalIds = wells.items.map(well => well.externalId);
    expect(externalIds).toContain('well:34/10-8');
  });

  test('filter on spud date', async () => {
    const dateFilter: DateRange = {
      min: new Date(2017, 0, 1),
      max: new Date(2018, 0, 1),
    };
    const filter: WellFilter = { spudDate: dateFilter };

    const wells = await client.wells.filter(filter, undefined, 1);

    expect(wells).not.toBeUndefined();

    const externalIds = wells.items.map(well => well.externalId);
    expect(externalIds).toContain('well:34/10-8');
  });

  test('filter on well type', async () => {
    const wellTypeFilter: string[] = ['production'];
    const filter: WellFilter = { wellTypes: wellTypeFilter };

    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();

    const externalIds = wells.items.map(well => well.externalId);
    expect(externalIds).toContain('well:34/10-8');
  });

  test('filter on license', async () => {
    const wellLicenseFilter: string[] = ['well license'];
    const filter: WellFilter = { licenses: wellLicenseFilter };

    const wells = await client.wells.filter(filter);

    expect(wells).not.toBeUndefined();

    const externalIds = wells.items.map(well => well.externalId);
    expect(externalIds).toContain('well:34/10-8');
  });

  test('filter well on npt depth and duration', async () => {
    const filter: WellFilter = {
      npt: {
        duration: {max: 30.0},
        measuredDepth: { max: 3000.0, unit: LengthUnitEnum.METER }
      },
    };

    const wells = await client.wells.filter(filter);
    const externalIds = wells.items.map(well => well.externalId);
    expect(externalIds).toContain('well:34/10-8');
  });

  test('filter well on npt criterias matching on all', async () => {

    const filter: WellFilter = {
      npt: {
      duration: { min: 1.0, max: 3000.0 },
      measuredDepth: { min: 1800, max: 3000.0, unit: LengthUnitEnum.METER },
      nptCodes: { containsAll: ["FJSB", "GSLB"]},
      nptCodeDetails: { containsAll: ["SLSN", "OLSF"]},
      },
    };

    const wells = await client.wells.filter(filter);
    const externalIds = wells.items.map(well => well.externalId);
    expect(externalIds).toContain('well:34/10-8');
  });

  test('filter well on npt criterias matching on any', async () => {

    const filter: WellFilter = {
      npt: {
      duration: { min: 1.0, max: 3000.0 },
      measuredDepth: { min: 1800, max: 3000.0, unit: LengthUnitEnum.METER },
      nptCodes: { containsAny: ["FJSB", "GSLB", "XSLC"]},
      nptCodeDetails: { containsAny: ["SLSN", "OLSF", "ZJST"]},
      },
    };

    const wells = await client.wells.filter(filter);
    const externalIds = wells.items.map(well => well.externalId);

    const actual = new Set(externalIds);
    const expected = new Set(['well:34/10-24', 'well:34/10-8'])
    const intersection = [...actual].filter(x => expected.has(x!));

    expect(intersection.length).toBe(expected.size);
  });

  test('filter well on npt depth', async () => {
    const filter: WellFilter = {
      npt: {
        measuredDepth: { min: 500000.0, unit: LengthUnitEnum.METER }
      },
    };

    const wells = await client.wells.filter(filter);
    expect(wells).not.toBeUndefined();
  });

  test('filter well on nds probability and severity', async () => {
    const filter: WellFilter = {
      nds: {
        severities: [1],
        probabilities: [1]
      },
    };

    const wells = await client.wells.filter(filter);
    expect(wells).not.toBeUndefined();
    const wellNames = wells.items.map(well => well.externalId)
    expect(wellNames).toContain("well:34/10-24")
  });

  test('filter well on risk types', async () => {
    const filter: WellFilter = {
      nds: {
        riskTypes: ["Hydraulics", "Wellbore stability"]
      },
    };

    const wells = await client.wells.filter(filter);
    expect(wells).not.toBeUndefined();
    const wellNames = wells.items.map(well => well.externalId)
    expect(wellNames).not.toContain("well:35/10-24")
    expect(wellNames).toContain("well:34/10-1")
    expect(wellNames).toContain("well:34/10-8")
  });

  test('filter well on risk types and multiple severities', async () => {
    const filter: WellFilter = {
      nds: {
        severities: [1, 3],
        riskTypes: ["Wellbore stability"]
      },
    };

    const wells = await client.wells.filter(filter);
    expect(wells).not.toBeUndefined();
    const wellNames = wells.items.map(well => well.externalId)
    expect(wellNames).not.toContain("well:35/10-24")
    expect(wellNames).not.toContain("well:34/10-1")
    expect(wellNames).toContain("well:34/10-8")
  });
});

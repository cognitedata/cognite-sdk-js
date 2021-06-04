// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import CogniteWellsClient from 'wells/src/client/cogniteWellsClient';
import { NPTItems } from 'wells/src/client/model/NPT';
import { NPTFilter } from 'wells/src/client/model/NPTFilter';

enum LengthUnitEnum {
  METER = 'meter',
  FOOT = 'foot',
  INCH = 'inch',
  YARD = 'yard',
}

const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in surveys - integration test', () => {
  let client: CogniteWellsClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('List all NPT events', async () => {
    const nptItems: NPTItems = await client.events.listNPT({});
    const nptEvents = nptItems.items;
    expect(nptEvents).not.toBeUndefined();

    expect(nptEvents.length).toBeGreaterThanOrEqual(2);
    const sourceEventExternalIds = nptEvents.map(
      event => event.sourceEventExternalId
    );
    expect(sourceEventExternalIds).toContain('m2rmB');
  });

  test('Filter NPT Events by duration range and depth in meters', async () => {
    const filter: NPTFilter = {
      duration: { min: 21.0, max: 23.0 },
      measuredDepth: { min: 2000.0, max: 3000.0, unit: LengthUnitEnum.METER },
    };

    const nptItems: NPTItems = await client.events.listNPT(filter);
    const nptEvents = nptItems.items;
    expect(nptEvents).not.toBeUndefined();

    const sourceEventExternalIds = nptEvents.map(
      event => event.sourceEventExternalId
    );
    expect(sourceEventExternalIds).toContain('m2rmB');
  });


  test('list with limit, then cursor and limit', async () => {
    const filter: NPTFilter = {};
    const eventsWithLimit: NPTItems = await client.events.listNPT(filter, undefined, 1);
    expect(eventsWithLimit).not.toBeUndefined();
    expect(eventsWithLimit.items.length).toBe(1);

    const eventsWithCursor: NPTItems = await client.events.listNPT(filter, eventsWithLimit.nextCursor, 1);
    expect(eventsWithCursor).not.toBeUndefined();
    expect(eventsWithCursor.items.length).toBe(1);
  });

  test('Filter NPT Events by depth in feet', async () => {
    const filter: NPTFilter = {
      measuredDepth: { min: 9000.0, max: 10000.0, unit: LengthUnitEnum.FOOT },
    };

    const nptItems: NPTItems = await client.events.listNPT(filter);
    const nptEvents = nptItems.items;
    expect(nptEvents).not.toBeUndefined();

    nptEvents.forEach(event => {
      /* eslint-disable */
      expect(event.measuredDepth?.unit).toBe(LengthUnitEnum.FOOT);
      expect(event.measuredDepth?.value).toBeGreaterThan(9000.0);
      expect(event.measuredDepth?.value).toBeLessThan(10000.0);
      /* eslint-enable */
    });
    const sourceEventExternalIds = nptEvents.map(
      event => event.sourceEventExternalId
    );
    expect(sourceEventExternalIds).toContain('m2rmB');
  });

  test('Filter NPT events with no results', async () => {
    const filter: NPTFilter = {
      duration: { min: 21.0, max: 23.0 },
      nptCodes: ['some-code'],
      nptCodeDetails: ['some-detail'],
    };

    const nptItems: NPTItems = await client.events.listNPT(filter);
    const nptEvents = nptItems.items;
    expect(nptEvents).not.toBeUndefined();
    expect(nptEvents.length).toBe(0);
  });

  test('Filter NPT events with match', async () => {
    const filter: NPTFilter = {
      duration: { min: 1.0, max: 30.0 },
      measuredDepth: { min: 1800.0, max: 3000.0, unit: LengthUnitEnum.METER },
      nptCodes: ['FJSB', 'GSLB'],
      nptCodeDetails: ['SLSN', 'OLSF'],
    };

    const nptItems: NPTItems = await client.events.listNPT(filter);
    const externalIds = nptItems.items.map(npt => npt.sourceEventExternalId);

    const actual = new Set(externalIds);
    const expected = new Set(['h2rmk', 'YTX8R'])
    const intersection = [...actual].filter(x => expected.has(x!));

    expect(intersection.length).toBe(expected.size);
  });

  test('List all NPT by wellbore ids', async () => {
    const filter: NPTFilter = {wellboreIds: [8620912644845543, 8269456345006483]};
    const nptEvents: NPTItems = await client.events.listNPT(filter)
    const actual = nptEvents.items.map(npt => npt.sourceEventExternalId);
    const expected = new Set(['m2rmk', 'h2rmk', 'YTX8R'])
    const intersection = actual.filter(x => expected.has(x!));
    expect(intersection.length).toBe(expected.size);
  });

  test('List all NPT codes', async () => {
    const nptCodes: string[] = await client.events.nptCodes();
    const actual = nptCodes;
    const expected = new Set(['FJSB', 'GSLB', 'XSLC'])
    const intersection = actual.filter(x => expected.has(x!));
    expect(intersection.length).toBe(expected.size);
  });

  test('List all NPT Detail codes', async () => {
    const nptDetailCodes: string[] = await client.events.nptDetailCodes();
    const actual = nptDetailCodes;
    const expected = new Set(["OLSF", "SLSN", "ZJST"])
    const intersection = actual.filter(x => expected.has(x!));
    expect(intersection.length).toBe(expected.size);
  });

  test('List all NDS Risk Types', async () => {
    const ndsRiskTypes: string[] = await client.events.ndsRiskTypes();
    ["Mechanical", "Equipment failure", "Wellbore stability", "Hydraulics"].forEach ( type =>
      expect(ndsRiskTypes).toContain(type)
    )
  });
});

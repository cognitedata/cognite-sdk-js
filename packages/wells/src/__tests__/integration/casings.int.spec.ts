import { setupLoggedInClient } from '../testUtils';
import CogniteWellsClient from 'wells/src/client/cogniteWellsClient';
import { Sequence, SequenceData } from 'wells/src/client/model/Sequence';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in surveys - integration test', () => {
  let client: CogniteWellsClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('Get casing from well id', async () => {
    const casingExtId = 'casing:CasingWear';
    const wellId = 5432591169464385;
    const casings: Sequence[] = await client.wellbores.getCasings(wellId);

    expect(casings.length).toBeGreaterThan(0);
    casings.forEach(casing => {
      expect(casing.externalId).toBe(casingExtId);
      /* eslint-disable */
      expect(casing.columns?.length).toBe(7);
      /* eslint-enable */
    });
  });

  test('Get casing from well id with 404', async () => {
    const wellId: number = 10000000000000;

    await client.wellbores.getCasings(wellId).catch(err => {
      expect(err.status).toBe(404);
    });
  });

  test('Get casings data from wellbore id', async () => {
    const casingExtId = 'casing:CasingWear';
    const wellboreId = 8269456345006483;
    const casings: Sequence[] = await client.wellbores.getCasings(wellboreId);

    expect(casings.length).toBeGreaterThan(0);
    const casing = casings.find(casing => casing.externalId === casingExtId);
    expect(casing).not.toBeNull();
  });

  test('Get casings data from wellbore ids', async () => {
    const casingExtId = 'casing:CasingWear';

    const wellboreId = 8269456345006483;

    const casings = await client.casings.getByWellboreIds([wellboreId]);
    expect(casings.length).toBeGreaterThan(0);
    const casing = casings.find(casing => casing.externalId === casingExtId)!;
    expect(casing).not.toBeNull();
    const data = await casing.data();
    expect(data.id).toBe(casing.id);
  });

  // test('Get casings on the wellbore object', async () => {
  //   const wellId: number = 5432591169464385;

  //   const wellbores: Wellbore[] = await client.wellbores.getFromWell(wellId);
  //   expect(wellbores).not.toBeUndefined();

  //   for (const wellbore of wellbores) {
  //     const casings: Sequence[] = await wellbore.casings();
  //     expect(casings.length).toBeGreaterThan(0);
  //     for (const casing of casings) {
  //       expect(casing.columns?.length).toBe(7);
  //     }
  //   }
  // });

  test('Get casing data on casing object', async () => {
    const casingExtId = 'casing:CasingWear';
    const wellboreId: number = 8269456345006483;
    const casings: Sequence[] = await client.wellbores.getCasings(wellboreId);

    expect(casings.length).toBeGreaterThan(0);
    for (const casing of casings) {
      expect(casing.externalId).toBe(casingExtId);
      expect(casing.columns?.length).toBe(7);

      const data: SequenceData = await casing.data();

      expect(data).not.toBeUndefined();

      expect(data.externalId).toBe(casingExtId);

      expect(data.columns.length).toBe(7);
      expect(data.rows.length).toBe(3);
    }
  });
});

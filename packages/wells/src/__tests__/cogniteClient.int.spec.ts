// Copyright 2020 Cognite AS
import { createWellsClient } from '../client/clientCreateUtils';
import { WellFilter } from '../client/model/WellFilter';
import { authTokens } from './testUtils';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in wells - integration test', () => {
  // test api-key login
  test('api-key login', async () => {
    const client = createWellsClient('WELLS TEST CLIENT');
    expect(client.isLoggedIn).toBe(false);

    client.loginWithApiKey({
      project: process.env.COGNITE_WELLS_PROJECT as string,
      apiKey: process.env.COGNITE_WELLS_CREDENTIALS as string,
    });

    expect(client.isLoggedIn).toBe(true);
  });

  // test api-key login
  test('bearer-token login', async () => {
    const client = createWellsClient('WELLS TEST CLIENT');
    expect(client.isLoggedIn).toBe(false);

    client.loginWithToken({
      project: process.env.COGNITE_WELLS_PROJECT as string,
      accessToken: authTokens.accessToken,
      refreshToken: () => 'new fresh token',
    });

    expect(client.isLoggedIn).toBe(true);

    // get 403 due to invalid token
    client.wells
      .getById(3109548670)
      .then(response => response)
      .catch(err => {
        expect(err.status).toBe(403);
      });

    // get 403 due to invalid token
    const testPolygon =
      'POLYGON ((0.0 0.0, 0.0 80.0, 80.0 80.0, 80.0 0.0, 0.0 0.0))';
    const filter: WellFilter = {
      polygon: { wktGeometry: testPolygon, crs: 'epsg:4326' },
      sources: ['edm'],
    };

    client.wells
      .filter(filter)
      .then(response => response)
      .catch(err => {
        expect(err.status).toBe(403);
      });
  });
});

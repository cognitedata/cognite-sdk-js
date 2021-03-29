// Copyright 2020 Cognite AS
import { RefreshToken } from '../client/clientAuthUtils';
import { createWellsClient } from '../client/clientCreateUtils';
import CogniteWellsClient from '../client/cogniteWellsClient';
import { Cluster } from '../client/model/Cluster';
import { WellFilter } from '../client/model/WellFilter';
import {
  BLUEFIELD_BASE_URL,
  BP_NORTHEUROPE_DEV_BASE_URL,
  COGDEV_BASE_URL,
} from '../constants';
import { authTokens } from './testUtils';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in wells - integration test', () => {
  // test api-key login
  test('api-key login', async () => {
    const client = createWellsClient('WELLS TEST CLIENT', Cluster.API);
    expect(client.isLoggedIn).toBe(false);

    client.loginWithApiKey({
      project: process.env.COGNITE_WELLS_PROJECT as string,
      apiKey: process.env.COGNITE_WELLS_CREDENTIALS as string,
    });

    expect(client.isLoggedIn).toBe(true);
  });

  test('bearer-token login', async () => {
    const client = createWellsClient('WELLS TEST CLIENT');
    expect(client.isLoggedIn).toBe(false);

    const functionThatReturnsANewToken: RefreshToken = () => 'new fresh token';

    client.loginWithToken({
      project: process.env.COGNITE_WELLS_PROJECT as string,
      accessToken: authTokens.accessToken,
      refreshToken: functionThatReturnsANewToken,
    });

    expect(client.isLoggedIn).toBe(true);

    // get 403 due to invalid token
    client.wells
      .getById(3109548670)
      .then(response => response)
      .catch(err => {
        expect(err.status).toBeGreaterThanOrEqual(400);
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
        expect(err.status).toBeGreaterThanOrEqual(400);
      });
  });

  // test api-key login
  test('configure base url', async () => {
    let client = createWellsClient('WELLS TEST CLIENT');
    expect(client.isLoggedIn).toBe(false);

    const functionThatReturnsANewToken: RefreshToken = () => 'new fresh token';

    client.loginWithToken({
      project: process.env.COGNITE_WELLS_PROJECT as string,
      accessToken: authTokens.accessToken,
      refreshToken: functionThatReturnsANewToken,
    });

    expect(client.isLoggedIn).toBe(true);
    expect(client.getBaseUrl).toBe(COGDEV_BASE_URL);

    client = createWellsClient('WELLS TEST CLIENT', Cluster.BP);
    expect(client.isLoggedIn).toBe(false);
    expect(client.getBaseUrl).toBe(COGDEV_BASE_URL);

    client = createWellsClient('WELLS TEST CLIENT', Cluster.BLUEFIELD);
    expect(client.isLoggedIn).toBe(false);
    expect(client.getBaseUrl).toBe(BLUEFIELD_BASE_URL);

    client = createWellsClient('WELLS TEST CLIENT', Cluster.BP_NORTHEUROPE);
    expect(client.isLoggedIn).toBe(false);
    expect(client.getBaseUrl).toBe(BP_NORTHEUROPE_DEV_BASE_URL);

    client = new CogniteWellsClient({
      appId: 'WELLS TEST CLIENT',
      cluster: Cluster.BP_NORTHEUROPE,
    });

    expect(client.isLoggedIn).toBe(false);
    expect(client.getBaseUrl).toBe(BP_NORTHEUROPE_DEV_BASE_URL);
  });
});

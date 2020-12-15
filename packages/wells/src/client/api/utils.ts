import { CogniteGeospatialClient } from '@cognite/geospatial-sdk-js';
import { Constants } from '@cognite/sdk-core';
import CogniteWellsClient from '../CogniteWellsClient';
import { Cluster } from '../model/Cluster';

export function createWellsClient(
  appId: string,
  cluster: Cluster = Cluster.API
): CogniteWellsClient {
  return new CogniteWellsClient(
    {
      appId: appId,
    },
    cluster
  );
}

export const geospatialClient = CogniteGeospatialClient({
  project: process.env.COGNITE_WELLS_PROJECT as string,
  api_key: process.env.COGNITE_WELLS_CREDENTIALS as string,
  api_url: Constants.BASE_URL,
});

export const WELL_SERVICE_BASE_URL =
  'https://well-service-cognitedata-development.cognite.ai';

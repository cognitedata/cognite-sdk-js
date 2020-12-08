// Copyright 2020 Cognite AS

import { name } from '../../package.json';
import { WELL_SERVICE_BASE_URL } from '../client/api/utils';
import CogniteWellsClient from '../client/CogniteWellsClient';

export function setupClient(
  baseUrl: string = WELL_SERVICE_BASE_URL
): CogniteWellsClient {
  return new CogniteWellsClient({
    appId: `JS WELLS SDK integration tests (${name})`,
    baseUrl,
  });
}

export function setupLoggedInClient(): CogniteWellsClient {
  const client = setupClient();
  client.loginWithApiKey({
    project: process.env.COGNITE_WELLS_PROJECT as string,
    apiKey: process.env.COGNITE_WELLS_CREDENTIALS as string,
  });

  return client;
}

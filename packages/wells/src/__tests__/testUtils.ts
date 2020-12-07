// Copyright 2020 Cognite AS

import { Constants } from '@cognite/sdk-core';
import { name } from '../../package.json';
import CogniteWellsClient from '../client/CogniteWellsClient';

export function setupClient(
  baseUrl: string = Constants.BASE_URL
): CogniteWellsClient {
  return new CogniteWellsClient({
    appId: `JS SDK integration tests (${name})`,
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

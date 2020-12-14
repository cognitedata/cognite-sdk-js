// Copyright 2020 Cognite AS

import { name } from '../../package.json';
import CogniteWellsClient from '../client/CogniteWellsClient';

export function setupClient(): CogniteWellsClient {
  return new CogniteWellsClient({
    appId: `JS WELLS SDK integration tests (${name})`,
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

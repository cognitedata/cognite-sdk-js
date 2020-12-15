// Copyright 2020 Cognite AS
import { createWellsClient } from '../client/api/utils';
import CogniteWellsClient from '../client/CogniteWellsClient';

export function setupLoggedInClient(): CogniteWellsClient {
  const client = createWellsClient('WELLS TEST CLIENT');
  client.loginWithApiKey({
    project: process.env.COGNITE_WELLS_PROJECT as string,
    apiKey: process.env.COGNITE_WELLS_CREDENTIALS as string,
  });

  return client;
}

// Copyright 2020 Cognite AS
import { createWellsClient } from '../client/clientCreateUtils';
import CogniteWellsClient from '../client/cogniteWellsClient';

export function setupLoggedInClient(): CogniteWellsClient {
  const client = createWellsClient('WELLS TEST CLIENT');
  client.loginWithApiKey({
    project: process.env.COGNITE_WELLS_PROJECT as string,
    apiKey: process.env.COGNITE_WELLS_CREDENTIALS as string,
  });

  return client;
}

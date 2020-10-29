// Copyright 2020 Cognite AS

import { Constants } from '@cognite/sdk-core';
import CogniteClient from '../client/cogniteClient';
import { name } from '../../package.json';

export function setupClient(
  baseUrl: string = Constants.BASE_URL
): CogniteClient {
  return new CogniteClient({
    appId: `JS SDK integration tests (${name})`,
    baseUrl,
  });
}

export function setupLoggedInClient(): CogniteClient {
  const client = setupClient();
  client.loginWithApiKey({
    project: process.env.COGNITE_WELLS_PROJECT as string,
    apiKey: process.env.COGNITE_WELLS_CREDENTIALS as string,
  });
  return client;
}

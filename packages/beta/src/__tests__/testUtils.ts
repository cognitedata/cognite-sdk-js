// Copyright 2020 Cognite AS

import { Constants } from '@cognite/sdk-core';
import CogniteClient from '../cogniteClient';
import { apiKey, mockBaseUrl, project } from '@cognite/sdk-core/src/testUtils';

export function setupClient(baseUrl: string = Constants.BASE_URL) {
  return new CogniteClient({
    appId: 'JS SDK integration tests (beta)',
    project: process.env.COGNITE_PROJECT || (project as string),
    apiKeyMode: true,
    getToken: () => Promise.resolve(apiKey as string),
    baseUrl,
  });
}

export function setupLoggedInClient(baseUrl: string = Constants.BASE_URL) {
  return new CogniteClient({
    appId: 'JS SDK integration tests (beta)',
    project: process.env.COGNITE_PROJECT as string,
    getToken: () =>
      login().then((account) => {
        return account.access_token;
      }),
    baseUrl,
  });
}

export function setupMockableClient() {
  const client = setupClient(mockBaseUrl);
  return client;
}

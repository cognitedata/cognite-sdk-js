// Copyright 2020 Cognite AS

import { Constants } from '@cognite/sdk-core';
import CogniteClient from '../cogniteClient';
import { apiKey, mockBaseUrl, project } from '@cognite/sdk-core/src/testUtils';
import { login } from './login';

export function setupClient(baseUrl: string = Constants.BASE_URL) {
  return new CogniteClient({
    appId: 'JS SDK integration tests (beta)',
    project: process.env.COGNITE_PROJECT || (project as string),
    apiKeyMode: true,
    getToken: () => Promise.resolve(apiKey as string),
    baseUrl,
  });
}

export function setupLoggedInClient() {
  return new CogniteClient({
    appId: 'JS SDK integration tests (beta)',
    baseUrl: process.env.COGNITE_BASE_URL,
    project: process.env.COGNITE_PROJECT as string,
    getToken: () =>
      login().then((account) => {
        return account.access_token;
      }),
  });
}

export function setupMockableClient() {
  const client = setupClient(mockBaseUrl);
  return client;
}

// Copyright 2020 Cognite AS

import CogniteClientPlayground from '../cogniteClientPlayground';
import {
  apiKey,
  mockBaseUrl,
  project,
} from '@cognite/sdk-core/src/__tests__/testUtils';
import { login } from './login';

export function setupLoggedInClient(
  baseUrl: string = process.env.COGNITE_BASE_URL as string
) {
  return new CogniteClientPlayground({
    appId: 'JS SDK integration tests (playground)',
    getToken: () =>
      login().then((account) => {
        return account.access_token;
      }),
    project: process.env.COGNITE_PROJECT as string,
    baseUrl,
  });
}

export function setupMockableClient(baseUrl: string = mockBaseUrl) {
  return new CogniteClientPlayground({
    appId: 'JS SDK integration tests (playground)',
    getToken: () => Promise.resolve(apiKey),
    project,
    baseUrl,
    apiKeyMode: true,
  });
}

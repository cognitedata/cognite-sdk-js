// Copyright 2020 Cognite AS

import { Constants } from '@cognite/sdk-core';
import CogniteClientPlayground from '../cogniteClientPlayground';
import { apiKey, mockBaseUrl, project } from '@cognite/sdk-core/src/testUtils';

export function setupLoggedInClient(baseUrl: string = Constants.BASE_URL) {
  return new CogniteClientPlayground({
    appId: 'JS SDK integration tests (playground)',
    getToken: () => Promise.resolve(process.env.COGNITE_CREDENTIALS as string),
    project: process.env.COGNITE_PROJECT as string,
    baseUrl,
    apiKeyMode: true,
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

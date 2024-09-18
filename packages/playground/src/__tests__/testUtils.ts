// Copyright 2020 Cognite AS

import {
  accessToken,
  mockBaseUrl,
  project,
} from '@cognite/sdk-core/src/__tests__/testUtils';
import CogniteClientPlayground from '../cogniteClientPlayground';
import { login } from './login';

export function setupLoggedInClient(
  baseUrl: string = process.env.COGNITE_BASE_URL as string
) {
  return new CogniteClientPlayground({
    appId: 'JS SDK integration tests (playground)',
    oidcTokenProvider: () =>
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
    oidcTokenProvider: () => Promise.resolve(accessToken),
    project,
    baseUrl,
  });
}

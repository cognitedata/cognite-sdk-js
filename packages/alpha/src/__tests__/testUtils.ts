// Copyright 2023 Cognite AS

import { mockBaseUrl } from '../../../core/src/__tests__/testUtils';
import CogniteClientAlpha from '../cogniteClient';
import { login } from './login';

export function setupLoggedInClient() {
  return new CogniteClientAlpha({
    appId: 'JS SDK integration tests (alpha)',
    baseUrl: process.env.COGNITE_BASE_URL,
    project: process.env.COGNITE_PROJECT as string,
    oidcTokenProvider: () =>
      login().then((account) => {
        return account.access_token;
      }),
  });
}

export function setupMockableClient() {
  return new CogniteClientAlpha({
    appId: 'JS SDK unit tests (alpha)',
    project: process.env.COGNITE_PROJECT || 'unit-test',
    baseUrl: mockBaseUrl,
    oidcTokenProvider: () => Promise.resolve('test accessToken'),
  });
}

export function randomInt() {
  return Math.floor(Math.random() * 10000000000);
}

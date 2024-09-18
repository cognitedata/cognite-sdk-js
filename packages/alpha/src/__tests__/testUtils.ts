// Copyright 2023 Cognite AS

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

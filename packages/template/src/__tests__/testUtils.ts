// Copyright 2020 Cognite AS

import { Constants } from '@cognite/sdk-core';
import CogniteClient from '../cogniteClient';
import { name } from '../../package.json';

export function setupClient(baseUrl: string = Constants.BASE_URL) {
  return new CogniteClient({
    project: 'unknown',
    getToken: () => Promise.reject(new Error('SDK not logged in')),
    appId: `JS SDK integration tests (${name})`,
    baseUrl,
  });
}

export function setupLoggedInClient() {
  return new CogniteClient({
    project: process.env.COGNITE_PROJECT as string,
    getToken: () => Promise.resolve(process.env.COGNITE_CREDENTIALS as string),
    apiKeyMode: true,
    appId: `JS SDK integration tests (${name})`,
    baseUrl: Constants.BASE_URL,
  });
}

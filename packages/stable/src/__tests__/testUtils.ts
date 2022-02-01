// Copyright 2020 Cognite AS

import { Constants, TestUtils } from '@cognite/sdk-core';
import { ConfidentialClientApplication } from '@azure/msal-node';
import CogniteClient from '../cogniteClient';
import { ExternalFileInfo } from '../types';

export const {
  apiKey,
  mockBaseUrl,
  project,
  randomInt,
  runTestWithRetryWhenFailing,
  string2arrayBuffer,
  getSortedPropInArray,
  retryInSeconds,
  simpleCompare,
} = TestUtils;

export function setupClient(baseUrl: string = Constants.BASE_URL) {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: 'unit-test',
    getToken: () => Promise.reject(new Error('not logged in')),
    baseUrl,
  });
}

export function setupLoggedInClientWithOidc() {
  const cluster = process.env.COGNITE_CLUSTER as string;
  const baseUrl = `https://${cluster}.cognitedata.com`;

  const pca = new ConfidentialClientApplication({
    auth: {
      clientId: process.env.COGNITE_CLIENT_ID as string,
      clientSecret: process.env.COGNITE_CLIENT_SECRET as string,
      authority: `https://login.microsoftonline.com/${
        process.env.COGNITE_AZURE_TENANT_ID as string
      }`,
    },
  });

  return new CogniteClient({
    appId: 'JS SDK integration tests',
    baseUrl,
    project: process.env.COGNITE_OIDC_PROJECT as string,
    getToken: () =>
      pca
        .acquireTokenByClientCredential({
          scopes: [`${baseUrl}/.default`],
          skipCache: true,
        })
        .then((response: any) => response?.accessToken as string),
  });
}

export function setupLoggedInClient() {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: process.env.COGNITE_PROJECT as string,
    getToken: () => Promise.resolve(process.env.COGNITE_CREDENTIALS as string),
    apiKeyMode: true,
    baseUrl: Constants.BASE_URL,
  });
}

export function setupMockableClient() {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: process.env.COGNITE_PROJECT as string,
    getToken: () => Promise.resolve(process.env.COGNITE_CREDENTIALS as string),
    apiKeyMode: true,
    baseUrl: mockBaseUrl,
  });
}

export const getFileCreateArgs = (
  additionalFields: Partial<ExternalFileInfo> = {}
) => {
  const postfix = randomInt();
  const fileContent = 'content_' + new Date();
  const sourceCreatedTime = new Date();
  const localFileMeta: ExternalFileInfo = {
    name: 'filename_0_' + postfix,
    mimeType: 'text/plain;charset=UTF-8',
    directory: '/test/testing',
    metadata: {
      key: 'value',
    },
    sourceCreatedTime,
    ...additionalFields,
  };

  return { postfix, fileContent, sourceCreatedTime, localFileMeta };
};

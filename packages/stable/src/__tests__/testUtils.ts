// Copyright 2020 Cognite AS

import { TestUtils } from '@cognite/sdk-core';
import CogniteClient from '../cogniteClient';
import { ExternalFileInfo } from '../types';
import { ConfidentialClientApplication } from '@azure/msal-node';

const BASE_URL = 'https://greenfield.cognitedata.com';

function setupClient(baseUrl: string = BASE_URL) {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: 'unit-test',
    baseUrl,
    getToken: () => Promise.resolve('not logged in'),
  });
}

function setupLoggedInClient() {
  const authority = `https://login.microsoftonline.com/${process.env.COGNITE_AZURE_TENANT_ID}`;
  const CCA = new ConfidentialClientApplication({
    auth: {
      clientId: process.env.COGNITE_CLIENT_ID as string,
      clientSecret: process.env.COGNITE_CLIENT_SECRET as string,
      knownAuthorities: [],
      authority,
    },
    // cacheOptions, we can later add them to read from msal-common package
  });

  const scopes = [`${BASE_URL}/.default`];
  const client = new CogniteClient({
    appId: 'JS SDK integration tests',
    baseUrl: BASE_URL,
    project: process.env.COGNITE_PROJECT as string,
    //@ts-ignore
    getToken: () =>
      CCA.acquireTokenByClientCredential({ scopes })
        .then((response) => {
          return response?.accessToken as string;
        })
        .catch((error) => {
          console.error(error);
        }),
  });
  return client;
}

function setupMockableClient() {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: 'platypus',
    baseUrl: mockBaseUrl,
    getToken: () => Promise.resolve('test accessToken'),
  });
}

const getFileCreateArgs = (
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

export {
  setupClient,
  setupLoggedInClient,
  setupMockableClient,
  getFileCreateArgs,
};

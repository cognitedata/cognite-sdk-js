// Copyright 2020 Cognite AS

import { Constants } from '@cognite/sdk-core';
import { TestUtils } from '@cognite/sdk-core';
import CogniteClient from '../cogniteClient';
import { ExternalFileInfo } from '../types';
import { ConfidentialClientApplication } from '@azure/msal-node';

function setupClient(baseUrl: string = Constants.BASE_URL) {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: 'unit-test',
    baseUrl,
    apiKeyMode: true,
    getToken: () => Promise.resolve('not logged in'),
  });
}

function setupClientWithNonExistingApiKey() {
  return new CogniteClient({
    appId: 'JS Integration test',
    project: process.env.COGNITE_PROJECT as string,
    apiKeyMode: true,
    getToken: () => Promise.reject('non-existing-api-key'),
  });
}

function setupLoggedInClient() {
  const authority = `https://login.microsoftonline.com/${process.env.COGNITE_AZURE_TENANT_ID}`;

  const CCA = new ConfidentialClientApplication({
    auth: {
      clientId: process.env.COGNITE_CLIENT_ID as string,
      clientSecret: process.env.COGNITE_CLIENT_SECRET as string,
      authority,
    },
    // cacheOptions, we can later add them to read from msal-common package
  });
  const scopes = [`${Constants.BASE_URL}/.default`, 'offline_access'];
  const client = new CogniteClient({
    appId: 'JS SDK integration tests',
    project: process.env.COGNITE_PROJECT as string,
    baseUrl: Constants.BASE_URL,
    // apiKeyMode: true,
    getToken: () =>
      CCA.acquireTokenByClientCredential({ scopes }).then(
        (response) => response?.accessToken as string
      ),
    // getToken: () => Promise.resolve(process.env.COGNITE_CREDENTIALS as string),
  });

  client.authenticate();
  return client;
}

function setupMockableClient() {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: process.env.COGNITE_PROJECT as string,
    baseUrl: mockBaseUrl,
    apiKeyMode: true,
    getToken: () => Promise.resolve(process.env.COGNITE_CREDENTIALS as string),
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
  setupClientWithNonExistingApiKey,
  setupLoggedInClient,
  setupMockableClient,
  getFileCreateArgs,
};

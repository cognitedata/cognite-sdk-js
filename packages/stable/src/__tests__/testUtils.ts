// Copyright 2020 Cognite AS

import { Constants } from '@cognite/sdk-core';
import { TestUtils } from '@cognite/sdk-core';
import CogniteClient from '../cogniteClient';
import { ExternalFileInfo } from '../types';

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
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: process.env.COGNITE_PROJECT as string,
    baseUrl: Constants.BASE_URL,
    apiKeyMode: true,
    getToken: () => Promise.resolve(process.env.COGNITE_CREDENTIALS as string),
  });
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

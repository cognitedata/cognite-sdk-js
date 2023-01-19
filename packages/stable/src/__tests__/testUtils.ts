// Copyright 2020 Cognite AS

import { TestUtils } from '@cognite/sdk-core';
import CogniteClient from '../cogniteClient';
import { ExternalFileInfo } from '../types';
import { login } from './login';

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
  const client = new CogniteClient({
    appId: 'JS SDK integration tests',
    baseUrl: BASE_URL,
    project: process.env.COGNITE_PROJECT as string,
    getToken: () =>
      login().then((account) => {
        return account.access_token;
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

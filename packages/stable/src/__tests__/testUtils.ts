// Copyright 2020 Cognite AS

import { Constants } from '@cognite/sdk-core';
import { TestUtils } from '@cognite/sdk-core';
import CogniteClient from '../cogniteClient';
import { ExternalFileInfo } from '../types';

const oidcBaseUrl = `http://${
  process.env.COGNITE_CLUSTER as string
}.cognitedata.com`;

function setupClient(baseUrl: string = Constants.BASE_URL) {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: 'unit-test',
    baseUrl,
    credentials: {
      method: 'api',
      apiKey: 'not logged in',
    },
  });
}

function setupClientWithClientCredentials() {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    baseUrl: oidcBaseUrl,
    project: process.env.COGNITE_OIDC_PROJECT as string,
    credentials: {
      method: 'client_credentials',
      authority: process.env.COGNITE_AUTHORITY as string,
      client_id: process.env.COGNITE_CLIENT_ID as string,
      client_secret: process.env.COGNITE_CLIENT_SECRET as string,
      grant_type: process.env.COGNITE_GRANT_TYPE as string,
      scope: process.env.COGNITE_SCOPE as string,
    },
  });
}

function setupClientWithNonExistingApiKey() {
  return new CogniteClient({
    appId: 'JS Integration test',
    project: process.env.COGNITE_PROJECT as string,
    credentials: {
      method: 'api',
      apiKey: 'non-existing-api-key',
    },
  });
}

function setupLoggedInClient() {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: process.env.COGNITE_PROJECT as string,
    baseUrl: Constants.BASE_URL,
    credentials: {
      method: 'api',
      apiKey: process.env.COGNITE_CREDENTIALS as string,
    },
  });
}

function setupMockableClient() {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: process.env.COGNITE_PROJECT as string,
    baseUrl: mockBaseUrl,
    credentials: {
      method: 'api',
      apiKey: process.env.COGNITE_CREDENTIALS as string,
    },
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
  oidcBaseUrl,
  setupClientWithClientCredentials,
  setupClientWithNonExistingApiKey,
  setupLoggedInClient,
  setupMockableClient,
  getFileCreateArgs,
};

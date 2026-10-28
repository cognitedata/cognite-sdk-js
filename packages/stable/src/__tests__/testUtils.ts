// Copyright 2020 Cognite AS

import { createReadStream, readFileSync, statSync } from 'node:fs';
import { PassThrough } from 'node:stream';
import { vi } from 'vitest';
import { mockBaseUrl, randomInt } from '../../../core/src/__tests__/testUtils';
import type { ClientOptions } from '../clientOptions';
import CogniteClient from '../cogniteClient';
import type { ExternalFileInfo, NodeOrEdge } from '../types';
import { login } from './login';
import { testConcurrency } from './testConcurrency';

function setupClient(baseUrl: string = process.env.COGNITE_BASE_URL as string) {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: 'unit-test',
    baseUrl,
    oidcTokenProvider: () => Promise.resolve('not logged in'),
  });
}

function setupLoggedInClient() {
  vi.setConfig({
    testTimeout: 25 * 1000,
  });
  const client = new CogniteClient({
    appId: 'JS SDK integration tests',
    baseUrl: process.env.COGNITE_BASE_URL,
    project: process.env.COGNITE_PROJECT as string,
    oidcTokenProvider: () =>
      login().then((account) => {
        return account.access_token;
      }),
    concurrency: testConcurrency,
  });
  return client;
}

function setupMockableClient(options: Partial<ClientOptions> = {}) {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    project: process.env.COGNITE_PROJECT as string,
    baseUrl: mockBaseUrl,
    oidcTokenProvider: () => Promise.resolve('test accessToken'),
    ...options,
  });
}

const RECORDS_TEST_SPACE = 'sdk_test_records_space'; // Space reserved for records integration tests
const DATA_PRODUCT_TEST_SPACE_PREFIX = 'sdk_js_dp';
// Spaces created before the data product suites moved from alpha. They are
// owned by data products, so the generic space cleanup cannot delete them.
const LEGACY_DATA_PRODUCT_TEST_SPACE_PREFIX = 'sdk_js_alpha_dp';
const isDataProductTestSpace = (space: string) =>
  space.startsWith(DATA_PRODUCT_TEST_SPACE_PREFIX) ||
  space.startsWith(LEGACY_DATA_PRODUCT_TEST_SPACE_PREFIX);
// Shared fixture space for the files and datapoints integration tests. Their
// suites run in parallel with the suites that call deleteOldSpaces, so it must
// never be garbage-collected mid-run.
const TEST_DATA_SPACE = 'test_data_space';

const deleteOldSpaces = async (client: CogniteClient) => {
  const fiveMinutesInMs = 5 * 60 * 1000;
  await deleteSpacesNotUpdatedSince(client, Date.now() - fiveMinutesInMs);
};

const deleteSpacesNotUpdatedSince = async (
  client: CogniteClient,
  timestamp: number
) => {
  try {
    // Can max delete 100 spaces at a time thus the limit is set to 100
    const spaces = (await client.spaces.list({ limit: 100 })).items;
    const oldSpaces = spaces.filter(
      (space) =>
        space.lastUpdatedTime < timestamp &&
        space.space !== RECORDS_TEST_SPACE &&
        space.space !== TEST_DATA_SPACE &&
        !isDataProductTestSpace(space.space)
    );

    const spacesList = oldSpaces.map((space) => space.space);
    const spaceContentDeletionPromises = spacesList.map(async (space) => {
      await deleteAllViewsInSpace(client, space);
      await deleteAllDataModelsInSpace(client, space);
      await deleteAllContainersInSpace(client, space);
      await deleteAllInstancesInSpace(client, space);
    });
    await Promise.all(spaceContentDeletionPromises);

    if (spacesList.length) {
      await client.spaces.delete(spacesList);
    }
  } catch (e) {
    console.error(
      `An error occured when trying to delete spaces not updated since ${new Date(
        timestamp
      )}`,
      e
    );
  }
};

const deleteAllContainersInSpace = async (
  client: CogniteClient,
  space: string
) => {
  const containers = (
    await client.containers.list({
      limit: 100,
      space,
      usedFor: ['node', 'edge', 'all', 'record'],
    })
  ).items;

  if (containers.length) {
    await client.containers.delete(
      containers.map((container) => ({
        externalId: container.externalId,
        space: container.space,
      }))
    );
  }
};

const deleteAllInstancesInSpace = async (
  client: CogniteClient,
  space: string
) => {
  const createFilter = (instanceType: 'node' | 'edge') => ({
    limit: 1000,
    instanceType: instanceType,
    filter: {
      in: {
        property: [instanceType, 'space'],
        values: [space],
      },
    },
  });

  const nodeInstances = (await client.instances.list(createFilter('node')))
    .items;
  const edgeInstances = (await client.instances.list(createFilter('edge')))
    .items;

  const deleteInstances = async (instances: NodeOrEdge[]) => {
    client.instances.delete(
      instances.map((instance) => ({
        instanceType: instance.instanceType,
        externalId: instance.externalId,
        space: instance.space,
      }))
    );
  };

  if (nodeInstances.length) {
    await deleteInstances(nodeInstances);
  }
  if (edgeInstances.length) {
    await deleteInstances(edgeInstances);
  }
};

const deleteAllViewsInSpace = async (client: CogniteClient, space: string) => {
  const views = await client.views
    .list({
      limit: 1000,
      space,
      allVersions: true,
      usedFor: ['node', 'edge', 'all', 'record'],
    })
    .autoPagingToArray();

  if (views.length) {
    await client.views.delete(
      views.map((view) => ({
        externalId: view.externalId,
        space: view.space,
        version: view.version,
      }))
    );
  }
};

const deleteAllDataModelsInSpace = async (
  client: CogniteClient,
  space: string
) => {
  const dataModels = (
    await client.dataModels.list({ limit: 100, space, allVersions: true })
  ).items;

  if (dataModels.length) {
    await client.dataModels.delete(
      dataModels.map((dataModel) => ({
        externalId: dataModel.externalId,
        space: dataModel.space,
        version: dataModel.version,
      }))
    );
  }
};

const getFileCreateArgs = (
  additionalFields: Partial<ExternalFileInfo> = {}
) => {
  const postfix = randomInt();
  const fileContent = `content_${new Date()}`;
  const sourceCreatedTime = new Date();
  const localFileMeta: ExternalFileInfo = {
    name: `filename_0_${postfix}`,
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

export function setupMockableClientForIntegrationTests() {
  const client = setupClient(process.env.COGNITE_BASE_URL);
  return client;
}

export function setupLoggedInClientForUnitTest() {
  return new CogniteClient({
    appId: 'JS SDK integration tests',
    baseUrl: process.env.COGNITE_BASE_URL,
    project: process.env.COGNITE_PROJECT as string,
    getToken: () =>
      login().then((account) => {
        return account.access_token;
      }),
  });
}

function divideFileIntoChunks(file: string, numChunks: number) {
  // Read the binary file
  const fileContentBinary = readFileSync(file);

  // Calculate the number of chunks
  const chunkSize = Math.ceil(fileContentBinary.length / numChunks);

  // Array to store the chunks
  const chunks: Buffer[] = [];

  // Divide the file content into chunks
  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    chunks.push(fileContentBinary.slice(start, end));
  }

  return chunks;
}

function toArrayBuffer(buffer: Buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
}

function getFileStats(filePath: string) {
  const fileStats = statSync(filePath);
  const fileSizeInBytes = fileStats.size;
  const minChunkSize = 5 * 1024 * 1024; // 5 MB in bytes
  const maxChunks = 250;
  const chunkSize = Math.max(
    minChunkSize,
    Math.ceil(fileSizeInBytes / maxChunks)
  );
  const numberOfParts = Math.ceil(fileSizeInBytes / chunkSize);
  return { fileSizeInBytes, chunkSize, numberOfParts };
}

async function* divideFileIntoStreams(
  filePath: string,
  fileSizeInBytes: number,
  chunkSize: number
) {
  let bytesRead = 0;
  let chunkNumber = 0;

  while (bytesRead < fileSizeInBytes) {
    const remainingSize = fileSizeInBytes - bytesRead;
    const currentChunkSize = Math.min(chunkSize, remainingSize);

    const currentReadable = createReadStream(filePath, {
      start: bytesRead,
      end: bytesRead + currentChunkSize - 1,
    });

    bytesRead += currentChunkSize;

    const passthroughStream = new PassThrough();
    currentReadable.pipe(passthroughStream);

    yield { chunkNumber, stream: passthroughStream };

    chunkNumber++;
  }
}

async function cleanupDataProductSchemaSpaces(
  client: CogniteClient,
  spaces: string[]
) {
  const dataProducts = await client.dataProducts
    .list({ limit: 100 })
    .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });

  for (const space of spaces) {
    const productsInSpace = dataProducts.filter(
      (product) => product.schemaSpace === space
    );

    for (const product of productsInSpace) {
      // The product may already be gone: deleted by the test itself or by a
      // concurrent run, while still present in the (eventually consistent)
      // listing above. Cleanup must tolerate that rather than fail the suite.
      try {
        const versions = await client.dataProducts.versions
          .list(product.externalId, { limit: 10 })
          .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });

        if (versions.length > 0) {
          await client.dataProducts.versions.delete(
            product.externalId,
            versions.map((version) => ({ version: version.version }))
          );
        }
      } catch {
        // ignore - fall through to the product delete, which is also tolerant
      }

      await client.dataProducts
        .delete([{ externalId: product.externalId }])
        .catch(() => {});
    }

    const views = await client.views
      .list({
        limit: 1000,
        space,
        allVersions: true,
        usedFor: ['node', 'edge', 'all', 'record'],
      })
      .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });

    if (views.length > 0) {
      await client.views
        .delete(
          views.map((view) => ({
            externalId: view.externalId,
            space: view.space,
            version: view.version,
          }))
        )
        .catch(() => {});
    }

    const containers = await client.containers
      .list({ limit: 100, space })
      .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });

    if (containers.length > 0) {
      await client.containers
        .delete(
          containers.map((container) => ({
            externalId: container.externalId,
            space: container.space,
          }))
        )
        .catch(() => {});
    }

    await client.spaces.delete([space]).catch(() => {});
  }
}

/**
 * Only clean up data product test spaces that have been idle for at least this
 * long. The data product suites (and the same suites in the parallel CI matrix
 * job) run concurrently against the same project, and all of them create
 * spaces under the data product test space prefixes. Deleting a space that another
 * live run just created pulls its data products out from under it mid-test,
 * so only spaces old enough to be orphans from a crashed run are removed.
 */
const DATA_PRODUCT_ORPHAN_AGE_THRESHOLD_MS = 15 * 60 * 1000;

async function cleanupOrphanedDataProductTestResources(client: CogniteClient) {
  const cutoff = Date.now() - DATA_PRODUCT_ORPHAN_AGE_THRESHOLD_MS;
  const spaces = (
    await client.spaces
      .list({ limit: 1000 })
      .autoPagingToArray({ limit: Number.POSITIVE_INFINITY })
  )
    .filter(
      (space) =>
        isDataProductTestSpace(space.space) && space.lastUpdatedTime < cutoff
    )
    .map((space) => space.space);

  if (spaces.length > 0) {
    await cleanupDataProductSchemaSpaces(client, spaces);
  }
}

export {
  divideFileIntoChunks,
  getFileStats,
  divideFileIntoStreams,
  toArrayBuffer,
};

export {
  mockBaseUrl,
  project,
  randomInt,
  runTestWithRetryWhenFailing,
  string2arrayBuffer,
  retryInSeconds,
} from '../../../core/src/__tests__/testUtils';

export {
  setupClient,
  setupLoggedInClient,
  setupMockableClient,
  deleteOldSpaces,
  getFileCreateArgs,
  RECORDS_TEST_SPACE,
  TEST_DATA_SPACE,
  DATA_PRODUCT_TEST_SPACE_PREFIX,
  cleanupDataProductSchemaSpaces,
  cleanupOrphanedDataProductTestResources,
};

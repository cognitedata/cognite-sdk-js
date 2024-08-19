// Copyright 2020 Cognite AS

import { createReadStream, readFileSync, statSync } from 'node:fs';
import { PassThrough } from 'node:stream';
import { Constants } from '@cognite/sdk-core';
import {
  mockBaseUrl,
  project,
} from '@cognite/sdk-core/src/__tests__/testUtils';
import CogniteClient from '../cogniteClient';
import { login } from './login';

export function setupClient(baseUrl: string = Constants.BASE_URL) {
  return new CogniteClient({
    appId: 'JS SDK integration tests (beta)',
    baseUrl: process.env.COGNITE_BASE_URL || baseUrl,
    project: process.env.COGNITE_PROJECT || (project as string),
    getToken: () =>
      login().then((account) => {
        return account.access_token;
      }),
    // Promise.resolve(
    //   '' // This is a dummy token, for intergration tests you should use login() to get a real token
    // ),
  });
}

export function setupLoggedInClient() {
  return new CogniteClient({
    appId: 'JS SDK integration tests (beta)',
    baseUrl: process.env.COGNITE_BASE_URL,
    project: process.env.COGNITE_PROJECT as string,
    getToken: () =>
      login().then((account) => {
        return account.access_token;
      }),
  });
}

export function setupMockableClient() {
  const client = setupClient(mockBaseUrl);
  return client;
}
export function setupMockableClientForIntegrationTests() {
  const client = setupClient(process.env.COGNITE_BASE_URL);
  return client;
}
export function setupLoggedInClientForUnitTest(
  baseUrl: string = Constants.BASE_URL
) {
  return new CogniteClient({
    appId: 'JS SDK integration tests (beta)',
    baseUrl: baseUrl || process.env.COGNITE_BASE_URL,
    project: process.env.COGNITE_PROJECT as string,
    getToken: () =>
      login().then((account) => {
        return account.access_token;
      }),
  });
}

export function setupMockableClientForUnitTest() {
  const client = setupLoggedInClientForUnitTest(mockBaseUrl);
  return client;
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
export {
  divideFileIntoChunks,
  getFileStats,
  divideFileIntoStreams,
  toArrayBuffer,
};

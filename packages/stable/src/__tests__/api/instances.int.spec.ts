// Copyright 2022 Cognite AS

import { ViewReference } from 'stable/src/api/instances/types.gen';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

// const getFileId = async (
//   client: CogniteClient,
//   deadline: number = 15000
// ): Promise<number> => {
//   // Use a previous uploaded file/document if available,
//   // otherwise ingest a new file.

//   async function lookup() {
//     const resp = await client.documents.list({
//       limit: 1,
//     });
//     return resp.items.length > 0 ? resp.items[0].id : undefined;
//   }

//   const found = await lookup();
//   if (found) {
//     return found;
//   }

//   const fileContent = new TextEncoder().encode('test data');
//   await client.files.upload(
//     {
//       name: 'test.txt',
//       mimeType: 'text/plain',
//     },
//     fileContent,
//     false,
//     true
//   );

//   // It takes some time for a uploaded file to become available
//   // in the documents API.

//   let timeLeft = deadline;
//   while (timeLeft > 0) {
//     const timeout = Math.min(timeLeft, 3000);
//     await new Promise((resolve) => setTimeout(resolve, timeout));
//     timeLeft -= timeout;

//     const foundOnRetry = await lookup();
//     if (foundOnRetry) {
//       return foundOnRetry;
//     }
//   }

//   throw new Error(
//     'unable to ingest a file into the documents service within time'
//   );
// };

describe('Instances integration test', () => {
  let client: CogniteClient;
  const describable: ViewReference = {
    externalId: 'Describable',
    space: 'cdf_core',
    type: 'view',
    version: 'v1',
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('search nodes with limit 2', async () => {
    const response = await client.instances.search({
      view: describable,
      instanceType: 'node',
      limit: 2,
    });
    expect(response.items).toHaveLength(2);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[1].externalId).toBeDefined();
  });

  test('search with query', async () => {
    const response = await client.instances.search({
      view: describable,
      query: 'a',
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBeDefined();
  });

  test('search with filter', async () => {
    const response = await client.instances.search({
      view: describable,
      filter: {
        prefix: {
          property: ['title'],
          value: 'a',
        },
      },
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].properties);
    const title =
      response.items[0].properties![describable.space][
        `${describable.externalId}/${describable.version}`
      ]['title'].toString();
    expect(title.includes('a'));
  });
});

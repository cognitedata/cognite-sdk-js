import CogniteClientPlayground from '../../cogniteClientPlayground';
import { setupLoggedInClient } from '../testUtils';
import { setupLoggedInClient as setupLoggedInCdfClient } from '@cognite/sdk/src/__tests__/testUtils';
import { CogniteClient } from '@cognite/sdk';
import { Function } from '../../types';
import { matchers } from '../customMatchers';

import fs from 'fs';
import util from 'util';

const readFile = util.promisify(fs.readFile);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: Fix the test
describe.skip('functions api', () => {
  let client: CogniteClientPlayground;
  let cdfClient: CogniteClient;
  const functionName = 'test_function';
  const testFunctionName = 'integration_test_function';
  let testFunction: Function;

  beforeAll(async () => {
    expect.extend(matchers);
    client = setupLoggedInClient();
    cdfClient = setupLoggedInCdfClient();

    testFunction = await client.functions
      .list({ name: testFunctionName })
      .then((res) => res.items[0]);
  });

  test.skip('upload file', async () => {
    await uploadFile(cdfClient, 'testFunction');
  });

  test('create -> list -> delete functions', async () => {
    const fileId = await cdfClient.files
      .list({
        filter: { name: 'testFunction.zip' },
      })
      .then((res) => res.items[0].id);
    const createResponse = await client.functions.create([
      {
        name: functionName,
        fileId,
      },
    ]);
    const listResponse = await client.functions.list(
      { name: functionName },
      10
    );
    await client.functions.delete([{ id: listResponse.items[0].id }]);

    expect(createResponse.length).toEqual(1);
    expect(listResponse.items).toContainObject({
      name: functionName,
      fileId: createResponse[0].fileId,
    });
  });

  test('retrieve functions', async () => {
    const response = await client.functions.retrieve([{ id: testFunction.id }]);

    expect(response.length).toEqual(1);
    expect(response[0]).toStrictEqual(testFunction);
  });

  jest.retryTimes(5);
  test.skip('call function', async () => {
    // skipped due to functionListCall id frequently being incorrect:
    //
    //    Expected: 3031689607676760
    //    Received: 1974265185902188
    //
    const callResponse = await client.functions.calls.callFunction(
      testFunction.id,
      { data: 'test data' }
    );
    let functionCall = await client.functions.calls
      .retrieve(testFunction.id, [callResponse.id])
      .then((calls) => calls[0]);
    const functionListCall = await client.functions.calls
      .list(testFunction.id)
      .then((res) => res.items[0]);

    while (functionCall.status !== 'Completed') {
      await sleep(500);
      functionCall = await client.functions.calls
        .retrieve(testFunction.id, [callResponse.id])
        .then((calls) => calls[0]);
    }

    const logs = await client.functions.calls.retrieveLogs(
      testFunction.id,
      functionCall.id
    );

    const functionCallResponse = await client.functions.calls.retrieveResponse(
      testFunction.id,
      functionCall.id
    );
    expect(logs.items).toContainObject({ message: 'Hello World!' });
    expect(functionCallResponse.functionId).toEqual(testFunction.id);
    expect(functionCall.functionId).toEqual(testFunction.id);
    expect(functionListCall.id).toEqual(functionCall.id);
  });

  test('function schedules create, list, delete', async () => {
    const schedule = await client.functions.schedules
      .create([
        {
          name: 'testSchedule',
          cronExpression: '*/5 * * * *',
          functionId: testFunction.id,
        },
      ])
      .then((res) => res[0]);
    const schedules = await client.functions.schedules.list({
      name: schedule.name,
    });
    await client.functions.schedules.delete([schedule.id]);

    expect(schedules.items).toContainObject(schedule);
  });
});

const uploadFile = async (client: CogniteClient, name: string) => {
  const data = await readFile(
    `packages/playground/src/__tests__/${name}/${name}.zip`
  );
  const file = await client.files.upload(
    {
      name: 'test_function.zip',
    },
    data.buffer
  );
  return file.id;
};

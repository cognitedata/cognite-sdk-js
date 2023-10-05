// Copyright 2022 Cognite AS

import {
  Channel,
  MonitoringTaskModelExternalId,
  MonitoringTaskDoubleThresholdModelCreate,
  MonitoringTask,
} from '../../types';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

type SessionsResponse = {
  items: [{ nonce: string; status: string }];
};

describe('monitoring tasks api', () => {
  const client: CogniteClient = setupLoggedInClient();
  const ts = Date.now();
  const monitoringTaskExternalId = `test_mt_${ts}`;
  const monitoringTaskName = `test_mt_${ts}`;
  const channelExternalId = `test_channel_mt_${ts}`;
  const sessionsApi = `/api/v1/projects/${process.env.COGNITE_PROJECT}/sessions`;
  const testMtModel: MonitoringTaskDoubleThresholdModelCreate = {
    externalId: MonitoringTaskModelExternalId.DOUBLE_THRESHOLD,
    lowerThreshold: -100,
    timeseriesExternalId: 'test_external_id_beta_sdk',
    upperThreshold: 100,
    granularity: '1m',
  };
  const testMtOverlap = 1000 * 60;
  const testMtInterval = 5 * 60 * 1000;
  const expectedResponseModel = {
    externalId: MonitoringTaskModelExternalId.DOUBLE_THRESHOLD,
    timeseriesExternalId: 'test_external_id_beta_sdk',
    granularity: testMtModel.granularity,
    lowerThreshold: testMtModel.lowerThreshold,
    upperThreshold: testMtModel.upperThreshold,
  };

  let channel: Channel;

  test('create monitoring task', async (done) => {
    const timeseries = {
      name: 'test ts for beta sdk',
      externalId: 'test_external_id_beta_sdk',
      metadata: {
        createdTime: 'now',
      },
    };

    const tsResponse = await client.timeseries.retrieve(
      [{ externalId: 'test_external_id_beta_sdk' }],
      { ignoreUnknownIds: true }
    );
    if (tsResponse.length == 0) {
      await client.timeseries.create([timeseries]);
    }

    const sessionsRes = await client.post<SessionsResponse>(sessionsApi, {
      data: {
        items: [
          {
            clientId: process.env.COGNITE_CLIENT_ID,
            clientSecret: process.env.COGNITE_CLIENT_SECRET,
          },
        ],
      },
    });

    const res = await client.alerts.createChannels([
      {
        externalId: channelExternalId,
        name: channelExternalId,
        description: 'test',
      },
    ]);
    
    channel = res[0];
    expect(channel).toBeTruthy();
    // const response = await client.monitoringTasks.create([
    //   {
    //     externalId: monitoringTaskExternalId,
    //     name: monitoringTaskName,
    //     channelId: channel.id,
    //     interval: testMtInterval,
    //     nonce: sessionsRes?.data?.items[0]?.nonce,
    //     overlap: testMtOverlap,
    //     model: testMtModel,
    //   },
    // ]);
    console.log(sessionsRes?.data?.items[0]?.nonce);
    const response = await client.post<MonitoringTask>(`/api/v1/projects/${process.env.COGNITE_PROJECT}/monitoringtasks`, {
      data: {
        items: [
          {
            externalId: monitoringTaskExternalId,
            name: monitoringTaskName,
            channelId: channel.id,
            interval: testMtInterval,
            nonce: sessionsRes?.data?.items[0]?.nonce,
            overlap: testMtOverlap,
            model: testMtModel,
          }
        ]
      },
      headers: {
        'cdf-version': 'beta',
      },
    });
    console.log(response);
    // expect(response.length).toBe(1);
    // expect(response[0].externalId).toBe(monitoringTaskExternalId);
    done();
  }, 180000);

  // test('list all monitoring tasks', async () => {
  //   const response = await client.monitoringTasks.list({
  //     filter: {},
  //   });
  //   expect(response.items.length).toBeGreaterThan(0);
  // });

  // test('list created monitoring task', async () => {
  //   const response = await client.monitoringTasks.list({
  //     filter: { externalIds: [monitoringTaskExternalId] },
  //   });
  //   expect(response.items.length).toBe(1);
  //   expect(response.items[0].externalId).toEqual(monitoringTaskExternalId);
  //   expect(response.items[0].name).toEqual(monitoringTaskName);
  //   expect(response.items[0].model).toEqual(
  //     expect.objectContaining(expectedResponseModel)
  //   );
  //   expect(response.items[0].interval).toEqual(testMtInterval);
  //   expect(response.items[0].overlap).toEqual(testMtOverlap);
  // });

  // test('list created monitoring task by channel', async () => {
  //   const response = await client.monitoringTasks.list({
  //     filter: { channelIds: [channel.id] },
  //   });
  //   expect(response.items.length).toBe(1);
  //   expect(response.items[0].externalId).toEqual(monitoringTaskExternalId);
  //   expect(response.items[0].channelId).toEqual(channel.id);
  // });

  // test('delete monitoring task', async () => {
  //   const response = await client.monitoringTasks.delete([
  //     {
  //       externalId: monitoringTaskExternalId,
  //     },
  //   ]);
  //   expect(response).toEqual({});
  // });

  // test('delete channel', async () => {
  //   const response = await client.alerts.deleteChannels([
  //     {
  //       externalId: channelExternalId,
  //     },
  //   ]);
  //   expect(response).toEqual({});
  // });
});

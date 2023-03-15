// Copyright 2022 Cognite AS

import {
  Channel,
  MonitoringTaskModelExternalId,
  MonitoringTaskDoubleThresholdModelCreate,
} from '../../types';
import CogniteClientAlpha from '../../cogniteClient';
import {
  CLIENT_ID,
  CLIENT_SECRET,
  setupLoggedInClient,
  TEST_PROJECT,
} from '../testUtils';

type SessionsResponse = {
  items: [{ nonce: string; status: string }];
};

const itif = (condition: any) => (condition ? it : it.skip);

describe('monitoring tasks api', () => {
  const client: CogniteClientAlpha | null = setupLoggedInClient();
  const ts = Date.now();
  const monitoringTaskExternalId = `test_mt_${ts}`;
  const monitoringTaskName = `test_mt_${ts}`;
  const channelExternalId = `test_channel_mt_${ts}`;
  const sessionsApi = `/api/v1/projects/${TEST_PROJECT}/sessions`;
  const testMtModel: MonitoringTaskDoubleThresholdModelCreate = {
    externalId: MonitoringTaskModelExternalId.DOUBLE_THRESHOLD,
    lowerThreshold: -100,
    timeseriesExternalId: 'test_functions',
    upperThreshold: 100,
    granularity: '1m',
  };
  const testMtOverlap = 1000 * 60;
  const testMtInterval = 5 * 60 * 1000;
  const expectedResponseModel = {
    externalId: MonitoringTaskModelExternalId.DOUBLE_THRESHOLD,
    timeseriesId: 4944699311094690,
    granularity: testMtModel.granularity,
    lowerThreshold: testMtModel.lowerThreshold,
    upperThreshold: testMtModel.upperThreshold,
  };

  let channel: Channel;

  itif(client)('create monitoring task', async () => {
    const sessionsRes = await client!.post<SessionsResponse>(sessionsApi, {
      data: {
        items: [
          {
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
          },
        ],
      },
    });
    const res = await client!.alerts.createChannels([
      {
        externalId: channelExternalId,
        name: channelExternalId,
        description: 'test',
      },
    ]);
    channel = res[0];
    expect(channel).toBeTruthy();
    const response = await client!.monitoringTasks.create([
      {
        externalId: monitoringTaskExternalId,
        name: monitoringTaskName,
        channelId: channel.id,
        interval: testMtInterval,
        nonce: sessionsRes?.data?.items[0]?.nonce,
        overlap: testMtOverlap,
        model: testMtModel,
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(monitoringTaskExternalId);
  });

  itif(client)('list all monitoring tasks', async () => {
    const response = await client!.monitoringTasks.list({
      filter: {},
    });
    expect(response.items.length).toBeGreaterThan(0);
  });

  itif(client)('list created monitoring task', async () => {
    const response = await client!.monitoringTasks.list({
      filter: { externalIds: [monitoringTaskExternalId] },
    });
    expect(response.items.length).toBe(1);
    expect(response.items[0].externalId).toEqual(monitoringTaskExternalId);
    expect(response.items[0].name).toEqual(monitoringTaskName);
    expect(response.items[0].model).toEqual(expectedResponseModel);
    expect(response.items[0].interval).toEqual(testMtInterval);
    expect(response.items[0].overlap).toEqual(testMtOverlap);
  });

  itif(client)('list created monitoring task by channel', async () => {
    const response = await client!.monitoringTasks.list({
      filter: { channelIds: [channel.id] },
    });
    expect(response.items.length).toBe(1);
    expect(response.items[0].externalId).toEqual(monitoringTaskExternalId);
    expect(response.items[0].channelId).toEqual(channel.id);
  });

  itif(client)('delete monitoring task', async () => {
    const response = await client!.monitoringTasks.delete([
      {
        externalId: monitoringTaskExternalId,
      },
    ]);
    expect(response).toEqual({});
  });

  itif(client)('delete channel', async () => {
    const response = await client!.alerts.deleteChannels([
      {
        externalId: channelExternalId,
      },
    ]);
    expect(response).toEqual({});
  });
});

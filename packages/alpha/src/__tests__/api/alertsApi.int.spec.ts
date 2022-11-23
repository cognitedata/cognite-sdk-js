// Copyright 2020 Cognite AS

import CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

const itif = (condition: any) => (condition ? it : it.skip);

describe('alerts api', () => {
  const client: CogniteClientAlpha | null = setupLoggedInClient();
  const ts = Date.now();
  const channelExternalId = `test_channel_${ts}`;
  const alertExternalId = `test_alert_${ts}`;
  const email = `ivan.polomanyi+${ts}@cognite.com`;

  itif(client)('create channels', async () => {
    const response = await client!.alerts.createChannels([
      {
        externalId: channelExternalId,
        name: channelExternalId,
        description: 'test',
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(channelExternalId);
  });

  itif(client)('create channels with deduplication params', async () => {
    const channelExternalIdWithDeduplication = channelExternalId + '_dedup';
    const response = await client!.alerts.createChannels([
      {
        externalId: channelExternalIdWithDeduplication,
        name: channelExternalIdWithDeduplication,
        description: 'test with deduplication params',
        alertRules: {
          deduplication: {
            activationInterval: '10m',
            mergeInterval: '1m',
          },
        },
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(channelExternalIdWithDeduplication);
    expect(response[0].alertRules?.deduplication).toEqual({
      activationInterval: '10m',
      mergeInterval: '1m',
    });
  });

  itif(client)('list channels', async () => {
    const response = await client!.alerts.listChannels({
      filter: { externalIds: [channelExternalId] },
    });
    expect(response.items.length).toEqual(1);
    expect(response.items[0].externalId).toBe(channelExternalId);
  });

  itif(client)('create alerts', async () => {
    const response = await client!.alerts.create([
      {
        source: 'smth',
        channelExternalId,
        externalId: alertExternalId,
        level: 'DEBUG',
      },
    ]);
    expect(response.length).toBe(1);
  });

  itif(client)('close alerts', async () => {
    const response = await client!.alerts.close([
      {
        externalId: alertExternalId,
      },
    ]);
    expect(response).toEqual({});
  });

  itif(client)('list alerts', async () => {
    const response = await client!.alerts.list({
      filter: {
        channelExternalIds: [channelExternalId],
      },
    });
    expect(response.items.length).toEqual(1);
  });

  itif(client)('create subscribers', async () => {
    const response = await client!.alerts.createSubscribers([
      {
        email,
        externalId: email,
      },
    ]);
    expect(response.length).toBe(1);
  });

  itif(client)('list subscribers', async () => {
    const response = await client!.alerts.listSubscribers({
      filter: {
        email,
        externalIds: [email],
      },
    });
    expect(response.items.length).toBe(1);
    expect(response.items[0].externalId).toBe(email);
  });

  itif(client)('create subscriptions', async () => {
    const response = await client!.alerts.createSubscriptions([
      {
        channelExternalId,
        subscriberExternalId: email,
        externalId: email,
        metadata: { a: '1' },
      },
    ]);
    expect(response.length).toBe(1);
  });

  itif(client)('list subscriptions', async () => {
    const response = await client!.alerts.listSubscriptions({
      filter: {
        channelExternalIds: [channelExternalId],
        subscriberExternalIds: [email],
        externalIds: [email],
        metadata: { a: '1' },
      },
    });
    expect(response.items.length).toBe(1);
    expect(response.items[0].channelExternalId).toBe(channelExternalId);
  });

  itif(client)('delete subscriptions', async () => {
    const response = await client!.alerts.deleteSubscription([
      {
        externalId: email,
      },
    ]);
    expect(response).toEqual({});
  });
});

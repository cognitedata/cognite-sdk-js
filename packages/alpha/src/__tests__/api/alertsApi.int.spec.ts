// Copyright 2020 Cognite AS

import CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

const itif = (condition: any) => condition ? it : it.skip;

describe('alerts api', () => {
  const client: CogniteClientAlpha | null = setupLoggedInClient();
  const ts = Date.now()
  const channelExternalId = `test_channel_${ts}`
  const alertExternalId = `test_alert_${ts}`
  const email = `ivan.polomanyi+${ts}@cognite.com`

  itif(client)('create channels', async () => {
    const response = await client!.alerts.createChannels([{
      externalId: channelExternalId,
      name: channelExternalId,
      description: "test",
    }]);
    expect(response.length).toBe(1);
  });

  itif(client)('list channels', async () => {
    const response = await client!.alerts.listChannels();
    expect(response.items.length).toBeGreaterThan(0);
  });

  itif(client)('create alerts', async () => {
    const response = await client!.alerts.create([{
      source: "smth",
      channelExternalId,
      externalId: alertExternalId,
      level: "DEBUG"
    }]);
    expect(response.length).toBe(1);
  });
  
  itif(client)('close alerts', async () => {
    const response = await client!.alerts.close([{
      externalId: alertExternalId
    }]);
    expect(response).toEqual({});
  });
  
  
  itif(client)('list alerts', async () => {
    const response = await client!.alerts.list();
    expect(response.items.length).toBeGreaterThan(0);
  });

  itif(client)('create subscribers', async () => {
    const response = await client!.alerts.createSubscribers([{
      email,
      externalId: email 
    }]);
    expect(response.length).toBe(1);
  });

  itif(client)('create subscriptions', async () => {
    const response = await client!.alerts.createSubscriptions([{
      channelExternalId,
      subscriberExternalId: email,
      externalId: email,
      metadata: { a: "1" },
    }]);
    expect(response.length).toBe(1);
  });

  itif(client)('delete subscriptions', async () => {
    const response = await client!.alerts.deleteSubscription([{
      externalId: email
    }]);
    expect(response).toEqual({});
  });
  
});

import CogniteClientBeta from '../cogniteClient';
import { setupLoggedInClient, itif } from './testUtils';

describe('units api', () => {
  const client: CogniteClientBeta | null = setupLoggedInClient();

  itif(client)('list unit systems', async () => {
    const response = await client!.units.listUnitSystems();
    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items[0].name).toBeDefined();
  });

  itif(client)('list units', async () => {
    const response = await client!.units.list();
    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items[0].externalId).toBeDefined();
  });

  itif(client)('retrieve units', async () => {
    const response = await client!.units.retrieve([
      { externalId: 'temperature:deg_c' },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe('temperature:deg_c');
  });
});

// Copyright 2023 Cognite AS

import { SimulatorPatch } from '../../types';
import CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe.skip('simulator integrations api', () => {
  const client: CogniteClientAlpha = setupLoggedInClient();

  const ts = Date.now();
  const simulatorExternalId = `test_sim_${ts}`;
  const simulatorName = `TestSim - ${ts}`;
  let simulatorId: number;
  const unitsMap = {
    accel: {
      label: 'Acceleration',
      units: [
        {
          label: 'm/s2',
          value: 'm/s2',
        },
        {
          label: 'cm/s2',
          value: 'cm/s2',
        },
        {
          label: 'ft/s2',
          value: 'ft/s2',
        },
      ],
    },
    activity: {
      label: 'Activity',
      units: [
        {
          label: 'activity',
          value: 'activity',
        },
      ],
    },
  };
  const unitSystem = {
    default: {
      label: 'default',
      defaultUnits: {
        accel: 'm/s2',
      },
    },
  };
  const stepFields = [
    {
      stepType: 'get/set',
      fields: [
        {
          name: 'objectName',
          label: 'Simulation Object Name',
          info: 'Enter the name of the DWSIM object, i.e. Feed',
        },
        {
          name: 'objectProperty',
          label: 'Simulation Object Property',
          info: 'Enter the property of the DWSIM object, i.e. Temperature',
        },
      ],
    },
    {
      stepType: 'command',
      fields: [
        {
          name: 'type',
          label: 'Command',
          // options: [
          //   {
          //     label: 'Solve',
          //     value: 'Solve',
          //   },
          // ],
          info: 'Select a command',
        },
      ],
    },
  ];
  const modelTypes = [
    {
      key: 'test',
      name: 'test',
    },
  ];
  const boundaryConditions = [
    {
      name: 'test',
      address: 'x.y.z',
      key: 'test',
    },
  ];
  const fileExtensionTypes = ['csv', 'yaml'];

  test('create simulators', async () => {
    const response = await client.simulators.create([
      {
        externalId: simulatorExternalId,
        name: simulatorName,
        fileExtensionTypes,
        enabled: true,
        stepFields,
        units: {
          unitsMap,
          unitSystem,
        },
        modelTypes,
        boundaryConditions,
        isCalculationsEnabled: true,
      },
    ]);
    simulatorId = response[0].id;
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(simulatorExternalId);
    expect(response[0].fileExtensionTypes).toEqual(['csv', 'yaml']);
    expect(response[0].enabled).toBe(true);
    // expect(response[0].stepFields).toEqual(stepFields);
    // expect(response[0].units).toEqual({
    //   unitsMap,
    //   unitSystem
    // });
    expect(response[0].modelTypes).toEqual(modelTypes);
    expect(response[0].boundaryConditions).toEqual(boundaryConditions);
    expect(response[0].isCalculationsEnabled).toBe(true);
    expect(response[0].isBoundaryConditionsEnabled).toBe(false);
  });

  test('update simulators', async () => {
    const patch: SimulatorPatch['update'] = {
      isBoundaryConditionsEnabled: {
        set: true,
      },
      fileExtensionTypes: {
        set: ['py'],
      },
      boundaryConditions: {
        set: [
          {
            name: 'test_update',
            address: 'a.b.c',
            key: 'test_update',
          },
        ],
      },
      modelTypes: {
        set: [
          {
            key: 'test_update',
            name: 'test_update',
          },
        ],
      },
      units: {
        set: {
          unitsMap: {
            activityUpdated: {
              label: 'Activity',
              units: [
                {
                  label: 'activity',
                  value: 'activity',
                },
              ],
            },
          },
          unitSystem: {},
        },
      },
      stepFields: {
        set: [
          {
            fields: [
              {
                info: 'test_update',
                label: 'test_update',
                name: 'test_update',
              },
            ],
            stepType: 'get/set-updated',
          },
        ],
      },
    };
    const response = await client.simulators.update([
      {
        id: simulatorId,
        update: patch,
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].isBoundaryConditionsEnabled).toBe(true);
    expect(response[0].fileExtensionTypes).toEqual(
      (patch.fileExtensionTypes as any).set
    );
    expect(response[0].boundaryConditions).toEqual(
      (patch.boundaryConditions as any).set
    );
    expect(response[0].modelTypes).toEqual((patch.modelTypes as any).set);
    expect(response[0].units).toEqual((patch.units as any).set);
    expect(response[0].stepFields).toEqual((patch.stepFields as any).set);
  });

  test('list simulators', async () => {
    const response = await client.simulators.list({
      filter: { enabled: true },
    });
    expect(response.items.length).toBeGreaterThan(0);
    const simulatorFound = response.items.find(
      (item) => item.externalId === simulatorExternalId
    );
    expect(simulatorFound?.externalId).toBe(simulatorExternalId);
  });

  test('delete simulators', async () => {
    if (simulatorId) {
      const response = await client.simulators.delete([
        {
          id: simulatorId,
        },
      ]);
      expect(response).toEqual({});
      const responseAfterDelete = await client.simulators.list();
      expect(
        responseAfterDelete.items.filter(
          (res) => res.externalId == simulatorExternalId
        ).length
      ).toBe(0);
    }
  });
});

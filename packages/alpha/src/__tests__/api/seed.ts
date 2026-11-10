import type CogniteClientAlpha from '../../cogniteClient';
import type {
  SimulationRun,
  SimulatorRoutineRevisionConfiguration,
  SimulatorRoutineScript,
  SimulatorUnitQuantity,
} from '../../types';
import { getOrCreateDataSet, getOrCreateFile, randomInt } from '../testUtils';

export const unitQuantities: SimulatorUnitQuantity[] = [
  {
    name: 'volumetricFlow',
    label: 'Volumetric Flow',
    units: [
      { label: 'm3/s', name: 'm3/s' },
      { label: 'ft3/s', name: 'ft3/s' },
      { label: 'cm3/s', name: 'cm3/s' },
      { label: 'm3/h', name: 'm3/h' },
      { label: 'm3/d', name: 'm3/d' },
      { label: 'bbl/h', name: 'bbl/h' },
      { label: 'bbl/d', name: 'bbl/d' },
      { label: 'ft3/min', name: 'ft3/min' },
      { label: 'ft3/d', name: 'ft3/d' },
      { label: 'gal[UK]/h', name: 'gal[UK]/h' },
      { label: 'gal[UK]/min', name: 'gal[UK]/min' },
      { label: 'gal[UK]/s', name: 'gal[UK]/s' },
      { label: 'gal[US]/h', name: 'gal[US]/h' },
      { label: 'gal[US]/min', name: 'gal[US]/min' },
      { label: 'gal[US]/s', name: 'gal[US]/s' },
      { label: 'L/h', name: 'L/h' },
      { label: 'L/min', name: 'L/min' },
      { label: 'L/s', name: 'L/s' },
    ],
  },
  {
    name: 'pressure',
    label: 'Pressure',
    units: [
      { label: 'Pa', name: 'Pa' },
      { label: 'atm', name: 'atm' },
      { label: 'kgf/cm2', name: 'kgf/cm2' },
      { label: 'kgf/cm2g', name: 'kgf/cm2g' },
      { label: 'lbf/ft2', name: 'lbf/ft2' },
      { label: 'kPa', name: 'kPa' },
      { label: 'kPag', name: 'kPag' },
      { label: 'bar', name: 'bar' },
      { label: 'barg', name: 'barg' },
      { label: 'ftH2O', name: 'ftH2O' },
      { label: 'inH2O', name: 'inH2O' },
      { label: 'inHg', name: 'inHg' },
      { label: 'mbar', name: 'mbar' },
      { label: 'mH2O', name: 'mH2O' },
      { label: 'mmH2O', name: 'mmH2O' },
      { label: 'mmHg', name: 'mmHg' },
      { label: 'MPa', name: 'MPa' },
      { label: 'psi', name: 'psi' },
      { label: 'psig', name: 'psig' },
    ],
  },
  {
    name: 'temperature',
    label: 'Temperature',
    units: [
      { label: 'K', name: 'K' },
      { label: 'R', name: 'R' },
      { label: 'C', name: 'C' },
      { label: 'F', name: 'F' },
    ],
  },
];

export const stepFields = [
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
        name: 'command',
        label: 'Command',
        info: 'Select a command',
        options: [
          {
            label: 'Solve Flowsheet',
            value: 'Solve',
          },
        ],
      },
    ],
  },
];

export const modelTypes = [
  {
    key: 'WaterWell',
    name: 'Water Well',
  },
];

export const fileExtensionTypes = ['csv', 'yaml', 'dwxmz'];

export const routineRevisionConfiguration: SimulatorRoutineRevisionConfiguration =
  {
    schedule: { enabled: false },
    dataSampling: {
      enabled: true,
      samplingWindow: 0,
      granularity: 0,
    },
    logicalCheck: [],
    steadyStateDetection: [],
    inputs: [
      {
        name: 'Cold Water Temperature - Constant',
        referenceId: 'CWTC',
        value: 10,
        valueType: 'DOUBLE',
        unit: {
          name: 'C',
          quantity: 'temperature',
        },
        saveTimeseriesExternalId: 'DWSIM-INPUT-constinput-CWTC-ShowerMixer',
      },
      {
        name: 'Cold Water Pressure - Constant',
        referenceId: 'CWPC',
        value: 3.6,
        valueType: 'DOUBLE',
        unit: {
          name: 'bar',
          quantity: 'pressure',
        },
        saveTimeseriesExternalId: 'DWSIM-INPUT-constinput-CWPC-ShowerMixer',
      },
      {
        name: 'Cold Water Volumetric Flow - Constant',
        referenceId: 'CWVFC',
        value: 0.37,
        valueType: 'DOUBLE',
        unit: {
          name: 'm3/h',
          quantity: 'volumetricFlow',
        },
        saveTimeseriesExternalId: 'DWSIM-INPUT-constinput-CWVFC-ShowerMixer',
      },
      {
        name: 'Hot Water Temperature - Constant',
        referenceId: 'HWTC',
        value: 69,
        valueType: 'DOUBLE',
        unit: {
          name: 'C',
          quantity: 'temperature',
        },
        saveTimeseriesExternalId: 'DWSIM-INPUT-constinput-HWTC-ShowerMixer',
      },
      {
        name: 'Hot Water Pressure - Constant',
        referenceId: 'HWPC',
        value: 2.8,
        valueType: 'DOUBLE',
        unit: {
          name: 'bar',
          quantity: 'pressure',
        },
        saveTimeseriesExternalId: 'DWSIM-INPUT-constinput-HWPC-ShowerMixer',
      },
      {
        name: 'Hot Water Volumetric Flow - Constant',
        referenceId: 'HWVFC',
        value: 0.19,
        valueType: 'DOUBLE',
        unit: {
          name: 'm3/h',
          quantity: 'volumetricFlow',
        },
        saveTimeseriesExternalId: 'DWSIM-INPUT-constinput-HWVFC-ShowerMixer',
      },
    ],
    outputs: [
      {
        name: 'Shower Temperature',
        referenceId: 'ST',
        unit: {
          name: 'C',
          quantity: 'temperature',
        },
        valueType: 'DOUBLE',
        saveTimeseriesExternalId: 'DWSIM-OUTPUT-const_input-ST-ShowerMixer',
      },
      {
        name: 'Shower Pressure',
        referenceId: 'SP',
        unit: {
          name: 'bar',
          quantity: 'pressure',
        },
        valueType: 'DOUBLE',
        saveTimeseriesExternalId: 'DWSIM-OUTPUT-const_input-SP-ShowerMixer',
      },
      {
        name: 'Shower Volumetric Flow',
        referenceId: 'SVF',
        unit: {
          name: 'm3/h',
          quantity: 'volumetricFlow',
        },
        valueType: 'DOUBLE',
        saveTimeseriesExternalId: 'DWSIM-OUTPUT-const_input-SVF-ShowerMixer',
      },
    ],
  };

export const routineRevisionScript: SimulatorRoutineScript[] = [
  {
    order: 1,
    description: 'Set Inputs',
    steps: [
      {
        order: 1,
        stepType: 'Set',
        arguments: {
          referenceId: 'CWTC',
          objectName: 'Cold water',
          objectProperty: 'Temperature',
        },
      },
      {
        order: 2,
        stepType: 'Set',
        arguments: {
          referenceId: 'CWPC',
          objectName: 'Cold water',
          objectProperty: 'Pressure',
        },
      },
      {
        order: 3,
        stepType: 'Set',
        arguments: {
          referenceId: 'CWVFC',
          objectName: 'Cold water',
          objectProperty: 'Volumetric Flow',
        },
      },
      {
        order: 4,
        stepType: 'Set',
        arguments: {
          referenceId: 'HWTC',
          objectName: 'Hot water',
          objectProperty: 'Temperature',
        },
      },
      {
        order: 5,
        stepType: 'Set',
        arguments: {
          referenceId: 'HWPC',
          objectName: 'Hot water',
          objectProperty: 'Pressure',
        },
      },
      {
        order: 6,
        stepType: 'Set',
        arguments: {
          referenceId: 'HWVFC',
          objectName: 'Hot water',
          objectProperty: 'Volumetric Flow',
        },
      },
    ],
  },
  {
    order: 2,
    description: 'Solve the flowsheet',
    steps: [
      {
        order: 1,
        stepType: 'Command',
        arguments: {
          command: 'Solve',
        },
      },
    ],
  },
  {
    order: 3,
    description: 'Set simulation outputs',
    steps: [
      {
        order: 1,
        stepType: 'Get',
        arguments: {
          referenceId: 'ST',
          objectName: 'Shower',
          objectProperty: 'Temperature',
        },
      },
      {
        order: 2,
        stepType: 'Get',
        arguments: {
          referenceId: 'SP',
          objectName: 'Shower',
          objectProperty: 'Pressure',
        },
      },
      {
        order: 3,
        stepType: 'Get',
        arguments: {
          referenceId: 'SVF',
          objectName: 'Shower',
          objectProperty: 'Volumetric Flow',
        },
      },
    ],
  },
];

export interface TestIdentifiers {
  uniqueSuffix: number;
  simulatorExternalId: string;
  modelExternalId: string;
  modelRevisionExternalId: string;
  routineExternalId: string;
  routineRevisionExternalId: string;
  simulatorIntegrationExternalId: string;
  simulatorName: string;
}

export function createTestIdentifiers(): TestIdentifiers {
  const uniqueSuffix = randomInt();
  return {
    uniqueSuffix,
    simulatorExternalId: `test_sim_${uniqueSuffix}`,
    modelExternalId: `test_sim_model_${uniqueSuffix}`,
    modelRevisionExternalId: `test_sim_model_revision_${uniqueSuffix}`,
    routineExternalId: `test_sim_routine_${uniqueSuffix}`,
    routineRevisionExternalId: `test_sim_routine_revision_${uniqueSuffix}`,
    simulatorIntegrationExternalId: `test_sim_integration_${uniqueSuffix}`,
    simulatorName: `TestSim - ${uniqueSuffix}`,
  };
}

// `test_routine_sim_` and `test_runs_sim_` are prefixes older versions of
// these tests used. Nothing creates them anymore, but some are left in CDF.
const TEST_SIMULATOR_PREFIXES = [
  'test_sim_',
  'test_routine_sim_',
  'test_runs_sim_',
];
// Long enough that a concurrent CI job never loses a simulator it is using.
const STALE_TEST_SIMULATOR_AGE_MS = 60 * 60 * 1000;

/**
 * Deletes test simulators left behind by runs that crashed or timed out
 * before their cleanup ran. Deleting a simulator also deletes its
 * integrations, models, routines and runs.
 */
export async function deleteStaleTestSimulators(client: CogniteClientAlpha) {
  const cutoff = Date.now() - STALE_TEST_SIMULATOR_AGE_MS;
  try {
    const simulators = await client.simulators
      .list({ limit: 1000 })
      .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });
    const stale = simulators.filter(
      (simulator) =>
        TEST_SIMULATOR_PREFIXES.some((prefix) =>
          simulator.externalId.startsWith(prefix)
        ) && simulator.createdTime.valueOf() < cutoff
    );
    // The delete endpoint accepts exactly one item per request.
    const results = await Promise.allSettled(
      stale.map(({ id }) => client.simulators.delete([{ id }]))
    );
    const failed = results.filter((result) => result.status === 'rejected');
    if (failed.length) {
      console.error(
        `Failed to delete ${failed.length} of ${stale.length} stale simulators`,
        failed[0].reason
      );
    }
  } catch (e) {
    console.error('An error occured when trying to delete stale simulators', e);
  }
}

/**
 * Creates a simulator with its own integration, model and routine, and starts
 * a simulation run on it. Every resource uses the given identifiers, so tests
 * can filter on them instead of picking up runs created by concurrent jobs.
 * Deleting the returned simulator deletes everything else, and if any step
 * fails, the simulator is deleted before the error is rethrown.
 */
export async function createSimulationRun(
  client: CogniteClientAlpha,
  ids: TestIdentifiers
): Promise<{ simulatorId: number; run: SimulationRun }> {
  const dataSetId = await getOrCreateDataSet(client);
  const fileId = await getOrCreateFile(client, dataSetId);

  const [simulator] = await client.simulators.create([
    {
      externalId: ids.simulatorExternalId,
      name: ids.simulatorName,
      fileExtensionTypes,
      stepFields,
      unitQuantities,
      modelTypes,
    },
  ]);
  try {
    const run = await startRunOnSimulator(client, ids, dataSetId, fileId);
    return { simulatorId: simulator.id, run };
  } catch (error) {
    await client.simulators.delete([{ id: simulator.id }]);
    throw error;
  }
}

async function startRunOnSimulator(
  client: CogniteClientAlpha,
  ids: TestIdentifiers,
  dataSetId: number,
  fileId: number
): Promise<SimulationRun> {
  await client.simulators.createIntegrations([
    {
      externalId: ids.simulatorIntegrationExternalId,
      simulatorExternalId: ids.simulatorExternalId,
      heartbeat: new Date(),
      dataSetId,
      connectorVersion: '1.0.0',
      simulatorVersion: '1.0.0',
      licenseStatus: 'UNKNOWN',
      connectorStatus: 'IDLE',
    },
  ]);
  await client.simulators.createModels([
    {
      externalId: ids.modelExternalId,
      simulatorExternalId: ids.simulatorExternalId,
      name: 'Test Simulator Model',
      dataSetId,
      type: 'WaterWell',
    },
  ]);
  await client.simulators.createModelRevisions([
    {
      externalId: ids.modelRevisionExternalId,
      modelExternalId: ids.modelExternalId,
      fileId,
    },
  ]);
  await client.simulators.createRoutines([
    {
      externalId: ids.routineExternalId,
      modelExternalId: ids.modelExternalId,
      simulatorIntegrationExternalId: ids.simulatorIntegrationExternalId,
      name: 'Test Routine',
    },
  ]);
  await client.simulators.createRoutineRevisions([
    {
      externalId: ids.routineRevisionExternalId,
      routineExternalId: ids.routineExternalId,
      configuration: routineRevisionConfiguration,
      script: [],
    },
  ]);
  const [run] = await client.simulators.runSimulation([
    {
      routineExternalId: ids.routineExternalId,
      runType: 'external',
      queue: true,
    },
  ]);
  return run;
}

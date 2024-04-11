import {
  SimulatorRoutineRevisionConfiguration,
  SimulatorRoutineScript,
} from 'alpha/src/types';

export const unitsMap = {
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
export const unitSystem = {
  default: {
    label: 'default',
    defaultUnits: {
      accel: 'm/s2',
    },
  },
};
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
        name: 'type',
        label: 'Command',
        options: [
          {
            label: 'Solve',
            value: 'Solve',
          },
        ],
        info: 'Select a command',
      },
    ],
  },
];
export const modelTypes = [
  {
    key: 'test',
    name: 'test',
  },
];
export const boundaryConditions = [
  {
    name: 'test',
    address: 'x.y.z',
    key: 'test',
  },
];
export const fileExtensionTypes = ['csv', 'yaml'];

export const routineRevisionConfiguration: SimulatorRoutineRevisionConfiguration =
  {
    schedule: { enabled: false },
    dataSampling: {
      enabled: true,
      validationWindow: 0,
      samplingWindow: 0,
      granularity: 0,
    },
    logicalCheck: [],
    steadyStateDetection: [],
    inputTimeseries: [
      {
        name: 'string',
        referenceId: 'string',
        unit: 'string',
        unitType: 'string',
        sourceExternalId: 'string',
        aggregate: 'average',
        saveTimeseriesExternalId: 'PROSPER-INPUT-ChokeDp-THP-Well_A2',
      },
    ],
    outputTimeseries: [
      {
        name: 'string',
        referenceId: 'string',
        unit: 'string',
        unitType: 'string',
        saveTimeseriesExternalId: 'string',
      },
    ],
    inputConstants: [
      {
        name: 'string',
        saveTimeseriesExternalId: 'string',
        value: 'string',
        unit: 'string',
        unitType: 'string',
        referenceId: 'string',
      },
    ],
  };

export const routineRevisionScript: SimulatorRoutineScript[] = [
  {
    order: 1,
    description: 'string',
    steps: [
      {
        order: 1,
        stepType: 'Get',
        description: 'string',
        arguments: {
          argumentType: 'outputTimeSeries',
          objectName: 'WELL.A2',
          objectProperty: 'Tempretature',
          referenceId: 'CWTC',
        },
      },
      {
        order: 2,
        stepType: 'Set',
        description: 'string',
        arguments: {
          argumentType: 'inputConstant',
          objectName: 'WELL.A2',
          objectProperty: 'Tempretature',
          referenceId: 'CWTC',
        },
      },
      {
        order: 3,
        stepType: 'Command',
        description: 'string',
        arguments: {
          argumentType: 'outputTimeSeries',
          objectName: 'WELL.A2',
          objectProperty: 'Tempretature',
          referenceId: 'CWTC',
        },
      },
    ],
  },
];

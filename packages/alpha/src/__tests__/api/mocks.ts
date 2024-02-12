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
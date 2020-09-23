export const mockedWellResultFixture = [
  {
    name: '16/1',
    description: 'GC16',
    metadata: {
      ACTIVE_UI_UNITSYS_ID: '11.0',
      COMPLETION_WELL_ID: '2003-P',
      WRP_TVD: '67.4',
      WRP_TVD_DSDSUNIT: 'm',
      source: 'EDM',
      type: 'Well',
      crs: 'EPSG:23031',
      x: '1012867.51',
      y: '6116835.33',
    },
    id: 7591554097499339,
    createdTime: new Date(1574266721666),
    lastUpdatedTime: new Date(1574266721666),
    rootId: 7591554097499339,
  },
];

export const getDefaultWell = (includeWellBore = false) => ({
  ...mockedWellResultFixture[0],
  wellbores: includeWellBore ? [getDefaultWellbore()] : undefined,
});

export const getDefaultWellbore = () => ({
  ...mockedWellboreResultFixture[0],
  wellId: mockedWellResultFixture[0].id,
});

export const mockedWellboreResultFixture = [
  { parentId: 7591554097499339, id: 75915540932488339 },
  { parentId: 75915540932488339, id: 75915540932499340 },
];

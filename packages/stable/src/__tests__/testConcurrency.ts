// Copyright 2026 Cognite AS

// Twice the default limits, to keep integration suites reasonably fast.
export const testConcurrency = {
  dataModeling: {
    read: 2,
    search: 4,
    write: 2,
    delete: 2,
    readSchema: 4,
    writeSchema: 2,
  },
};

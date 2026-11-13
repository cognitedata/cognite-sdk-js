// Copyright 2026 Cognite AS

import type {
  DatapointsInsertByExternalId,
  DatapointsInsertById,
  DatapointsInsertByInstanceId,
} from '@cognite/sdk';
import type { CogniteExternalId } from '@cognite/sdk-core';

/**
 * Unit catalog reference for supplied datapoint values
 */
export interface WithInsertUnit {
  unit: {
    externalId: CogniteExternalId;
  };
}

/**
 * Insert payload for {@link BetaDataPointsAPI.insertWithUnitConversion}: same shape as
 * stable insert items, with a required `unit.externalId` for client-side conversion to the
 * time series' stored unit before posting.
 */
export type DatapointsInsertWithUnitItem =
  | (DatapointsInsertById & WithInsertUnit)
  | (DatapointsInsertByExternalId & WithInsertUnit)
  | (DatapointsInsertByInstanceId & WithInsertUnit);

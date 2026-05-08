// Copyright 2026 Cognite AS

import type {
  DatapointsInsertByExternalId,
  DatapointsInsertById,
  DatapointsInsertByInstanceId,
} from '@cognite/sdk';
import type { CogniteExternalId } from '@cognite/sdk-core';

/**
 * Unit catalog externalId of the supplied datapoint values (e.g. `"temperature:deg_f"`).
 * Must belong to the same quantity as the time series' stored `unitExternalId`.
 */
export interface WithSourceUnit {
  sourceUnit: CogniteExternalId;
}

/**
 * Insert payload for {@link BetaDataPointsAPI.insertWithUnitConversion}: same shape as
 * stable insert items, with a required `sourceUnit` for client-side conversion to the
 * time series' stored unit before posting.
 */
export type DatapointsInsertWithUnitItem =
  | (DatapointsInsertById & WithSourceUnit)
  | (DatapointsInsertByExternalId & WithSourceUnit)
  | (DatapointsInsertByInstanceId & WithSourceUnit);

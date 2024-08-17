// Copyright 2020 Cognite AS

import type { DateRange, SinglePatch, SortOrder } from '@cognite/sdk';
import type {
  CogniteExternalId,
  CogniteInternalId,
  ExternalId,
  FilterQuery,
  InternalId,
} from '@cognite/sdk-core';

export * from '@cognite/sdk';

// This file is here mostly to allow apis to import { ... } from '../../types';
// Overriding types should probably be done in their respective API endpoint files, where possible

export type ArrayPatchExternalIds =
  | { set: ExternalId[] }
  | { add?: ExternalId[]; remove?: ExternalId[] };

export interface SimulatorUnitRecord {
  label: string;
  value: string;
}
export interface SimulatorUnitsMap {
  label: string;
  units: SimulatorUnitRecord[];
}

export interface SimulatorUnitEntry {
  label: string;
  name: string;
}

export interface SimulatorUnitQuantity {
  name: string;
  label: string;
  units: SimulatorUnitEntry[];
}

export interface SimulatorModelType {
  name: string;
  key: string;
}

export interface SimulatorStepFieldOption {
  label: string;
  value: string;
}

export interface SimulatorStepField {
  name: string;
  label: string;
  info: string;
  options?: SimulatorStepFieldOption[];
}

export interface SimulatorStep {
  stepType: string;
  fields: SimulatorStepField[];
}
export interface Simulator {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  name: string;
  fileExtensionTypes: string[];
  modelTypes: SimulatorModelType[];
  stepFields?: SimulatorStep[];
  unitQuantities?: SimulatorUnitQuantity[];
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface SimulatorFilterQuery extends FilterQuery {
  filter?: object;
}

export interface SimulatorCreate {
  externalId: CogniteExternalId;
  fileExtensionTypes: string[];
  name: string;
  modelTypes?: SimulatorModelType[];
  stepFields?: SimulatorStep[];
  unitQuantities?: SimulatorUnitQuantity[];
}

export interface SimulatorIntegration {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  simulatorExternalId: CogniteExternalId;
  heartbeat: Date;
  dataSetId: CogniteInternalId;
  connectorVersion: string;
  simulatorVersion: string;
  licenseStatus?: string;
  licenseLastCheckedTime?: Date;
  connectorStatus?: string;
  connectorStatusUpdatedTime?: Date;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface SimulatorIntegrationCreate {
  externalId: CogniteExternalId;
  simulatorExternalId: CogniteExternalId;
  dataSetId?: CogniteInternalId;
  heartbeat?: Date;
  connectorVersion?: string;
  simulatorVersion?: string;
  licenseStatus?: string;
  licenseLastCheckedTime?: Date;
  connectorStatus?: string;
  connectorStatusUpdatedTime?: Date;
}

export interface SimulatorIntegrationFilter {
  simulatorExternalIds?: CogniteExternalId[];
}

export interface SimulatorIntegrationFilterQuery extends FilterQuery {
  filter?: SimulatorIntegrationFilter;
}

export interface SimulationRunFilter {
  status?: SimulationRunStatus;
  runType?: SimulationRunType;
  simulatorIntegrationExternalIds?: CogniteExternalId[];
  simulatorExternalIds?: CogniteExternalId[];
  modelExternalIds?: CogniteExternalId[];
  routineExternalIds?: CogniteExternalId[];
  routineRevisionExternalIds?: CogniteExternalId[];
  modelRevisionExternalIds?: CogniteExternalId[];
  createdTime?: DateRange;
  simulationTime?: DateRange;
}

export interface SortItem {
  property: string;
  order: SortOrder;
}

export interface SimulationRunFilterQuery extends FilterQuery {
  filter?: SimulationRunFilter;
  sort?: SortItem[];
}

export interface SimulatorPatch {
  update: {
    fileExtensionTypes?: SinglePatch<string[]>;
    name?: SinglePatch<string>;
    modelTypes?: SinglePatch<SimulatorModelType[]>;
    stepFields?: SinglePatch<SimulatorStep[]>;
    unitQuantities?: SinglePatch<SimulatorUnitQuantity[]>;
  };
}

export interface SimulatorChange extends SimulatorPatch, InternalId {}

export type SimulationRunType = 'external' | 'manual' | 'scheduled';

export const SimulationRunType = {
  external: 'external' as SimulationRunType,
  manual: 'manual' as SimulationRunType,
  scheduled: 'scheduled' as SimulationRunType,
};

export interface SimulationRunCreate {
  routineExternalId: CogniteExternalId;
  runType?: SimulationRunType;
  runTime?: Date;
  queue?: boolean;
}

export type SimulationRunStatus = 'ready' | 'running' | 'success' | 'failure';

export const SimulationRunStatus = {
  ready: 'ready' as SimulationRunStatus,
  running: 'running' as SimulationRunStatus,
  success: 'success' as SimulationRunStatus,
  failure: 'failure' as SimulationRunStatus,
};

export interface SimulationRun {
  id: CogniteInternalId;

  simulatorExternalId: CogniteExternalId;
  simulatorIntegrationExternalId: CogniteExternalId;
  modelExternalId: CogniteExternalId;
  modelRevisionExternalId: CogniteExternalId;
  routineExternalId: CogniteExternalId;
  routineRevisionExternalId: CogniteExternalId;
  status: SimulationRunStatus;
  runTime?: Date;
  simulationTime?: Date;
  statusMessage?: string;
  dataSetId: CogniteInternalId;
  eventId?: CogniteInternalId;
  runType: SimulationRunType;
  userId?: string;
  logId: CogniteInternalId;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export type SimulationRunDataValueType =
  | 'STRING'
  | 'DOUBLE'
  | 'STRING_ARRAY'
  | 'DOUBLE_ARRAY';

export const SimulationRunDataValueType = {
  STRING: 'STRING' as SimulationRunDataValueType,
  DOUBLE: 'DOUBLE' as SimulationRunDataValueType,
  STRING_ARRAY: 'STRING_ARRAY' as SimulationRunDataValueType,
  DOUBLE_ARRAY: 'DOUBLE_ARRAY' as SimulationRunDataValueType,
};

export interface SimulationRunDataOutput {
  referenceId: CogniteInternalId;
  value: string | number | string[] | number[];
  valueType: SimulationRunDataValueType;
  unit?: {
    name: string;
    externalId?: CogniteExternalId;
  };
  simulatorObjectReference?: Record<string, string>;
  timeseriesExternalId?: CogniteExternalId;
}

export interface SimulationRunDataInput extends SimulationRunDataOutput {
  overridden?: boolean;
}

export interface SimulationRunId {
  runId: CogniteInternalId;
}

interface SimulatorRoutineIO {
  referenceId: string;
  name: string;
  saveTimeseriesExternalId?: CogniteExternalId;
  unit?: {
    name: string;
    quantity?: string;
  };
}

export interface SimulatorRoutineInputConst extends SimulatorRoutineIO {
  value: string | number | string[] | number[];
  valueType: SimulationRunDataValueType;
}

export interface SimulatorRoutineInputTs extends SimulatorRoutineIO {
  sourceExternalId: string;
  aggregate: SimulatorDataPointsAggregate;
}

export type SimulatorRoutineInput =
  | SimulatorRoutineInputConst
  | SimulatorRoutineInputTs;

export interface SimulatorRoutineOutput extends SimulatorRoutineIO {
  valueType: SimulationRunDataValueType;
}

export interface SimulationRunData {
  runId: CogniteInternalId;
  inputs: SimulationRunDataInput[];
  outputs: SimulationRunDataOutput[];
}

export type SimulatorLogSeverityLevel =
  | 'Debug'
  | 'Information'
  | 'Warning'
  | 'Error';

export const SimulatorLogSeverityLevel = {
  Debug: 'Debug' as SimulatorLogSeverityLevel,
  Information: 'Information' as SimulatorLogSeverityLevel,
  Warning: 'Warning' as SimulatorLogSeverityLevel,
  Error: 'Error' as SimulatorLogSeverityLevel,
};

export interface SimulatorLogData {
  timestamp: Date;
  message: string;
  severity: SimulatorLogSeverityLevel;
}

export interface SimulatorLog {
  id: CogniteInternalId;
  data: SimulatorLogData[];
  dataSetId: CogniteInternalId;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface SimulatorModel {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  simulatorExternalId: CogniteExternalId;
  name: string;
  description?: string;
  dataSetId: CogniteInternalId;
  labels?: ExternalId[];
  type?: string;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface SimulatorModelCreate {
  externalId: CogniteExternalId;
  simulatorExternalId: CogniteExternalId;
  name: string;
  description?: string;
  dataSetId: CogniteInternalId;
  labels?: ExternalId[];
  type?: string;
}

export interface SimulatorModelFilter {
  simulatorExternalIds?: CogniteExternalId[];
}

export interface SimulatorModelFilterQuery extends FilterQuery {
  filter?: SimulatorModelFilter;
}

export interface SimulatorModelPatch {
  update: {
    name?: SinglePatch<string>;
    description?: SinglePatch<string>;
    labels?: ArrayPatchExternalIds;
  };
}

export interface SimulatorModelChange extends SimulatorModelPatch, InternalId {}

export type SimulatorModelRevisionStatus = 'unknown' | 'success' | 'failure';

export const SimulatorModelRevisionStatus = {
  unknown: 'unknown' as SimulatorModelRevisionStatus,
  success: 'success' as SimulatorModelRevisionStatus,
  failure: 'failure' as SimulatorModelRevisionStatus,
};

export interface SimulatorModelRevision {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  simulatorExternalId: CogniteExternalId;
  modelExternalId: CogniteExternalId;
  description?: string;
  dataSetId: CogniteInternalId;
  fileId: CogniteInternalId;
  createdByUserId?: string;
  status: SimulatorModelRevisionStatus;
  statusMessage?: string;
  versionNumber: number;
  metadata?: Record<string, string>;
  createdTime: Date;
  lastUpdatedTime: Date;
  logId: CogniteInternalId;
}

export interface SimulatorModelRevisionCreate {
  externalId: CogniteExternalId;
  modelExternalId: CogniteExternalId;
  description?: string;
  fileId: CogniteInternalId;
  metadata?: Record<string, unknown>;
}

export interface SimulatorModelRevisionPatch {
  update: {
    status?: SinglePatch<string>;
    statusMessage?: SinglePatch<string>;
  };
}

export interface SimulatorModelRevisionChange
  extends SimulatorModelRevisionPatch,
    InternalId {}

export interface SimulatorModelRevisionFilter {
  modelExternalIds?: CogniteExternalId[];
  allVersions?: boolean;
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
}

export interface SimulatorModelRevisionFilterQuery extends FilterQuery {
  filter?: SimulatorModelRevisionFilter;
  sort?: SortItem[];
  limit?: number;
}

export type SimulatorRoutineOperator = 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le';

export const SimulatorRoutineOperator = {
  eq: 'eq' as SimulatorRoutineOperator,
  ne: 'ne' as SimulatorRoutineOperator,
  gt: 'gt' as SimulatorRoutineOperator,
  ge: 'ge' as SimulatorRoutineOperator,
  lt: 'lt' as SimulatorRoutineOperator,
  le: 'le' as SimulatorRoutineOperator,
};

export type SimulatorDataPointsAggregate =
  | 'average'
  | 'interpolation'
  | 'stepInterpolation';

export const SimulatorDataPointsAggregate = {
  average: 'average' as SimulatorDataPointsAggregate,
  interpolation: 'interpolation' as SimulatorDataPointsAggregate,
  stepInterpolation: 'stepInterpolation' as SimulatorDataPointsAggregate,
};

export interface SimulatorRoutine {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  simulatorExternalId: CogniteExternalId;
  modelExternalId: CogniteExternalId;
  simulatorIntegrationExternalId: CogniteExternalId;
  name: string;
  dataSetId: number;
  description?: string;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface SimulatorRoutineCreate {
  externalId: CogniteExternalId;
  modelExternalId: CogniteExternalId;
  simulatorIntegrationExternalId: CogniteExternalId;
  name: string;
}

export interface SimulatorRoutineFilter {
  simulatorIntegrationExternalIds?: CogniteExternalId[];
  modelExternalIds?: CogniteExternalId[];
}

export interface SimulatorRoutineFilterQuery extends FilterQuery {
  filter?: SimulatorRoutineFilter;
}

/* Routine revisions */

export interface SimulatorRoutineDataSampling {
  enabled: true;
  validationWindow: number;
  samplingWindow: number;
  granularity: number;
}

export interface SimulatorRoutineConfigDisabled {
  enabled: false;
}

export interface SimulatorRoutineSchedule {
  enabled: true;
  cronExpression: string;
}

export interface SimulatorRoutineSteadyStateDetection {
  enabled: boolean;
  timeseriesExternalId: CogniteExternalId;
  aggregate: SimulatorDataPointsAggregate;
  minSectionSize: number;
  varThreshold: number;
  slopeThreshold: number;
}

export interface SimulatorRoutineLogicalCheck {
  enabled: boolean;
  timeseriesExternalId: CogniteExternalId;
  aggregate: SimulatorDataPointsAggregate;
  operator: SimulatorRoutineOperator;
  value: number;
}

export interface SimulatorRoutineInputConstant {
  name: string;
  saveTimeseriesExternalId: CogniteExternalId;
  value: string;
  unit?: string;
  unitType?: string;
  referenceId: string;
}

export interface SimulatorRoutineTimeSeries {
  name: string;
  referenceId: string;
  unit?: string;
  unitType?: string;
  saveTimeseriesExternalId: CogniteExternalId;
}

export interface SimulatorRoutineInputTimeseries
  extends SimulatorRoutineTimeSeries {
  sourceExternalId: string;
  aggregate: SimulatorDataPointsAggregate;
}

export interface SimulatorRoutineScriptStepArguments {
  [s: string]: string | undefined;
  referenceId?: string;
}

export interface SimulatorRoutineScriptStep {
  order: number;
  stepType: string;
  description?: string;
  arguments: SimulatorRoutineScriptStepArguments;
}

export interface SimulatorRoutineScript {
  order: number;
  description?: string;
  steps: SimulatorRoutineScriptStep[];
}
export interface SimulatorRoutineRevisionConfiguration {
  dataSampling: SimulatorRoutineConfigDisabled | SimulatorRoutineDataSampling;
  schedule: SimulatorRoutineConfigDisabled | SimulatorRoutineSchedule;
  steadyStateDetection: SimulatorRoutineSteadyStateDetection[];
  logicalCheck: SimulatorRoutineLogicalCheck[];

  inputs: SimulatorRoutineInput[];
  outputs: SimulatorRoutineOutput[];
}
export interface SimulatorRoutineRevision {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  simulatorExternalId: CogniteExternalId;
  routineExternalId: CogniteExternalId;
  simulatorIntegrationExternalId: CogniteExternalId;
  modelExternalId: CogniteExternalId;
  dataSetId: CogniteInternalId;
  createdByUserId: string;
  createdTime: Date;
  lastUpdatedTime: Date;
  configuration: SimulatorRoutineRevisionConfiguration;
  script: SimulatorRoutineScript[];
}

export interface SimulatorRoutineRevisionCreate {
  externalId: CogniteExternalId;
  routineExternalId: CogniteExternalId;
  configuration: SimulatorRoutineRevisionConfiguration;
  script: SimulatorRoutineScript[];
}

export interface SimulatorRoutineRevisionslFilter {
  routineExternalIds?: CogniteExternalId[];
  allVersions?: boolean;
  modelExternalIds?: CogniteExternalId[];
  simulatorIntegrationExternalIds?: CogniteExternalId[];
  simulatorExternalIds?: CogniteExternalId[];
  createdTime?: DateRange;
}

export interface SimulatorRoutineRevisionslFilterQuery extends FilterQuery {
  filter?: SimulatorRoutineRevisionslFilter;
  sort?: SortItem[];
}

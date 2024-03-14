// Copyright 2020 Cognite AS

import { SinglePatch, SortOrder, DateRange } from '@cognite/sdk';
import {
  CogniteExternalId,
  CogniteInternalId,
  FilterQuery,
  InternalId,
  ExternalId,
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
export interface SimulatorUnitSystem {
  label: string;
  defaultUnits: Record<string, string>;
}

export interface SimulatorUnitsMap {
  label: string;
  units: SimulatorUnitRecord[];
}

export interface SimulatorUnits {
  unitsMap?: Record<string, SimulatorUnitsMap>;
  unitSystem?: Record<string, SimulatorUnitSystem>;
}

export interface SimulatorBoundaryCondition {
  name: string;
  address: string;
  key: string;
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
  isBoundaryConditionsEnabled: boolean;
  boundaryConditions: SimulatorBoundaryCondition[];
  isCalculationsEnabled: boolean;
  modelTypes: SimulatorModelType[];
  enabled: boolean;
  stepFields?: SimulatorStep[];
  units?: SimulatorUnits;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface SimulatorFilter {
  enabled?: boolean;
}

export interface SimulatorFilterQuery extends FilterQuery {
  filter?: SimulatorFilter;
}

export interface SimulatorCreate {
  externalId: CogniteExternalId;
  fileExtensionTypes: string[];
  name: string;
  isBoundaryConditionsEnabled?: boolean;
  boundaryConditions?: SimulatorBoundaryCondition[];
  isCalculationsEnabled?: boolean;
  modelTypes?: SimulatorModelType[];
  enabled?: boolean;
  stepFields?: SimulatorStep[];
  units?: SimulatorUnits;
}

export interface SimulatorIntegration {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  simulatorExternalId: CogniteExternalId;
  heartbeat: Date;
  dataSetId: CogniteInternalId;
  connectorVersion: string;
  simulatorVersion: string;
  runApiEnabled: boolean;
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
  runApiEnabled?: boolean;
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
  simulatorName?: string;
  modelName?: string;
  routineName?: string;
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
    isBoundaryConditionsEnabled?: SinglePatch<boolean>;
    boundaryConditions?: SinglePatch<SimulatorBoundaryCondition[]>;
    isCalculationsEnabled?: SinglePatch<boolean>;
    modelTypes?: SinglePatch<SimulatorModelType[]>;
    enabled?: SinglePatch<boolean>;
    stepFields?: SinglePatch<SimulatorStep[]>;
    units?: SinglePatch<SimulatorUnits>;
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
  validationEndTime?: Date;
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
  simulatorName: string;
  modelName: string;
  routineName: string;
  simulatorExternalId?: CogniteExternalId;
  simulatorIntegrationExternalId?: CogniteExternalId;
  modelExternalId?: CogniteExternalId;
  modelRevisionExternalId?: CogniteExternalId;
  routineExternalId?: CogniteExternalId;
  routineRevisionExternalId?: CogniteExternalId;
  status: SimulationRunStatus;
  validationEndTime?: Date;
  simulationTime?: Date;
  statusMessage?: string;
  dataSetId?: CogniteInternalId;
  eventId?: CogniteInternalId;
  runType: SimulationRunType;
  userId?: string;
  logId?: CogniteInternalId;
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
  unitSystem?: string;
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
  unitSystem?: string;
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

interface SimulatorModelBoundaryCondition {
  key: string;
  name: string;
  address: string;
  timeseriesExternalId: string;
}

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
  boundaryConditions?: SimulatorModelBoundaryCondition[];
  boundaryConditionsStatus?: SimulatorModelRevisionStatus;
  versionNumber: number;
  metadata?: Record<string, string>;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface SimulatorModelRevisionCreate {
  externalId: CogniteExternalId;
  modelExternalId: CogniteExternalId;
  description?: string;
  fileId: CogniteInternalId;
  boundaryConditions?: SimulatorModelBoundaryCondition[];
  metadata?: Record<string, any>;
}

export interface SimulatorModelRevisionPatch {
  update: {
    status?: SinglePatch<string>;
    statusMessage?: SinglePatch<string>;
    boundaryConditions?: SinglePatch<SimulatorModelBoundaryCondition[]>;
    boundaryConditionsStatus?: SinglePatch<string>;
  };
}

export interface SimulatorModelRevisionChange
  extends SimulatorModelRevisionPatch,
    InternalId {}

export interface SimulatorModelRevisionFilter {
  modelExternalIds?: CogniteExternalId[];
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
}

export interface SimulatorModelRevisionFilterQuery extends FilterQuery {
  filter?: SimulatorModelRevisionFilter;
  sort?: SortItem[];
  limit?: number;
}

export type CalculationType =
  | 'IPR/VLP'
  | 'ChokeDp'
  | 'VLP'
  | 'IPR'
  | 'BhpFromRate'
  | 'BhpFromGradientTraverse'
  | 'BhpFromGaugeBhp';
export type RoutineOperator = 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le';
export type DataPointsAggregate =
  | 'average'
  | 'max'
  | 'min'
  | 'count'
  | 'sum'
  | 'interpolation'
  | 'stepInterpolation'
  | 'totalVariation'
  | 'continuousVariance'
  | 'discreteVariance';

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
  calculationType?: CalculationType;
}

export interface SimulatorRoutineFilter {
  simulatorIntegrationExternalIds?: CogniteExternalId[];
  modelExternalIds?: CogniteExternalId[];
}

export interface SimulatorRoutineFilterQuery extends FilterQuery {
  filter?: SimulatorRoutineFilter;
}

/* Routine revisions */

export interface RoutineDataSampling {
  validationWindow: number;
  samplingWindow: number;
  granularity: number;
  validationEndOffset: string;
}

export interface RoutineConfigDisabled {
  enabled: boolean;
}

export interface RoutineSchedule {
  enabled: boolean;
  startTime: number;
  repeat: string;
}

export interface RoutineSteadyStateDetection {
  enabled: boolean;
  timeseriesExternalId: CogniteExternalId;
  aggregate: DataPointsAggregate;
  minSectionSize: number;
  varThreshold: number;
  slopeThreshold: number;
}

export interface RoutineLogicalCheck {
  enabled: boolean;
  timeseriesExternalId: CogniteExternalId;
  aggregate: DataPointsAggregate;
  operator: RoutineOperator;
  value: number;
}

export interface RoutineInputConstant {
  name: string;
  saveTimeseriesExternalId: CogniteExternalId;
  value: string;
  unit?: string;
  unitType?: string;
  referenceId: string;
}

export interface RoutineTimeSeries {
  name: string;
  referenceId: string;
  unit?: string;
  unitType?: string;
  saveTimeseriesExternalId: CogniteExternalId;
}

export interface RoutineInputTimeseries extends RoutineTimeSeries {
  sourceExternalId: string;
  aggregate: DataPointsAggregate;
}

export interface RoutineOutputSequence {
  name: string;
  referenceId: string;
}

export interface RoutineGaugeDepth {
  value: number;
  unit: string;
  unitType: string;
}

export interface RoutineScriptStepArguments {
  argumentType: string;
  [s: string]: string;
  referenceId: string;
}

export interface RoutineScriptStep {
  order: number;
  stepType: string;
  description?: string;
  arguments: RoutineScriptStepArguments;
}

export interface RoutineScript {
  order: number;
  description?: string;
  steps: RoutineScriptStep[];
}
export interface RoutineRevisionConfiguration {
  dataSampling: RoutineDataSampling;
  schedule: RoutineConfigDisabled | RoutineSchedule;
  steadyStateDetection: RoutineConfigDisabled | RoutineSteadyStateDetection;
  logicalCheck: RoutineConfigDisabled | RoutineLogicalCheck;
  inputConstants: RoutineInputConstant[];
  outputSequences?: RoutineOutputSequence[];
  inputTimeseries: RoutineInputTimeseries[];
  outputTimeseries: RoutineTimeSeries[];
  extraOptions?: RoutineGaugeDepth;
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
  configuration: RoutineRevisionConfiguration;
  script: RoutineScript[];
  calculationType?: CalculationType;
}

export interface SimulatorRoutineRevisionCreate {
  externalId: CogniteExternalId;
  routineExternalId: CogniteExternalId;
  configuration: RoutineRevisionConfiguration;
  script: RoutineScript[];
}

export interface SimulatorRoutineRevisionslFilter {
  routineExternalIds?: CogniteExternalId[];
  modelExternalIds?: CogniteExternalId[];
  simulatorIntegrationExternalIds?: CogniteExternalId[];
  simulatorExternalIds?: CogniteExternalId[];
  createdTime?: DateRange;
}

export interface SimulatorRoutineRevisionslFilterQuery extends FilterQuery {
  filter?: SimulatorRoutineRevisionslFilter;
}

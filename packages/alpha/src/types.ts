// Copyright 2020 Cognite AS

import { SinglePatch, SortOrder, Timestamp, DateRange } from '@cognite/sdk';
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
  options?: SimulatorStepFieldOption[] | null;
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
  createdTime: Timestamp;
  lastUpdatedTime: Timestamp;
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
  heartbeat: Timestamp;
  dataSetId: CogniteInternalId;
  connectorVersion: string;
  simulatorVersion: string;
  runApiEnabled: boolean;
  licenseStatus: string;
  licenseLastCheckedTime: Timestamp;
  connectorStatus: string;
  connectorStatusUpdatedTime: Timestamp;
  createdTime: Timestamp;
  lastUpdatedTime: Timestamp;
}

export interface SimulatorIntegrationCreate {
  externalId: CogniteExternalId;
  simulatorExternalId: CogniteExternalId;
  dataSetId?: CogniteInternalId;
  heartbeat?: Timestamp;
  connectorVersion?: string;
  simulatorVersion?: string;
  runApiEnabled?: boolean;
  licenseStatus?: string;
  licenseLastCheckedTime?: Timestamp;
  connectorStatus?: string;
  connectorStatusUpdatedTime?: Timestamp;
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
  simulatorName: string;
  modelName: string;
  routineName: string;
  runType: SimulationRunType;
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
  status: SimulationRunStatus;
  validationEndTime?: Date;
  statusMessage?: string;
  eventId?: CogniteInternalId;
  runType: SimulationRunType;
  userId?: string;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface SimulatorModel {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  simulatorExternalId: CogniteExternalId;
  name: string;
  description: string;
  dataSetId: CogniteInternalId;
  labels: ExternalId[];
  type: string;
  unitSystem: string;
  createdTime: Timestamp;
  lastUpdatedTime: Timestamp;
}

export interface SimulatorModelCreate {
  externalId: CogniteExternalId;
  simulatorExternalId: CogniteExternalId;
  name: string;
  description: string;
  dataSetId: CogniteInternalId;
  labels: ExternalId[];
  type: string;
  unitSystem: string;
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

export interface SimulatorModelRevision {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  simulatorExternalId: CogniteExternalId;
  modelExternalId: CogniteExternalId;
  description: string;
  dataSetId: CogniteInternalId;
  fileId: CogniteInternalId;
  createdByUserId: string;
  status: string;
  statusMessage: string;
  boundaryConditions?: SimulatorModelBoundaryCondition[];
  boundaryConditionsStatus: string;
  versionNumber: number;
  metadata: Record<string, any>;
  createdTime: Timestamp;
  lastUpdatedTime: Timestamp;
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

type CalculationType =
  | 'IPR/VLP'
  | 'ChokeDp'
  | 'VLP'
  | 'IPR'
  | 'BhpFromRate'
  | 'BhpFromGradientTraverse'
  | 'BhpFromGaugeBhp';
type RoutineOperator = 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le';
type DataPointsAggregate =
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
  createdTime: Timestamp;
  lastUpdatedTime: Timestamp;
}

export interface SimulatorRoutineCreate {
  externalId: CogniteExternalId;
  modelExternalId: CogniteExternalId;
  simulatorIntegrationExternalId: CogniteExternalId;
  name: string;
  calculationType?: CalculationType;
}

export interface SimulatorRoutineFilter {
  simulatorExternalIds?: CogniteExternalId[];
}

export interface SimulatorRoutineFilterQuery extends FilterQuery {
  filter?: SimulatorRoutineFilter;
}

/* Routine revisions */

interface RoutineDataSampling {
  validationWindow: number;
  samplingWindow: number;
  granularity: number;
  validationEndOffset: string;
}

interface RoutineConfigDisabled {
  enabled: boolean;
}

interface RoutineSchedule {
  enabled: boolean;
  startTime: number;
  repeat: string;
}

interface RoutineSteadyStateDetection {
  enabled: boolean;
  timeseriesExternalId: CogniteExternalId;
  aggregate: DataPointsAggregate;
  minSectionSize: number;
  varThreshold: number;
  slopeThreshold: number;
}

interface RoutineLogicalCheck {
  enabled: boolean;
  timeseriesExternalId: CogniteExternalId;
  aggregate: DataPointsAggregate;
  operator: RoutineOperator;
  value: number;
}

interface RoutineInputConstant {
  name: string;
  saveTimeseriesExternalId: CogniteExternalId;
  value: string;
  unit?: string;
  unitType?: string;
  referenceId: string;
}

interface RoutineTimeSeries {
  name: string;
  referenceId: string;
  unit?: string;
  unitType?: string;
  saveTimeseriesExternalId: CogniteExternalId;
}

interface RoutineInputTimeseries extends RoutineTimeSeries {
  sourceExternalId: string;
  aggregate: DataPointsAggregate;
}

interface RoutineOutputSequence {
  name: string;
  referenceId: string;
}

interface RoutineGaugeDepth {
  value: number;
  unit: string;
  unitType: string;
}

interface RoutineScriptStepArguments {
  argumentType: string;
  objectName: string;
  objectProperty: string;
  referenceId: string;
}

interface RoutineScriptStep {
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
  createdTime: Timestamp;
  lastUpdatedTime: Timestamp;
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

// Copyright 2020 Cognite AS

import { SinglePatch, SortOrder, Timestamp } from '@cognite/sdk';
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

export interface TimestampRange {
  min?: Timestamp;
  max?: Timestamp;
}
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
  createdTime?: TimestampRange;
  lastUpdatedTime?: TimestampRange;
}

export interface SimulatorModelRevisionFilterQuery extends FilterQuery {
  filter?: SimulatorModelRevisionFilter;
  sort?: SortItem[];
  limit?: number;
}

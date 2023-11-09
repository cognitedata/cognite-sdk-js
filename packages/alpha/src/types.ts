// Copyright 2020 Cognite AS

import { Timestamp } from '@cognite/sdk';
import {
  CogniteExternalId,
  CogniteInternalId,
  FilterQuery,
  InternalId,
} from '@cognite/sdk-core';

export * from '@cognite/sdk';

// This file is here mostly to allow apis to import { ... } from '../../types';
// Overriding types should probably be done in their respective API endpoint files, where possible

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

export interface SimulatorStepField {
  name: string;
  label: string;
  info: string;
}

export interface SimulatorStep {
  stepType: string;
  fields: SimulatorStepField[];
}
export interface SimulatorResource {
  id: CogniteInternalId;
  externalId?: CogniteExternalId;
  fileExtensionTypes: string[];
  isBoundaryConditionsEnabled: boolean;
  boundaryConditions: SimulatorBoundaryCondition[];
  isCalculationsEnabled: boolean;
  modelTypes: SimulatorModelType[];
  enabled: boolean;
  stepFields?: SimulatorStep[];
  units?: SimulatorUnits[];
  createdTime: Timestamp;
  lastUpdatedTime: Timestamp;
}

export interface SimulatorResourceFilter {
  enabled?: boolean;
}

export interface SimulatorResourceFilterQuery extends FilterQuery {
  filter?: SimulatorResourceFilter;
}

export interface SimulatorResourceCreate {
  externalId?: CogniteExternalId;
  fileExtensionTypes?: string[];
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
  externalId?: CogniteExternalId;
  simulatorExternalId?: CogniteExternalId;
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
  externalId?: CogniteExternalId;
  simulatorExternalId?: CogniteExternalId;
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

export interface SimulatorResourcePatch {
  update: {
    fileExtensionTypes?: string[];
    isBoundaryConditionsEnabled?: boolean;
    boundaryConditions?: SimulatorBoundaryCondition[];
    isCalculationsEnabled?: boolean;
    modelTypes?: SimulatorModelType[];
    enabled?: boolean;
    stepFields?: SimulatorStep[];
    units?: SimulatorUnits[];
  };
}

export interface SimulatorResourceChange
  extends SimulatorResourcePatch,
    InternalId {}

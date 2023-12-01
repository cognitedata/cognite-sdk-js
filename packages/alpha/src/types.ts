// Copyright 2020 Cognite AS

import { SinglePatch, Timestamp } from '@cognite/sdk';
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

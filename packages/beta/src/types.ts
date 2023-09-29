// Copyright 2020 Cognite AS

import { CogniteInternalId } from '@cognite/sdk';

// This file is here mostly to allow apis to import { ... } from '../../types';
// Overriding types should probably be done in their respective API endpoint files, where possible

export interface IntIn {
  in: number[];
}

export interface IntEquals {
  equals: number;
}

export interface StringIn {
  in: string[];
}

export interface StringEquals {
  equals: string;
}

export interface EpochTimestampRange {
  max: number;
  min: number;
}

export interface ContainsAllIds {
  containsAll: CogniteInternalId[];
}

export interface ContainsAnyIds {
  containsAny: CogniteInternalId[];
}

export interface Unit {
  externalId: CogniteInternalId;
  name: string;
  longName: string;
  symbol: string;
  aliasNames: string[];
  quantity: string;
  conversion: UnitConversion;
  source?: string;
  sourceReference?: string;
}

export interface UnitConversion {
  multiplier: number;
  offset: number;
}

export interface UnitSystemQuantity {
  name: string;
  unitExternalId: CogniteInternalId;
}

export interface UnitSystem {
  name: string;
  quantities: UnitSystemQuantity[];
}

// Copyright 2020 Cognite AS

import {
  AnnotatedResourceType,
  AnnotationStatus,
  AnnotationType,
  CogniteInternalId,
  FilterQuery,
} from '@cognite/sdk';

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

export interface AnnotationReverseLookupRequest
  extends AnnotationReverseLookupFilter,
    FilterQuery {}

export interface AnnotationReverseLookupFilter {
  filter: AnnotationReverseLookupFilterProps;
}

export interface AnnotationReverseLookupFilterProps {
  annotatedResourceType: AnnotatedResourceType;
  annotationType?: AnnotationType;
  creatingApp?: string;
  creatingAppVersion?: string;
  creatingUser?: string;
  status?: AnnotationStatus;
  data?: Record<string, any>;
}

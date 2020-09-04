// Copyright 2020 Cognite AS

import {
  CogniteExternalId,
  CogniteInternalId,
  CreatedAndLastUpdatedTimeFilter,
  DateRange,
  FilterQuery,
  IdEither,
  Label,
  Timestamp,
  Range,
  LabelFilter,
} from '@cognite/sdk';

export * from '@cognite/sdk';
// This file is here mostly to allow apis to import { ... } from '../../types';
// Overriding types should probably be done in their respective API endpoint files, where possible

export type RelationshipResourceType =
  | 'asset'
  | 'timeSeries'
  | 'file'
  | 'event'
  | 'sequence';

export interface Relationship {
  externalId: CogniteExternalId;
  sourceExternalId: CogniteExternalId;
  sourceType: RelationshipResourceType;
  targetExternalId: CogniteExternalId;
  targetType: RelationshipResourceType;
  startTime?: Timestamp;
  endTime?: Timestamp;
  confidence?: number;
  dataSetId?: CogniteInternalId;
  labels?: Label[];
}

export interface RelationshipsFilterRequest extends FilterQuery {
  filter: RelationshipsFilter;
}

export interface RelationshipsFilter extends CreatedAndLastUpdatedTimeFilter {
  sourceExternalIds?: CogniteExternalId[];
  sourceTypes?: RelationshipResourceType[];
  targetExternalIds?: CogniteExternalId[];
  targetTypes?: RelationshipResourceType[];
  dataSetIds?: IdEither[];
  startTime?: DateRange;
  endTime?: DateRange;
  confidence?: Range<number>;
  activeAtTime?: DateRange;
  labels?: LabelFilter;
}

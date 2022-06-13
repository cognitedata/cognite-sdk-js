// Copyright 2022 Cognite AS

import {
  CogniteInternalId,
  FilterQuery,
  IdEither,
  InternalId,
  SetField,
} from '@cognite/sdk';

export type AnnotatedResourceType = 'file';
export type AnnotationStatus = 'suggested' | 'approved' | 'rejected';

// TODO [CXT-463] Use annotation-types package definitions
export type AnnotationType = string;
export type AnnotationPayload = object;

export interface AnnotationModel extends AnnotationCreate {
  id: CogniteInternalId;
  createdTime: Date;
  lastUpdatedTime: Date;
}

export interface AnnotationCreate extends AnnotationSuggest {
  status: AnnotationStatus;
}

export interface AnnotationSuggest {
  annotatedResourceType: AnnotatedResourceType;
  annotatedResourceId: CogniteInternalId;
  annotationType: AnnotationType;
  creatingApp: string;
  creatingAppVersion: string;
  creatingUser: string | null;
  data: AnnotationPayload;
}

export interface AnnotationChangeById extends InternalId, AnnotationUpdate {}

export interface AnnotationUpdate {
  update: {
    annotationType?: SetField<AnnotationType>;
    data?: SetField<AnnotationPayload>;
    status?: SetField<AnnotationStatus>;
  };
}

export interface AnnotationFilterRequest
  extends AnnotationFilter,
    FilterQuery {}

export interface AnnotationFilter {
  filter: AnnotationFilterProps;
}

export interface AnnotationFilterProps {
  annotatedResourceType: AnnotatedResourceType;
  annotatedResourceIds: IdEither[];
  annotationType?: AnnotationType;
  creatingApp?: string;
  creatingAppVersion?: string;
  creatingUser?: string | null;
  status?: AnnotationStatus;
  data?: AnnotationPayload;
}

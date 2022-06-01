// Copyright 2022 Cognite AS

import {
  CogniteExternalId,
  CogniteInternalId,
  FilterQuery,
  IdEither,
  InternalId,
  SetField,
  SinglePatch,
} from '@cognite/sdk';

export type AnnotatedResourceType = 'file';
export type LinkedResourceType = 'file' | 'asset';
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
  linkedResourceType?: LinkedResourceType;
  linkedResourceId?: CogniteInternalId;
  linkedResourceExternalId?: CogniteExternalId;
}

export interface AnnotationChangeById extends InternalId, AnnotationUpdate {}

export interface AnnotationUpdate {
  update: {
    annotationType?: SetField<AnnotationType>;
    data?: SetField<AnnotationPayload>;
    linkedResourceType?: SinglePatch<LinkedResourceType>;
    linkedResourceId?: SinglePatch<CogniteInternalId>;
    linkedResourceExternalId?: SinglePatch<CogniteExternalId>;
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
  linkedResourceType?: LinkedResourceType;
  linkedResourceIds?: IdEither[];
  status?: AnnotationStatus;
  data?: AnnotationPayload;
}
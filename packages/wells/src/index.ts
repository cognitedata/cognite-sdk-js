// Copyright 2020 Cognite AS

export * from '@cognite/sdk';
export { default as CogniteClient } from './client/cogniteClient-deprecated';
export { WellsAPI } from './client/api/wellsApi';
export { WellboresAPI } from './client/api/wellboresAPI';

// dataclasses and types
export * from './client/model/Well-deprecated';
export * from './client/model/GeoJson';
export * from './client/model/WellHeadLocation-deprecated';
export * from './client/model/Wellbore';
export * from './client/model/Survey';
export * from './client/model/MeasurementType';
export * from './client/model/Measurement';
export * from './client/model/Well';
export * from './client/model/WellFilter';
export * from './client/model/WellHead';

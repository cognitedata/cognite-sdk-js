// Copyright 2020 Cognite AS

import { CogniteExternalId, ExternalId, FilterQuery } from '@cognite/sdk';

// This file is here mostly to allow apis to import { ... } from '../../types';
// Overriding types should probably be done in their respective API endpoint files, where possible

export interface ExternalTemplateGroup extends ExternalId {
  /**
   * The externalId of a Template Group
   */
  externalId: CogniteExternalId;

  /**
   * The description of a Template Group
   */
  description?: string;

  /**
   * The owners of a Template Group
   */
  owners?: string[];
}

export type TemplateGroup = ExternalTemplateGroup & {
  /**
   * The owners of a Template Group
   */
  owners: string[];
};

export interface TemplateGroupFilter {
  /**
   * Filter on owners.
   */
  owners?: string[];
}

export interface TemplateGroupFilterQuery extends FilterQuery {
  filter?: TemplateGroupFilter;
}

export interface TemplateGroupVersion {
  version: number;
  schema: string;
}

export enum ConflictMode {
  /** Patch the existing version, but will fail if there are breaking changes. */
  Patch = 'Patch',
  /** Update the Template Group by bumping the version. */
  Update = 'Update',
  /** Force update the existing version even if there are breaking changes. Note, this can break consumers of that version. */
  Force = 'Force',
}

export interface ExternalTemplateGroupVersion {
  schema: string;
  /** Specifies the conflict mode to use. By default the mode is 'ConflictMode.Patch'.*/
  conflictMode?: ConflictMode;
  version?: number;
}

export interface TemplateGroupVersionFilter extends FilterQuery {
  minVersion?: number;
  maxVersion?: number;
}

export interface TemplateGroupVersionFilterQuery extends FilterQuery {
  filter?: TemplateGroupVersionFilter;
}

export interface TemplateInstance extends ExternalId {
  templateName: string;
  dataSetId?: number;
  fieldResolvers: { [K in string]: FieldResolver | {} };
}

export type ExternalTemplateInstance = TemplateInstance;

export interface FieldResolver {
  type: string;
}

export class ConstantResolver implements FieldResolver {
  type = 'constant';
  value: {};

  constructor(value: {}) {
    this.value = value;
  }
}

export class RawResolver implements FieldResolver {
  type = 'raw';
  dbName: string;
  tableName: string;
  rowKey?: string;
  columnName?: string;

  constructor(
    dbName: string,
    tableName: string,
    rowKey?: string,
    columnName?: string
  ) {
    this.dbName = dbName;
    this.tableName = tableName;
    this.rowKey = rowKey;
    this.columnName = columnName;
  }
}

export class SyntheticTimeSeriesResolver implements FieldResolver {
  type = 'syntheticTimeSeries';
  expression: string;
  name?: string;
  metadata?: { [K in string]: string };
  description?: string;
  isStep?: boolean;
  isString?: boolean;
  unit?: string;

  constructor(
    expression: string,
    name?: string,
    metadata?: { [K in string]: string },
    description?: string,
    isStep?: boolean,
    isString?: boolean,
    unit?: string
  ) {
    this.expression = expression;
    this.name = name;
    this.metadata = metadata;
    this.description = description;
    this.isStep = isStep;
    this.isString = isString;
    this.unit = unit;
  }
}

export interface TemplateInstanceFilter {
  dataSetIds?: number[];
  templateNames?: string[];
}

export interface TemplateInstanceFilterQuery extends FilterQuery {
  filter?: TemplateInstanceFilter;
}

export type GraphQlResponse = {
  data: any;
  errors: GraphQlError[];
};

export type GraphQlError = {
  message: string;
  path: string[];
  locations: { line: number; column: number }[];
};

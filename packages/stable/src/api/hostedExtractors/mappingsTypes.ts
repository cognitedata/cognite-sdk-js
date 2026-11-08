// Copyright 2026 Cognite AS

import type { CogniteExternalId } from '@cognite/sdk-core';
import type {
  Metadata,
  MetadataPatch,
  SetField,
  SinglePatch,
  SinglePatchString,
} from '../../types';
import type { EpochTimestamp } from '../../types.gen';

export interface HostedExtractorMappingExpression {
  /**
   * Transform expression written in the Cognite transformation language.
   * At most 2000 characters.
   */
  expression: string;
}

// Input

export interface HostedExtractorMappingProtoFile {
  /**
   * Letters, numbers, underscores and hyphens, ending with `.proto`.
   */
  fileName: string;
}

export interface HostedExtractorMappingProtoFileCreate
  extends HostedExtractorMappingProtoFile {
  /**
   * Content of a valid protobuf file. At most 10000 characters.
   */
  content: string;
}

/**
 * Compile protobuf files and use them to convert the input to JSON. The file
 * contents are not returned.
 */
export interface HostedExtractorMappingProtobufInput {
  type: 'protobuf';
  /**
   * Name of the root message in the protobuf files.
   */
  messageName: string;
  /**
   * Between 1 and 20 files.
   */
  files: HostedExtractorMappingProtoFile[];
}

export interface HostedExtractorMappingProtobufInputCreate
  extends Omit<HostedExtractorMappingProtobufInput, 'files'> {
  /**
   * Between 1 and 20 files.
   */
  files: HostedExtractorMappingProtoFileCreate[];
}

/**
 * Convert a CSV file to a list of JSON objects of the form
 * `[{"header1": "value1", ...}, ...]`.
 */
export interface HostedExtractorMappingCsvInput {
  type: 'csv';
  /**
   * A single ASCII character that separates the values.
   * @default ','
   */
  delimiter?: string;
  /**
   * Between 1 and 20 headers. If not set, the headers are read from the file.
   */
  customKeys?: string[];
}

/**
 * Convert an XML file to a JSON object.
 */
export interface HostedExtractorMappingXmlInput {
  type: 'xml';
}

/**
 * Treat the input as UTF-8 encoded JSON.
 */
export interface HostedExtractorMappingJsonInput {
  type: 'json';
}

export type HostedExtractorMappingInput =
  | HostedExtractorMappingProtobufInput
  | HostedExtractorMappingCsvInput
  | HostedExtractorMappingXmlInput
  | HostedExtractorMappingJsonInput;

export type HostedExtractorMappingInputCreate =
  | HostedExtractorMappingProtobufInputCreate
  | HostedExtractorMappingCsvInput
  | HostedExtractorMappingXmlInput
  | HostedExtractorMappingJsonInput;

export type HostedExtractorMappingInputType =
  HostedExtractorMappingInput['type'];

// Mapping

interface HostedExtractorMappingBase {
  externalId: CogniteExternalId;
  mapping: HostedExtractorMappingExpression;
  /**
   * Whether jobs can use this mapping.
   */
  published: boolean;
  /**
   * At most 50 characters.
   */
  name?: string;
  /**
   * At most 500 characters.
   */
  description?: string;
  metadata?: Metadata;
}

export interface HostedExtractorMappingCreate
  extends HostedExtractorMappingBase {
  /**
   * How to convert the input to JSON before it is passed to the expression.
   * @default { type: 'json' }
   */
  input?: HostedExtractorMappingInputCreate;
}

export interface HostedExtractorMapping extends HostedExtractorMappingBase {
  input: HostedExtractorMappingInput;
  createdTime: EpochTimestamp;
  lastUpdatedTime: EpochTimestamp;
}

export interface HostedExtractorMappingPatch {
  mapping?: SetField<HostedExtractorMappingExpression>;
  /**
   * Removing the input makes the mapping use JSON input.
   */
  input?: SinglePatch<HostedExtractorMappingInputCreate>;
  published?: SetField<boolean>;
  /**
   * Between 1 and 50 characters.
   */
  name?: SinglePatchString;
  description?: SinglePatchString;
  metadata?: MetadataPatch;
}

export interface HostedExtractorMappingChange {
  externalId: CogniteExternalId;
  update: HostedExtractorMappingPatch;
}

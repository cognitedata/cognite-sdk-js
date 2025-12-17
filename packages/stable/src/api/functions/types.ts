// Copyright 2020 Cognite AS

import type {
  CogniteExternalId,
  CogniteInternalId,
  IdEither,
  Limit,
} from '@cognite/sdk-core';
import type { DateRange, Metadata } from '../../types';

/**
 * Status of the function.
 * - Queued: Initial state when the function is created.
 * - Deploying: The function is being deployed.
 * - Ready: The function is ready and can be called.
 * - Failed: The function deployment failed.
 */
export type FunctionStatus = 'Queued' | 'Deploying' | 'Ready' | 'Failed';

/**
 * Runtime for the function. For example, runtime "py312" translates to the latest version of the Python 3.12 series.
 */
export type FunctionRuntime = 'py310' | 'py311' | 'py312';

/**
 * Activation status of Cognite Functions.
 * - inactive: Functions have not been activated for the project.
 * - requested: Activation has been requested.
 * - activated: Functions have been activated and are ready to use.
 */
export type FunctionsActivationStatus = 'inactive' | 'requested' | 'activated';

/**
 * Error that occurred during function build.
 */
export interface FunctionBuildError {
  /**
   * Error message.
   */
  message?: string;
  /**
   * Error trace.
   */
  trace?: string;
}

/**
 * A function in Cognite Functions.
 */
export interface CogniteFunction {
  /**
   * A server-generated ID for the function.
   */
  id: CogniteInternalId;
  /**
   * The time the function was created in CDF.
   */
  createdTime: Date;
  /**
   * Status of the function.
   */
  status: FunctionStatus;
  /**
   * Name of the function.
   */
  name: string;
  /**
   * External ID of the function.
   */
  externalId?: CogniteExternalId;
  /**
   * File ID of the function source code.
   */
  fileId: CogniteInternalId;
  /**
   * Owner of the function. Typically used to know who created it.
   */
  owner?: string;
  /**
   * Description of the function.
   */
  description?: string;
  /**
   * Custom metadata for the function.
   */
  metadata?: Metadata;
  /**
   * Secrets are returned scrambled if set.
   */
  secrets?: Record<string, string>;
  /**
   * Relative path from the root folder to the file containing the handle function.
   */
  functionPath?: string;
  /**
   * Environment variables for the function.
   */
  envVars?: Record<string, string>;
  /**
   * Number of CPU cores per function.
   */
  cpu?: number;
  /**
   * Memory per function measured in GB.
   */
  memory?: number;
  /**
   * The runtime of the function.
   */
  runtime?: FunctionRuntime;
  /**
   * The complete specification of the function runtime with major, minor and patch version numbers.
   */
  runtimeVersion?: string;
  /**
   * Error that occurred during function build.
   */
  error?: FunctionBuildError;
}

/**
 * Create a new function.
 */
export interface ExternalCogniteFunction {
  /**
   * Name of the function. Required.
   */
  name: string;
  /**
   * External ID of the function.
   */
  externalId?: CogniteExternalId;
  /**
   * File ID of the function source code. Required.
   */
  fileId: CogniteInternalId;
  /**
   * Owner of the function.
   */
  owner?: string;
  /**
   * Description of the function.
   */
  description?: string;
  /**
   * Custom metadata for the function.
   */
  metadata?: Metadata;
  /**
   * Secrets for the function. Keys must be lowercase characters, numbers or dashes (-) and at most 15 characters.
   */
  secrets?: Record<string, string>;
  /**
   * Relative path from the root folder to the file containing the handle function.
   */
  functionPath?: string;
  /**
   * Environment variables for the function.
   */
  envVars?: Record<string, string>;
  /**
   * Number of CPU cores per function.
   */
  cpu?: number;
  /**
   * Memory per function measured in GB.
   */
  memory?: number;
  /**
   * The runtime of the function.
   */
  runtime?: FunctionRuntime;
  /**
   * Specify a different python package index.
   */
  indexUrl?: string;
  /**
   * Extra package index URLs to use when building the function.
   */
  extraIndexUrls?: string[];
}

/**
 * Filter for listing functions.
 */
export interface FunctionFilterProps {
  /**
   * Filter by function name.
   */
  name?: string;
  /**
   * Filter by function owner.
   */
  owner?: string;
  /**
   * Filter by file ID.
   */
  fileId?: CogniteInternalId;
  /**
   * Filter by function status.
   */
  status?: FunctionStatus;
  /**
   * Filter by external ID prefix.
   */
  externalIdPrefix?: CogniteExternalId;
  /**
   * Filter by created time.
   */
  createdTime?: DateRange;
  /**
   * Filter by metadata.
   */
  metadata?: Metadata;
}

/**
 * Filter request for listing functions.
 */
export interface FunctionFilter {
  filter?: FunctionFilterProps;
}

/**
 * List scope for listing functions with filter and limit.
 */
export interface FunctionListScope extends FunctionFilter, Limit {}

/**
 * Range for CPU or memory limits.
 */
export interface FunctionsLimitsRange {
  /**
   * Minimum value.
   */
  min: number;
  /**
   * Maximum value.
   */
  max: number;
  /**
   * Default value.
   */
  default: number;
}

/**
 * Service limits for Cognite Functions.
 */
export interface FunctionsLimits {
  /**
   * Timeout of each function call in minutes.
   */
  timeoutMinutes: number;
  /**
   * CPU cores range and default.
   */
  cpuCores: FunctionsLimitsRange;
  /**
   * Memory in GB range and default.
   */
  memoryGb: FunctionsLimitsRange;
  /**
   * Available runtimes.
   */
  runtimes: string[];
  /**
   * Maximum response size of function calls in MB.
   */
  responseSizeMb: number;
}

/**
 * Activation status response for Cognite Functions.
 */
export interface FunctionsActivationResponse {
  /**
   * Signifies whether Cognite Functions have been requested or activated for the project.
   */
  status: FunctionsActivationStatus;
}

/**
 * Function ID or external ID for deletion.
 */
export type FunctionIdEither = IdEither;

/**
 * Parameters for deleting functions.
 */
export interface FunctionDeleteParams {
  /**
   * Ignore IDs and external IDs that are not found.
   */
  ignoreUnknownIds?: boolean;
}


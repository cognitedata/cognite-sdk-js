// Copyright 2020 Cognite AS

import { type EndpointList, createRetryValidator } from '@cognite/sdk-core';
import { HttpMethod } from '@cognite/sdk-core';

/**
 * Rather than enumerating every resource (assets, events, timeseries, …),
 * we list the **path suffixes** that denote read-only or idempotent POST
 * operations.  Any current or future CDF resource whose POST URL ends with
 * one of these suffixes will automatically be retried on 429 / 5xx.
 *
 * Suffixes are matched at a path-boundary so e.g. "/list" matches
 * "/assets/list" but not "/assets/listing".
 */
const RETRYABLE_POST_SUFFIXES: string[] = [
  // Read-only query operations
  '/list',
  '/byids',
  '/search',
  '/aggregate',
  '/query',
  '/filter',
  '/sync',
  '/inspect',
  '/reverselookup',
  '/downloadlink',
  '/latest',
  // Idempotent write operations
  '/delete',
  '/initupload',
  // Timeseries datapoint ingestion (upsert by timestamp – idempotent)
  '/data',
];

const ENDPOINTS_TO_RETRY: EndpointList = {
  [HttpMethod.Post]: RETRYABLE_POST_SUFFIXES,
};

export const retryValidator = createRetryValidator(ENDPOINTS_TO_RETRY);

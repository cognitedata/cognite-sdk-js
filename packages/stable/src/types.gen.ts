// Copyright 2022 Cognite AS
export type EpochTimestamp = number;
/**
 * The external ID provided by the client. Must be unique for the resource type.
 * @example my.known.id
 */
export type CogniteExternalId = string;
/**
 * A server-generated ID for the object.
 * @format int64
 * @min 1
 * @max 9007199254740991
 */
export type CogniteInternalId = number;

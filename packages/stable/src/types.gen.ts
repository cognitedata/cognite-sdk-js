// Copyright 2022 Cognite AS
export type EpochTimestamp = number;
export type NextCursorV3 = string;
export interface UpsertConflict {
  /** Details about the error caused by the upsert/update. */
  error: {
    code: number;
    message: string;
  };
}
export type SpaceSpecification = string;

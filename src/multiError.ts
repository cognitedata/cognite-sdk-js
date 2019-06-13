// Copyright 2019 Cognite AS

import { AxiosResponse } from 'axios';
import { CogniteError } from './error';

/** @hidden */
export interface MultiErrorRawSummary<RequestType, ResponseType> {
  succeded: RequestType[][];
  responses: AxiosResponse<ResponseType>[];
  failed: RequestType[][];
  errors: (Error | CogniteError)[];
}

export class CogniteMultiError<RequestType, ResponseType> extends Error {
  public failed: RequestType[];
  public succeded: RequestType[];

  public status?: number;
  public requestId?: string;
  public missing: object[] = [];
  public duplicated: any[] = [];
  public statuses: number[] = [];
  public requestIds: string[] = [];
  public responses: ResponseType[] = [];
  public errors: (Error | CogniteError)[];

  constructor({
    succeded,
    responses,
    failed,
    errors,
  }: MultiErrorRawSummary<RequestType, ResponseType>) {
    
    super('The API Failed to process some items.');
    Object.setPrototypeOf(this, CogniteMultiError.prototype);

    this.responses = responses.map(response => response.data);
    this.errors = errors;
    this.succeded = succeded.reduce((all, current) => all.concat(current), []);
    this.failed = failed.reduce((all, current) => all.concat(current), []);
    this.status = (errors[0] as CogniteError).status;
    this.requestId = (errors[0] as CogniteError).requestId;

    for (const err of errors) {
      if (err instanceof CogniteError) {
        if (err.missing) {
          this.missing = this.missing.concat(err.missing);
        }
        if (err.duplicated) {
          this.duplicated = this.duplicated.concat(err.duplicated);
        }
        if (err.requestId) {
          this.requestIds.push(err.requestId);
        }
        this.statuses.push(err.status);
      }
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}

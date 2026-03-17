// Copyright 2020 Cognite AS

import { CogniteError } from './error';
import type { HttpResponse } from './httpClient/basicHttpClient';

/** @hidden */
export interface MultiErrorRawSummary<RequestType, ResponseType> {
  succeeded: RequestType[][];
  responses: HttpResponse<ResponseType>[];
  failed: RequestType[][];
  errors: (Error | CogniteError)[];
}

function serialiseErrors(errors: (Error | CogniteError)[]) {
  return errors.map((err) => {
    if (err instanceof CogniteError) {
      return err;
    }
    const { message, name, stack } = err;
    return { name, message, stack };
  });
}

export class CogniteMultiError<RequestType, ResponseType> extends Error {
  public failed: RequestType[];
  public succeeded: RequestType[];

  /** @deprecated Use `succeeded` instead. */
  public get succeded(): RequestType[] {
    return this.succeeded;
  }

  public status?: number;
  public requestId?: string;
  public missing: object[] = [];
  public duplicated: unknown[] = [];
  public statuses: number[] = [];
  public requestIds: string[] = [];
  public responses: ResponseType[] = [];
  public errors: (Error | CogniteError)[];

  constructor({
    succeeded,
    responses,
    failed,
    errors,
  }: MultiErrorRawSummary<RequestType, ResponseType>) {
    super(
      `The API Failed to process some items\n${JSON.stringify(
        {
          succeeded,
          responses,
          failed,
          errors: serialiseErrors(errors),
        },
        null,
        2
      )}`
    );
    Object.setPrototypeOf(this, CogniteMultiError.prototype); // https://stackoverflow.com/questions/51229574/why-instanceof-returns-false-for-a-child-object-in-javascript

    this.responses = responses.map((response) => response.data);
    this.errors = errors;
    this.succeeded = succeeded.reduce((all, current) => all.concat(current), []);
    this.failed = failed.reduce((all, current) => all.concat(current), []);
    const firstError = errors[0];
    if (firstError instanceof CogniteError) {
      this.status = firstError.status;
      this.requestId = firstError.requestId;
    }

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

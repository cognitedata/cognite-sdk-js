// Copyright 2020 Cognite AS
import type { HttpHeaders } from './httpHeaders';

export interface HttpErrorData {
  error: {
    code: number;
    message: string;
    isAutoRetryable?: boolean;
    missing?: object[];
    duplicated?: object[];
    forbidden?: object[];
    extra?: unknown;
  };
}

export class HttpError extends Error {
  /** @hidden */
  constructor(
    public status: number,
    public data: HttpErrorData,
    public headers: HttpHeaders
  ) {
    super(`Request failed | status code: ${status}`);
    Object.setPrototypeOf(this, HttpError.prototype); // https://stackoverflow.com/questions/51229574/why-instanceof-returns-false-for-a-child-object-in-javascript
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}

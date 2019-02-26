// Copyright 2019 Cognite AS

import { AxiosError } from 'axios';

export class CogniteError extends Error {
  public status: number;
  public requestId?: string;
  constructor(errorMessage: string, status: number, requestId?: string) {
    let message = `${errorMessage} | code: ${status}`;
    if (requestId) {
      message += ` | X-Request-ID: ${requestId}`;
    }
    super(message);
    this.status = status;
    this.requestId = requestId;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

/** @hidden */
export function handleErrorResponse(err: AxiosError) {
  let code;
  let message;
  let requestId;
  try {
    code = err.response!.status;
    message = err.response!.data.error.message;
    requestId = (err.response!.headers || {})['X-Request-Id'];
  } catch (_) {
    throw err;
  }
  throw new CogniteError(message, code, requestId);
}

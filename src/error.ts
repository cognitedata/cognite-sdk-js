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
  let message;
  let code;
  let requestId;
  try {
    message = err.response!.data.error.message;
    code = err.response!.data.error.code;
    requestId = (err.response!.headers || {})['X-Request-Id'];
  } catch (_) {
    throw err;
  }
  throw new CogniteError(message, code, requestId);
}

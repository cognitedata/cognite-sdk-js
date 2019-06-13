// Copyright 2019 Cognite AS

import { AxiosError } from 'axios';

export class CogniteError extends Error {
  public status: number;
  public requestId?: string;
  public missing?: object[];
  public duplicated?: any[];
  /** @hidden */
  constructor(
    errorMessage: string,
    status: number,
    requestId?: string,
    extra: any = {}
  ) {
    let message = `${errorMessage} | code: ${status}`;
    if (requestId) {
      message += ` | X-Request-ID: ${requestId}`;
    }
    const { missing, duplicated } = extra;
    if (missing || duplicated) {
      message += `\n${JSON.stringify(extra, null, 2)}`;
    }
    super(message);
    Object.setPrototypeOf(this, CogniteError.prototype);
    this.status = status;
    this.requestId = requestId;
    this.missing = missing;
    this.duplicated = duplicated;
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
  let missing;
  let duplicated;
  try {
    code = err.response!.status;
    message = err.response!.data.error.message;
    missing = err.response!.data.error.missing;
    duplicated = err.response!.data.error.duplicated;
    requestId = (err.response!.headers || {})['X-Request-Id'];
  } catch (_) {
    throw err;
  }
  throw new CogniteError(message, code, requestId, { missing, duplicated });
}

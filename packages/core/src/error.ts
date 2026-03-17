// Copyright 2020 Cognite AS
import { X_REQUEST_ID } from './constants';
import type { HttpError } from './httpClient/httpError';
import { getHeaderField } from './httpClient/httpHeaders';

export class CogniteError extends Error {
  public status: number;
  public errorMessage: string;
  public requestId?: string;
  public missing?: object[];
  public duplicated?: unknown[];
  public extra?: unknown;
  public errorCode?: number;
  /** @hidden */
  constructor(
    errorMessage: string,
    status: number,
    requestId?: string,
    otherFields: {
      missing?: object[];
      duplicated?: unknown[];
      extra?: unknown;
      errorCode?: number;
    } = {}
  ) {
    let message = `${errorMessage} | code: ${status}`;
    if (requestId) {
      message += ` | X-Request-ID: ${requestId}`;
    }
    const { missing, duplicated, extra, errorCode } = otherFields;
    if (missing || duplicated) {
      message += `\n${JSON.stringify(otherFields, null, 2)}`;
    }
    super(message);
    Object.setPrototypeOf(this, CogniteError.prototype); // https://stackoverflow.com/questions/51229574/why-instanceof-returns-false-for-a-child-object-in-javascript
    this.errorMessage = errorMessage;
    this.status = status;
    this.requestId = requestId;
    this.missing = missing;
    this.duplicated = duplicated;
    this.extra = extra;
    this.errorCode = errorCode;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }

  public toJSON() {
    const jsonObject: { [key: string]: unknown } = {
      status: this.status,
      message: this.errorMessage,
    };
    if (this.requestId) {
      jsonObject.requestId = this.requestId;
    }
    if (this.missing) {
      jsonObject.missing = this.missing;
    }
    if (this.duplicated) {
      jsonObject.duplicated = this.duplicated;
    }
    if (this.extra) {
      jsonObject.extra = this.extra;
    }
    if (this.errorCode !== undefined) {
      jsonObject.errorCode = this.errorCode;
    }
    return jsonObject;
  }
}

/** @hidden */
export function handleErrorResponse(err: HttpError) {
  let code: number;
  let duplicated: object[] | undefined;
  let errorCode: number | undefined;
  let extra: unknown;
  let message: string;
  let missing: object[] | undefined;
  let requestId: string | undefined;
  try {
    code = err.status;
    const data = err.data;
    duplicated = data.error.duplicated;
    errorCode = data.error.code;
    message = data.error.message;
    missing = data.error.missing;
    extra = data.error.extra;
    requestId = getHeaderField(err.headers || {}, X_REQUEST_ID);
  } catch (_) {
    throw err;
  }
  throw new CogniteError(message, code, requestId, {
    duplicated,
    errorCode,
    extra,
    missing,
  });
}

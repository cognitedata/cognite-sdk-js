// Copyright 2019 Cognite AS
import { HttpError } from './utils/http/httpError';

export class CogniteError extends Error {
  public status: number;
  public errorMessage: string;
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
    Object.setPrototypeOf(this, CogniteError.prototype); // https://stackoverflow.com/questions/51229574/why-instanceof-returns-false-for-a-child-object-in-javascript
    this.errorMessage = errorMessage;
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

  public toJSON() {
    const jsonObject: { [key: string]: any } = {
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
    return jsonObject;
  }
}

/** @hidden */
export function handleErrorResponse(err: HttpError) {
  let code;
  let message;
  let requestId;
  let missing;
  let duplicated;
  try {
    code = err.status;
    message = err.data.error.message;
    missing = err.data.error.missing;
    duplicated = err.data.error.duplicated;
    requestId = (err.headers || {})['X-Request-Id'];
  } catch (_) {
    throw err;
  }
  throw new CogniteError(message, code, requestId, { missing, duplicated });
}

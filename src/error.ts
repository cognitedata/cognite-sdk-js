// Copyright 2019 Cognite AS
import { X_REQUEST_ID } from './constants';
import { HttpError } from './utils/http/httpError';

export class CogniteError extends Error {
  public status: number;
  public errorMessage: string;
  public requestId?: string;
  public missing?: object[];
  public duplicated?: any[];
  public extra?: any;
  /** @hidden */
  constructor(
    errorMessage: string,
    status: number,
    requestId?: string,
    otherFields: any = {}
  ) {
    let message = `${errorMessage} | code: ${status}`;
    if (requestId) {
      message += ` | X-Request-ID: ${requestId}`;
    }
    const { missing, duplicated, extra } = otherFields;
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
    if (this.extra) {
      jsonObject.extra = this.extra;
    }
    return jsonObject;
  }
}

/** @hidden */
export function handleErrorResponse(err: HttpError) {
  let code;
  let duplicated;
  let extra;
  let message;
  let missing;
  let requestId;
  try {
    code = err.status;
    duplicated = err.data.error.duplicated;
    message = err.data.error.message;
    missing = err.data.error.missing;
    extra = err.data.error.extra;
    requestId = (err.headers || {})[X_REQUEST_ID];
  } catch (_) {
    throw err;
  }
  throw new CogniteError(message, code, requestId, {
    duplicated,
    extra,
    missing,
  });
}

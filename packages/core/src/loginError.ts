// Copyright 2020 Cognite AS

export class CogniteLoginError extends Error {
  constructor(message?: string) {
    super(message || 'Not able to login');
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}

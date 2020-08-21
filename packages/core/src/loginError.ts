// Copyright 2020 Cognite AS

export class CogniteLoginError extends Error {
  public data: { [key: string]: any };
  constructor(message?: string, data?: { [key: string]: any }) {
    super(message || 'Not able to login');

    this.data = data || {};

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}

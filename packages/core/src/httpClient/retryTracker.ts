// Copyright 2020 Cognite AS

import { isValidRetryStatusCode } from './retryValidator';

export interface RetryConfig {
  maxRetriesTotal: number;
  maxRetriesStatus: number;
  maxRetriesRead: number;
  maxRetriesConnect: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetriesTotal: 10,
  maxRetriesStatus: 10,
  maxRetriesRead: 10,
  maxRetriesConnect: 3,
};

export class RetryTracker {
  status = 0;
  read = 0;
  connect = 0;

  constructor(private readonly config: RetryConfig) {}

  get total(): number {
    return this.status + this.read + this.connect;
  }

  shouldRetry(statusCode: number | null, isAutoRetryable = false): boolean {
    if (this.total >= this.config.maxRetriesTotal) return false;
    if (this.status > 0 && this.status >= this.config.maxRetriesStatus)
      return false;
    if (this.read > 0 && this.read >= this.config.maxRetriesRead) return false;
    if (this.connect > 0 && this.connect >= this.config.maxRetriesConnect)
      return false;
    if (
      statusCode !== null &&
      !isValidRetryStatusCode(statusCode) &&
      !isAutoRetryable
    )
      return false;
    return true;
  }
}

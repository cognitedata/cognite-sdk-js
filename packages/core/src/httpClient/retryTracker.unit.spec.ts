// Copyright 2020 Cognite AS

import { describe, expect, test } from 'vitest';
import {
  DEFAULT_RETRY_CONFIG,
  type RetryConfig,
  RetryTracker,
} from './retryTracker';

describe('RetryTracker', () => {
  test('total returns sum of all counters', () => {
    const tracker = new RetryTracker(DEFAULT_RETRY_CONFIG);
    tracker.status = 2;
    tracker.read = 3;
    tracker.connect = 1;
    expect(tracker.total).toBe(6);
  });

  test('shouldRetry returns false when maxRetriesTotal exceeded', () => {
    const config: RetryConfig = { ...DEFAULT_RETRY_CONFIG, maxRetriesTotal: 3 };
    const tracker = new RetryTracker(config);
    tracker.status = 3;
    expect(tracker.shouldRetry(429)).toBe(false);
  });

  test('shouldRetry returns false when maxRetriesStatus exceeded', () => {
    const config: RetryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      maxRetriesStatus: 2,
    };
    const tracker = new RetryTracker(config);
    tracker.status = 2;
    expect(tracker.shouldRetry(429)).toBe(false);
  });

  test('shouldRetry returns false when maxRetriesRead exceeded', () => {
    const config: RetryConfig = { ...DEFAULT_RETRY_CONFIG, maxRetriesRead: 2 };
    const tracker = new RetryTracker(config);
    tracker.read = 2;
    expect(tracker.shouldRetry(429)).toBe(false);
  });

  test('shouldRetry returns false when maxRetriesConnect exceeded', () => {
    const config: RetryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      maxRetriesConnect: 1,
    };
    const tracker = new RetryTracker(config);
    tracker.connect = 1;
    expect(tracker.shouldRetry(429)).toBe(false);
  });

  test('shouldRetry returns true for retryable status codes within limits', () => {
    const tracker = new RetryTracker(DEFAULT_RETRY_CONFIG);
    expect(tracker.shouldRetry(429)).toBe(true);
    expect(tracker.shouldRetry(502)).toBe(true);
    expect(tracker.shouldRetry(503)).toBe(true);
    expect(tracker.shouldRetry(504)).toBe(true);
  });

  test('shouldRetry returns true for non-retryable status codes when isAutoRetryable is true', () => {
    const tracker = new RetryTracker(DEFAULT_RETRY_CONFIG);
    expect(tracker.shouldRetry(400, true)).toBe(true);
    expect(tracker.shouldRetry(500, true)).toBe(true);
  });

  test('counters increment independently and interact correctly with total limit', () => {
    const config: RetryConfig = {
      maxRetriesTotal: 5,
      maxRetriesStatus: 3,
      maxRetriesRead: 3,
      maxRetriesConnect: 3,
    };
    const tracker = new RetryTracker(config);
    tracker.status = 2;
    tracker.read = 2;
    expect(tracker.total).toBe(4);
    expect(tracker.shouldRetry(429)).toBe(true);

    tracker.connect = 1;
    expect(tracker.total).toBe(5);
    expect(tracker.shouldRetry(429)).toBe(false);
  });

  test('connect retries are capped at maxRetriesConnect even if total limit allows more', () => {
    const config: RetryConfig = {
      maxRetriesTotal: 10,
      maxRetriesStatus: 10,
      maxRetriesRead: 10,
      maxRetriesConnect: 3,
    };
    const tracker = new RetryTracker(config);
    tracker.connect = 3;
    expect(tracker.total).toBe(3);
    expect(tracker.shouldRetry(429)).toBe(false);
  });

  test('shouldRetry skips status code check when statusCode is null', () => {
    const tracker = new RetryTracker(DEFAULT_RETRY_CONFIG);
    expect(tracker.shouldRetry(null)).toBe(true);
  });
});

// Copyright 2026 Cognite AS

import { describe, expect, test } from 'vitest';
import { isConnectionError, isReadTimeout } from './fetchError';

function errorWithCause(code: string): TypeError {
  const cause = Object.assign(new Error(code), { code });
  return Object.assign(new TypeError('fetch failed'), { cause });
}

describe('isReadTimeout', () => {
  test('returns true for DOMException with AbortError name', () => {
    const err = new DOMException('The operation was aborted', 'AbortError');
    expect(isReadTimeout(err)).toBe(true);
  });

  test('returns true for Error with TimeoutError name', () => {
    const err = new Error('signal timed out');
    err.name = 'TimeoutError';
    expect(isReadTimeout(err)).toBe(true);
  });

  test.each(['ETIMEDOUT', 'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT'])(
    'returns true for cause code %s',
    (code) => {
      expect(isReadTimeout(errorWithCause(code))).toBe(true);
    }
  );

  test('returns false for a plain TypeError', () => {
    expect(isReadTimeout(new TypeError('fetch failed'))).toBe(false);
  });

  test('returns false for connection error codes', () => {
    expect(isReadTimeout(errorWithCause('ECONNREFUSED'))).toBe(false);
    expect(isReadTimeout(errorWithCause('ENOTFOUND'))).toBe(false);
  });

  test('returns false for non-Error values', () => {
    expect(isReadTimeout('timeout')).toBe(false);
    expect(isReadTimeout(null)).toBe(false);
    expect(isReadTimeout(undefined)).toBe(false);
    expect(isReadTimeout(42)).toBe(false);
  });
});

describe('isConnectionError', () => {
  test.each([
    'ECONNREFUSED',
    'ECONNRESET',
    'ENOTFOUND',
    'ENETUNREACH',
    'EHOSTUNREACH',
    'EPIPE',
    'UND_ERR_CONNECT_TIMEOUT',
  ])('returns true for cause code %s', (code) => {
    expect(isConnectionError(errorWithCause(code))).toBe(true);
  });

  test('returns true for plain TypeError (browser fetch network failure)', () => {
    expect(isConnectionError(new TypeError('fetch failed'))).toBe(true);
  });

  test('returns false for read timeout codes', () => {
    expect(isConnectionError(errorWithCause('ETIMEDOUT'))).toBe(false);
    expect(isConnectionError(errorWithCause('UND_ERR_BODY_TIMEOUT'))).toBe(
      false
    );
  });

  test('returns false for AbortError', () => {
    const err = new DOMException('The operation was aborted', 'AbortError');
    expect(isConnectionError(err)).toBe(false);
  });

  test('returns false for non-Error values', () => {
    expect(isConnectionError('network error')).toBe(false);
    expect(isConnectionError(null)).toBe(false);
    expect(isConnectionError(undefined)).toBe(false);
    expect(isConnectionError(42)).toBe(false);
  });

  test('returns false for generic Error', () => {
    expect(isConnectionError(new Error('something'))).toBe(false);
  });

  test('returns false for SyntaxError', () => {
    expect(isConnectionError(new SyntaxError('Unexpected token'))).toBe(false);
  });
});

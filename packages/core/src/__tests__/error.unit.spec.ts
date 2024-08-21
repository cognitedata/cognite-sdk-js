// Copyright 2020 Cognite AS
import { describe, expect, test } from 'vitest';

import { X_REQUEST_ID } from '../constants';
import { CogniteError, handleErrorResponse } from '../error';
import { HttpError } from '../httpClient/httpError';
import { createErrorResponse } from './testUtils';

const internalIdObject = { id: 4190022127342195 };
const externalIdObject = { externalId: 'abc' };
const event = {
  externalId: 'string',
  startTime: 0,
  endTime: 0,
  description: 'string',
  source: 'string',
};

describe('CogniteError', () => {
  test('without requestId', () => {
    const errorMessage = 'Abc';
    const status = 500;
    const error = new CogniteError(errorMessage, status);
    expect(error.status).toBe(status);
    expect(error.requestId).toBeUndefined();
    expect(() => {
      throw error;
    }).toThrowErrorMatchingInlineSnapshot('[Error: Abc | code: 500]');
  });

  test('with requestId', () => {
    const errorMessage = 'Abc';
    const status = 500;
    const requestId = 'def';
    const error = new CogniteError(errorMessage, status, requestId);
    expect(error.status).toBe(status);
    expect(error.requestId).toBe(requestId);
    expect(() => {
      throw error;
    }).toThrowErrorMatchingInlineSnapshot(
      '[Error: Abc | code: 500 | X-Request-ID: def]'
    );
  });

  test('extra field', () => {
    const errorMessage = 'Abc';
    const status = 500;
    const error = new CogniteError(errorMessage, status, undefined, {
      missing: [internalIdObject, externalIdObject],
      duplicated: [event],
      extra: 'Extra log information',
    });
    expect(() => {
      throw error;
    }).toThrowErrorMatchingSnapshot();
  });
});

describe('handleErrorResponse', () => {
  test('without requestId', () => {
    const httpError = new HttpError(500, createErrorResponse(500, 'abc'), {});
    expect(() => {
      handleErrorResponse(httpError);
    }).toThrowErrorMatchingInlineSnapshot('[Error: abc | code: 500]');
  });

  test('with requestId', () => {
    const httpError = new HttpError(500, createErrorResponse(500, 'abc'), {
      [X_REQUEST_ID]: 'def',
    });
    expect(() => {
      handleErrorResponse(httpError);
    }).toThrowErrorMatchingInlineSnapshot(
      '[Error: abc | code: 500 | X-Request-ID: def]'
    );
  });

  test('extra fields', () => {
    const status = 500;
    const message = 'abc';
    const xRequestId = 'def';
    const httpError = new HttpError(
      status,
      createErrorResponse(status, message, {
        missing: [internalIdObject, externalIdObject],
        duplicated: [event],
        extra: { extraErrorInformation: 'test' },
      }),
      { [X_REQUEST_ID]: xRequestId }
    );
    expect.assertions(6);
    expect(() => {
      handleErrorResponse(httpError);
    }).toThrowErrorMatchingSnapshot();

    try {
      handleErrorResponse(httpError);
    } catch (e) {
      if (!(e instanceof CogniteError)) {
        throw e;
      }
      expect(e.status).toBe(status);
      expect(e.requestId).toBe(xRequestId);
      expect(e.duplicated).toEqual([event]);
      expect((e.extra as Record<string, string>).extraErrorInformation).toBe(
        'test'
      );
      expect(e.missing).toEqual([internalIdObject, externalIdObject]);
    }
  });
});

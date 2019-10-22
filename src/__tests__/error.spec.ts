// Copyright 2019 Cognite AS

import { X_REQUEST_ID } from '../constants';
import { CogniteError, handleErrorResponse } from '../error';
import { CogniteMultiError } from '../multiError';
import { HttpError } from '../utils/http/httpError';
import { createErrorReponse } from './testUtils';

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
    }).toThrowErrorMatchingInlineSnapshot(`"Abc | code: 500"`);
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
      `"Abc | code: 500 | X-Request-ID: def"`
    );
  });

  test('extra field', () => {
    const errorMessage = 'Abc';
    const status = 500;
    const error = new CogniteError(errorMessage, status, undefined, {
      missing: [internalIdObject, externalIdObject],
      duplicated: [event],
    });
    expect(() => {
      throw error;
    }).toThrowErrorMatchingSnapshot();
  });
});

describe('handleErrorResponse', () => {
  test('without requestId', () => {
    const httpError = new HttpError(500, createErrorReponse(500, 'abc'), {});
    expect(() => {
      handleErrorResponse(httpError);
    }).toThrowErrorMatchingInlineSnapshot(`"abc | code: 500"`);
  });

  test('with requestId', () => {
    const httpError = new HttpError(500, createErrorReponse(500, 'abc'), {
      [X_REQUEST_ID]: 'def',
    });
    expect(() => {
      handleErrorResponse(httpError);
    }).toThrowErrorMatchingInlineSnapshot(
      `"abc | code: 500 | X-Request-ID: def"`
    );
  });

  test('extra fields', () => {
    const status = 500;
    const message = 'abc';
    const xRequestId = 'def';
    const httpError = new HttpError(
      status,
      createErrorReponse(status, message, {
        missing: [internalIdObject, externalIdObject],
        duplicated: [event],
      }),
      { [X_REQUEST_ID]: xRequestId }
    );

    expect(() => {
      handleErrorResponse(httpError);
    }).toThrowErrorMatchingSnapshot();

    try {
      handleErrorResponse(httpError);
    } catch (e) {
      expect(e.status).toBe(status);
      expect(e.requestId).toBe(xRequestId);
      expect(e.missing).toEqual([internalIdObject, externalIdObject]);
      expect(e.duplicated).toEqual([event]);
    }
  });
});

describe('Cognite multi error', () => {
  test('create with 2 fails and 1 success', () => {
    const errMsg = 'createAssets.arg0.items: size must be between 1 and 1000';
    const nestedErr = new CogniteError(errMsg, 400, 'r1', {
      missing: ['something'],
    });
    const nestedErr2 = new CogniteError(errMsg, 500, 'r2', {
      missing: ['more'],
      duplicated: ['this one'],
    });
    const err = new CogniteMultiError({
      succeded: [[2]],
      failed: [[0, 1]],
      errors: [nestedErr, nestedErr2],
      responses: [],
    });

    expect(err.succeded).toEqual([2]);
    expect(err.failed).toEqual([0, 1]);
    expect(err.statuses).toEqual([400, 500]);
    expect(err.status).toEqual(400);
    expect(err.requestId).toEqual('r1');
    expect(err.errors).toEqual([nestedErr, nestedErr2]);
    expect(err.message).toMatchSnapshot();
    expect(err.missing).toEqual(['something', 'more']);
    expect(err.duplicated).toEqual(['this one']);
    expect(err.requestIds).toEqual(['r1', 'r2']);
  });

  test('multierror serialises non-api errors', () => {
    const unknownError = new Error('unknown');

    const err = new CogniteMultiError({
      failed: [],
      errors: [unknownError],
      succeded: [],
      responses: [],
    });

    expect(err.message).toContain(`"message": "${unknownError.message}"`);
  });
});

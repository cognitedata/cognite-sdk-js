// Copyright 2019 Cognite AS

import { AxiosError } from 'axios';
import { CogniteError, handleErrorResponse } from '../error';
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
    const axiosError = {
      response: {
        status: 500,
        data: createErrorReponse(500, 'abc'),
      },
    } as AxiosError;

    expect(() => {
      handleErrorResponse(axiosError);
    }).toThrowErrorMatchingInlineSnapshot(`"abc | code: 500"`);
  });

  test('with requestId', () => {
    const axiosError = {
      response: {
        status: 500,
        data: createErrorReponse(500, 'abc'),
        headers: {
          'X-Request-Id': 'def',
        },
      },
    } as AxiosError;

    expect(() => {
      handleErrorResponse(axiosError);
    }).toThrowErrorMatchingInlineSnapshot(
      `"abc | code: 500 | X-Request-ID: def"`
    );
  });

  test('extra fields', () => {
    const status = 500;
    const message = 'abc';
    const xRequestId = 'def';
    const axiosError = {
      response: {
        status,
        data: createErrorReponse(status, message, {
          missing: [internalIdObject, externalIdObject],
          duplicated: [event],
        }),
        headers: {
          'X-Request-Id': xRequestId,
        },
      },
    } as AxiosError;

    expect(() => {
      handleErrorResponse(axiosError);
    }).toThrowErrorMatchingSnapshot();

    try {
      handleErrorResponse(axiosError);
    } catch (e) {
      expect(e.status).toBe(status);
      expect(e.requestId).toBe(xRequestId);
      expect(e.missing).toEqual([internalIdObject, externalIdObject]);
      expect(e.duplicated).toEqual([event]);
    }
  });
});

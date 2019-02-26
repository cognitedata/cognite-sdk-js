// Copyright 2019 Cognite AS

import { AxiosError } from 'axios';
import { CogniteError, handleErrorResponse } from '../error';

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
});

describe('handleErrorResponse', () => {
  test('without requestId', () => {
    const axiosError = {
      response: {
        status: 500,
        data: {
          error: {
            message: 'abc',
          },
        },
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
        data: {
          error: {
            message: 'abc',
          },
        },
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
});

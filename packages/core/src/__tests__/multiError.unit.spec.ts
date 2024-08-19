import { describe, expect, test } from 'vitest';
import { CogniteMultiError } from '../multiError';
import { CogniteError } from '../error';

describe('Cognite multi error', () => {
  test('create with 2 fails and 1 success', () => {
    const errMsg = 'createAssets.arg0.items: size must be between 1 and 1000';
    const nestedErr = new CogniteError(errMsg, 400, 'r1', {
      missing: [
        {
          id: 'something',
        },
      ],
    });
    const nestedErr2 = new CogniteError(errMsg, 500, 'r2', {
      missing: [
        {
          externalId: 'more',
        },
      ],
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
    expect(err.missing).toEqual([{ id: 'something' }, { externalId: 'more' }]);
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

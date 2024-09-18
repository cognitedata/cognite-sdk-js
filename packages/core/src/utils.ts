// Copyright 2020 Cognite AS

import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import { BASE_URL } from './constants';
import type { CogniteError } from './error';
import { CogniteMultiError, type MultiErrorRawSummary } from './multiError';

/** @hidden */
export type CogniteAPIVersion = 'v1' | 'playground';

/** @hidden */
export function getBaseUrl(baseUrl?: string) {
  return baseUrl || BASE_URL;
}

/** @hidden */
export const apiUrl = (apiVersion: CogniteAPIVersion = 'v1') =>
  `/api/${apiVersion}`;

/** @hidden */
export function projectUrl(
  project: string,
  apiVersion: CogniteAPIVersion = 'v1'
) {
  return `${apiUrl(apiVersion)}/projects/${encodeURIComponent(project)}`;
}

/** @hidden */
export function bearerString(token: string) {
  return `Bearer ${token}`;
}

function isBuffer(obj: unknown): boolean {
  type BufferConstructor = (() => void) & {
    isBuffer: (x: unknown) => boolean;
  };

  // Taken from:
  // https://github.com/feross/is-buffer/blob/ec4bf3415108e8971375e6717ad63dde752faebf/index.js#L8
  return (
    obj != null &&
    obj.constructor != null &&
    typeof (obj.constructor as BufferConstructor).isBuffer === 'function' &&
    (obj.constructor as BufferConstructor).isBuffer(obj)
  );
}

/** @hidden */
export function convertToTimestampToDateTime(timestamp: number): Date {
  return new Date(timestamp);
}

/** @hidden */
export function isJson(data: unknown) {
  return (
    (isArray(data) || isObject(data)) &&
    !isBuffer(data) &&
    !(data instanceof ArrayBuffer) &&
    !(data instanceof Date)
  );
}

/** @hidden */
export function sleepPromise(durationInMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationInMs);
  });
}

/** @hidden */
export function promiseCache<ReturnValue>(
  promiseFn: () => Promise<ReturnValue>
) {
  let unresolvedPromise: Promise<ReturnValue> | null = null;
  return () => {
    if (unresolvedPromise) {
      return unresolvedPromise;
    }
    unresolvedPromise = promiseFn().then((res) => {
      unresolvedPromise = null;
      return res;
    });
    return unresolvedPromise;
  };
}

/**
 * Resolves all Promises at once, even if some of them fail
 */
/** @hidden */
export async function promiseAllAtOnce<RequestType, ResponseType>(
  inputs: RequestType[],
  promiser: (input: RequestType) => Promise<ResponseType>
) {
  const failed: RequestType[] = [];
  const succeded: RequestType[] = [];
  const responses: ResponseType[] = [];
  const errors: (Error | CogniteError)[] = [];

  const promises = inputs.map(promiser);

  type SingleResult = {
    succeded?: RequestType;
    response?: ResponseType;
    failed?: RequestType;
    error?: Error | CogniteError;
  };

  const wrappedPromises: Promise<SingleResult>[] = promises.map(
    (promise, index) =>
      new Promise<SingleResult>((resolve) => {
        promise
          .then((result) => {
            resolve({ succeded: inputs[index], response: result });
          })
          .catch((error) => {
            resolve({ failed: inputs[index], error });
          });
      })
  );

  const results = await Promise.all(wrappedPromises);
  for (const res of results) {
    failed.push(...(res.failed ? [res.failed] : []));
    succeded.push(...(res.succeded ? [res.succeded] : []));
    responses.push(...(res.response ? [res.response] : []));
    errors.push(...(res.error ? [res.error] : []));
  }
  if (failed.length) {
    throw {
      succeded,
      responses,
      failed,
      errors,
    };
  }

  return responses;
}

/** @hidden */
export async function promiseAllWithData<RequestType, ResponseType>(
  inputs: RequestType[],
  promiser: (input: RequestType) => Promise<ResponseType>,
  runSequentially: boolean
) {
  try {
    if (runSequentially) {
      return await promiseEachInSequence(inputs, promiser);
    }
    return await promiseAllAtOnce(inputs, promiser);
  } catch (err) {
    throw new CogniteMultiError(
      err as MultiErrorRawSummary<RequestType, ResponseType>
    );
  }
}

/**
 * Resolves Promises sequentially
 */
/** @hidden */
export async function promiseEachInSequence<RequestType, ResponseType>(
  inputs: RequestType[],
  promiser: (input: RequestType) => Promise<ResponseType>
) {
  return inputs.reduce(async (previousPromise, input, index) => {
    const prevResult = await previousPromise;
    try {
      return prevResult.concat(await promiser(input));
    } catch (err) {
      throw {
        errors: [err],
        failed: inputs.slice(index),
        succeded: inputs.slice(0, index),
        responses: prevResult,
      };
    }
  }, Promise.resolve(new Array<ResponseType>()));
}

/** @hidden */
export function isSameProject(project1: string, project2: string): boolean {
  return project1.toLowerCase() === project2.toLowerCase();
}

/** @hidden */
export function applyIfApplicable<ArgumentType, ResultType>(
  args: ArgumentType,
  action?: (input: ArgumentType) => ResultType
) {
  if (action) {
    return action(args);
  }
  return args;
}

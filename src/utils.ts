// Copyright 2019 Cognite AS

import { cloneDeepWith } from 'lodash';
import { API_VERSION, BASE_URL } from './constants';

/** @hidden */
export function getBaseUrl(baseUrl?: string) {
  return baseUrl || BASE_URL;
}

export const apiUrl = () => `/api/${API_VERSION}`;

/** @hidden */
export function projectUrl(project: string) {
  return `${apiUrl()}/projects/${encodeURIComponent(project)}`;
}

/** @hidden */
export function isBrowser() {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
}

/** @hidden */
export function removeParameterFromUrl(url: string, parameter: string): string {
  return url
    .replace(new RegExp('[?&]' + parameter + '=[^&#]*(#.*)?$'), '$1')
    .replace(new RegExp('([?&])' + parameter + '=[^&]*&'), '$1');
}

/** @hidden */
export function convertToTimestampToDateTime(timestamp: number): Date {
  return new Date(timestamp);
}

/** @hidden */
export function sleepPromise(durationInMs: number) {
  return new Promise(resolve => {
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
    return (unresolvedPromise = promiseFn().then(res => {
      unresolvedPromise = null;
      return res;
    }));
  };
}

/** @hidden */
export function isSameProject(project1: string, project2: string): boolean {
  return project1.toLowerCase() === project2.toLowerCase();
}

export type CancelablePromise<T> = {
  cancel: () => void;
} & Promise<T>;
/** @hidden */
export function makePromiseCancelable<T>(
  promise: Promise<T>
): CancelablePromise<T> {
  let hasBeenCancelled = false;
  const cancelablePromise = new Promise<T>((resolve, reject) => {
    promise
      .then(res => {
        if (!hasBeenCancelled) {
          resolve(res);
        }
      })
      .catch(err => {
        if (!hasBeenCancelled) {
          reject(err);
        }
      });
  });
  (cancelablePromise as CancelablePromise<T>).cancel = () => {
    hasBeenCancelled = true;
  };
  return cancelablePromise as CancelablePromise<T>;
}

export function transformDateInRequest(data: any) {
  return cloneDeepWith(data, value => {
    if (value instanceof Date) {
      return value.getTime();
    }
  });
}

export function transformDateInResponse(data: any) {
  const dateKeys = [
    'createdTime',
    'lastUpdatedTime',
    'uploadedTime',
    'deletedTime',
    'timestamp',
  ];
  return cloneDeepWith(data, (value, key) => {
    if (dateKeys.indexOf('' + key) !== -1) {
      return new Date(value);
    }
  });
}

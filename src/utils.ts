// Copyright 2019 Cognite AS

import { API_VERSION, BASE_URL } from './constants';

/** @hidden */
export function getBaseUrl(baseUrl?: string) {
  return baseUrl || BASE_URL;
}

/** @hidden */
export function projectUrl(project: string) {
  return `/api/${API_VERSION}/projects/${encodeURIComponent(project)}`;
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

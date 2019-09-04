// Copyright 2019 Cognite AS

import { cloneDeepWith, isArray, isObject } from 'lodash';
import { isBuffer } from 'util';
import { API_VERSION, BASE_URL } from './constants';

/** @hidden */
export function getBaseUrl(baseUrl?: string) {
  return baseUrl || BASE_URL;
}

/** @hidden */
export const apiUrl = () => `/api/${API_VERSION}`;

/** @hidden */
export function projectUrl(project: string) {
  return `${apiUrl()}/projects/${encodeURIComponent(project)}`;
}

/** @hidden */
export function bearerString(token: string) {
  return `Bearer ${token}`;
}

/** @hidden */
export function isBrowser() {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
}

/** @hidden */
export function removeQueryParameterFromUrl(
  url: string,
  parameter: string
): string {
  return url
    .replace(new RegExp('[?&]' + parameter + '=[^&#]*(#.*)?$'), '$1')
    .replace(new RegExp('([?&])' + parameter + '=[^&]*&'), '$1');
}

/** @hidden */
export function convertToTimestampToDateTime(timestamp: number): Date {
  return new Date(timestamp);
}

/** @hidden */
export function isJson(data: any) {
  return (isArray(data) || isObject(data)) && !isBuffer(data);
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

/** @hidden */
export function transformDateInRequest<T>(data: T): T {
  return cloneDeepWith(data, value => {
    if (value instanceof Date) {
      return value.getTime();
    }
  });
}

/** @hidden */
export function transformDateInResponse<T>(data: T): T {
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

/** @hidden */
export function generatePopupWindow(url: string, name: string) {
  return window.open(
    url,
    name,
    // https://www.quackit.com/javascript/popup_windows.cfm
    'height=500,width=400,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes'
  );
}

/** @hidden */
export function createInvisibleIframe(
  url: string,
  name: string
): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.name = name;
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.border = 'none';
  iframe.src = url;
  return iframe;
}

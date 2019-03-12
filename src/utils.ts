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

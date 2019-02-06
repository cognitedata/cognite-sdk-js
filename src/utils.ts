// Copyright 2019 Cognite AS

import { API_VERSION } from './constants';

/** @hidden */
export function projectUrl(project: string) {
  return `/api/${API_VERSION}/projects/${encodeURIComponent(project)}`;
}

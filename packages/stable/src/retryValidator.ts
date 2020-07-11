// Copyright 2020 Cognite AS

import {
  createRetryValidator,
  EndpointList,
  RetryValidator,
} from '@cognite/sdk-core';
import { HttpMethod } from '@cognite/sdk-core';

const MAX_RETRY_ATTEMPTS = 5;

const ENDPOINTS_TO_RETRY: EndpointList = {
  [HttpMethod.Post]: [
    '/assets/list',
    '/assets/byids',
    '/assets/search',
    '/events/list',
    '/events/byids',
    '/events/search',
    '/files/list',
    '/files/byids',
    '/files/search',
    '/files/initupload',
    '/files/downloadlink',
    '/timeseries/byids',
    '/timeseries/search',
    '/timeseries/data',
    '/timeseries/data/list',
    '/timeseries/data/latest',
    '/timeseries/data/delete',
  ],
};

export const retryValidator: RetryValidator = createRetryValidator(
  ENDPOINTS_TO_RETRY,
  MAX_RETRY_ATTEMPTS
);

// Copyright 2020 Cognite AS

import { type EndpointList, createRetryValidator } from '@cognite/sdk-core';
import { HttpMethod } from '@cognite/sdk-core';

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
    '/timeseries/synthetic/query',
  ],
};

export const retryValidator = createRetryValidator(ENDPOINTS_TO_RETRY);

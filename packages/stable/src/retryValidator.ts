// Copyright 2020 Cognite AS

import { type EndpointList, createRetryValidator } from '@cognite/sdk-core';
import { HttpMethod } from '@cognite/sdk-core';

const ENDPOINTS_TO_RETRY: EndpointList = {
  [HttpMethod.Post]: [
    '/assets/byids',
    '/assets/list',
    '/assets/search',
    '/dataproducts/byids',
    '/events/byids',
    '/events/list',
    '/events/search',
    '/files/byids',
    '/files/downloadlink',
    '/files/initupload',
    '/files/list',
    '/files/search',
    '/models/statistics/spaces/byids',
    '/records/aggregate',
    '/records/delete',
    '/records/filter',
    '/records/sync',
    '/records/upsert',
    '/timeseries/byids',
    '/timeseries/data',
    '/timeseries/data/delete',
    '/timeseries/data/latest',
    '/timeseries/data/list',
    '/timeseries/search',
    '/timeseries/subscriptions/data/list',
    '/timeseries/synthetic/query',
  ],
};

export const retryValidator = createRetryValidator(ENDPOINTS_TO_RETRY);

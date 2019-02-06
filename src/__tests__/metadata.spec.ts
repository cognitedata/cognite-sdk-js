// Copyright 2019 Cognite AS

import { AxiosResponse } from 'axios';
import { MetadataMap } from '../metadata';

test('metadata', async () => {
  const map = new MetadataMap();
  const value = {};
  const response = { status: 200, headers: {} } as AxiosResponse;
  expect(map.addAndReturn(value, response)).toBe(value);
  const result = map.get(value);
  expect(result).not.toBeUndefined();
  expect(result!.status).toBe(response.status);
  expect(result!.headers).toBe(response.headers);
});

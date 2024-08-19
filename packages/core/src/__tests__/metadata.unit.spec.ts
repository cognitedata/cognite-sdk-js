// Copyright 2020 Cognite AS

import { expect, test } from 'vitest';
import { MetadataMap } from '../metadata';
import { HttpResponse } from '../httpClient/basicHttpClient';

test('metadata', async () => {
  const map = new MetadataMap();
  const value = {};
  const response: HttpResponse<any> = { data: null, status: 200, headers: {} };
  expect(map.addAndReturn(value, response)).toBe(value);
  const result = map.get(value);
  expect(result).not.toBeUndefined();
  expect(result!.status).toBe(response.status);
  expect(result!.headers).toBe(response.headers);
});

// Copyright 2019 Cognite AS

import { API_VERSION, BASE_URL } from '../constants';

test('BASE_URL', () => {
  expect(BASE_URL).toMatchInlineSnapshot(`"https://api.cognitedata.com"`);
});

test('API_VERSION', () => {
  expect(API_VERSION).toMatchInlineSnapshot(`"0.6"`);
});

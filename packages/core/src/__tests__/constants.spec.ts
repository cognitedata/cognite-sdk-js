// Copyright 2020 Cognite AS

import { BASE_URL } from '../constants';

test('BASE_URL', () => {
  expect(BASE_URL).toMatchInlineSnapshot(`"https://api.cognitedata.com"`);
});

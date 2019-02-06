// Copyright 2019 Cognite AS

import { projectUrl } from '../utils';

test('projectUrl', () => {
  expect(projectUrl('my-tenant')).toMatchInlineSnapshot(
    `"/api/0.6/projects/my-tenant"`
  );

  expect(projectUrl('my-special-tenønt')).toMatchInlineSnapshot(
    `"/api/0.6/projects/my-special-ten%C3%B8nt"`
  );
});

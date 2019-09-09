// Copyright 2019 Cognite AS

import { CogniteClient } from '../..';
import { BaseResource } from '../../resources/classes/baseResource';
import { setupLoggedInClient } from '../testUtils';

interface TestType {
  prop: string;
}

class TestClass extends BaseResource<TestType> {}

describe('base resourse class', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  test('to string & to json', () => {
    const resource = new TestClass(client, { prop: 'test' });
    const stringRes = JSON.stringify(resource);
    expect(typeof stringRes).toBe('string');
    expect(stringRes).toBe(resource.toString());
  });
});

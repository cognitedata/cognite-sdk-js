// Copyright 2024 Cognite AS

import { SpaceCreateDefinition } from 'stable/src/types';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('Spaces integration test', () => {
  let client: CogniteClient;
  const timestamp = Date.now();

  const spaceCreationDefinition: SpaceCreateDefinition = {
    space: `test_data_space_${timestamp}`,
    name: 'test_data_space',
    description: 'Instance space used for integration tests.',
  };
  const spaceCreation2Definition: SpaceCreateDefinition = {
    space: `test_data_space_2_${timestamp}`,
    name: 'test_data_space_2',
    description: 'Instance space used for integration tests_2',
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  it('should successfully upsert spaces', async () => {
    const createdSpaceResponse = await client.spaces.upsert([
      spaceCreationDefinition,
      spaceCreation2Definition,
    ]);

    expect(createdSpaceResponse.items).toHaveLength(2);
    expect(createdSpaceResponse.items[0].name).toEqual(
      spaceCreationDefinition.name
    );
    expect(createdSpaceResponse.items[0].space).toEqual(
      spaceCreationDefinition.space
    );
    expect(createdSpaceResponse.items[1].name).toEqual(
      spaceCreation2Definition.name
    );
    expect(createdSpaceResponse.items[1].space).toEqual(
      spaceCreation2Definition.space
    );
  });

  it('should successfully list spaces', async () => {
    const spaces = await client.spaces.list({ limit: 1000 });
    const space1 = spaces.items.find(
      (space) => space.space === spaceCreationDefinition.space
    );
    const space2 = spaces.items.find(
      (space) => space.space === spaceCreation2Definition.space
    );
    expect(space1).toBeDefined();
    expect(space2).toBeDefined();
  });

  it('should successfully list global spaces', async () => {
    const spaces = await client.spaces.list({ includeGlobal: true });
    const globalSpace = spaces.items.find((space) => space.isGlobal);
    console.log(spaces.items);
    console.log(globalSpace);
    expect(globalSpace).toBeDefined();
  });

  it('should successfully list spaces via cursor', async () => {
    const spaces = await client.spaces
      .list({ includeGlobal: true, limit: 1 })
      .autoPagingToArray({ limit: 2 });
    expect(spaces.length).toBeGreaterThanOrEqual(2);
  });

  it('should successfully retrieve spaces', async () => {
    const spaces = await client.spaces.retrieve([
      spaceCreationDefinition.space,
      spaceCreation2Definition.space,
    ]);
    expect(spaces.items.length).toBe(2);
    expect(spaces.items[0].name).toEqual(spaceCreationDefinition.name);
    expect(spaces.items[1].name).toEqual(spaceCreation2Definition.name);
  });

  it('should successfully delete spaces', async () => {
    const response = await client.spaces.delete([
      spaceCreationDefinition.space,
      spaceCreation2Definition.space,
    ]);
    expect(response.items).toHaveLength(2);

    const spaces = await client.spaces.list({ limit: 1000 });
    expect(
      spaces.items.find(
        (space) => space.space === spaceCreationDefinition.space
      )
    ).toBeUndefined();
    expect(
      spaces.items.find(
        (space) => space.space === spaceCreation2Definition.space
      )
    ).toBeUndefined();
  });
});

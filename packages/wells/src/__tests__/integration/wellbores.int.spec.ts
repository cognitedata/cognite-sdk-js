// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import CogniteClient from '../../client/cogniteClient';
import { SearchWellbores } from 'wells/src/client/model/Wellbore';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition(
  'CogniteClient setup in wellbores - integration test',
  () => {
    let client: CogniteClient;
    beforeAll(async () => {
      client = setupLoggedInClient();
    });

    test('standard filter - list all wellbores', async () => {
      const response = await client.wellbores.listAll();
      expect(response.length).toBe(5);
      response.forEach(element => {
        expect(element.name).toContain('Wellbore');
      });
    });

    test('custom filter - list all wellbores', async () => {
      const fn: SearchWellbores = async () => await client.wellbores.listAll();

      const response = await client.wellbores.listAll(fn);
      expect(response.length).toBe(5);
      response.forEach(element => {
        expect(element.name).toContain('Wellbore');
      });
    });

    test('standard filter - list immediate children wellbores', async () => {
      const wellId = 2278618537691581;
      const response = await client.wellbores.listChildren(wellId);
      response.forEach(element => {
        expect(element.parentId).toBe(wellId);
      });
    });

    test('custom filter - list immediate children wellbores ', async () => {
      const fn: SearchWellbores = async (args: number) =>
        await client.wellbores.listChildren(args);

      const wellId = 2278618537691581;
      const response = await client.wellbores.listChildren(wellId, fn);
      response.forEach(async element => {
        expect(element.parentId).toBe(wellId);
      });
    });

    test('standard filter - list all children wellbores', async () => {
      const rootId = 4438800495523058;
      const response = await client.wellbores.listByWellId(rootId);
      expect(response.length).toBe(5);
      response.forEach(element => {
        if (element.metadata) expect(element.metadata['type']).toBe('Wellbore');
      });
    });

    test('custom filter - list all children wellbores', async () => {
      const fn: SearchWellbores = async (args: number) =>
        await client.wellbores.listByWellId(args);

      const rootId = 4438800495523058;
      const response = await client.wellbores.listByWellId(rootId, fn);
      expect(response.length).toBe(5);
      response.forEach(element => {
        if (element.metadata) expect(element.metadata['type']).toBe('Wellbore');
      });
    });
  }
);

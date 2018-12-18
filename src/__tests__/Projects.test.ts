// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { instance, Project, Projects } from '../index';

let mock: MockAdapter;

beforeAll(() => {
  mock = new MockAdapter(instance);
});

afterAll(() => {
  mock.restore();
});

afterEach(() => {
  // cleaning up the mess left behind the previous test
  mock.reset();
});

const project: Project = {
  name: 'SDK is awesome tenant',
  urlName: 'abcæøå',
};

describe('Projects', () => {
  test('retrieve a project', async () => {
    const projectName = 'abcæøå';
    const reg = new RegExp(`/projects/${encodeURIComponent(projectName)}$`);
    mock.onGet(reg).reply(200, {
      data: {
        items: [project],
      },
    });
    const result = await Projects.retrieve(projectName);
    expect(result).toEqual(project);
  });

  test('update a project', async () => {
    const projectName = 'abcæøå';
    const reg = new RegExp(`/projects/${encodeURIComponent(projectName)}$`);
    mock
      .onPut(reg, {
        items: [project],
      })
      .reply(200, {
        data: {
          items: [project],
        },
      });
    const result = await Projects.update(projectName, project);
    expect(result).toEqual(project);
  });
});

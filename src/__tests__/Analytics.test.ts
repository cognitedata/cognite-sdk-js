// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { Analytics, instance } from '../index';

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

describe('Analytics', () => {
  test('launch pattern search job', async () => {
    const params = {
      timeSeriesDataSpec: [
        {
          aggregates: ['avg', 'sum'],
          timeSeries: [
            {
              name: 'myTimeSeries',
              aggregates: ['avg'],
              missingDataStrategy: 'ffill',
            },
          ],
          granularity: '1second',
          missingDataStrategy: 'ffill',
          start: '2d-ago',
          end: '1d-ago',
          label: 'super-awesome-label',
        },
      ],
      description: 'My pattern search',
      algorithm: 'SAX',
      arguments: {
        limit: 2,
      },
    };
    mock.onPost(/\/analytics\/patternsearch\/search$/, params).reply(200, {
      jobId: 12345,
    });
    const result = await Analytics.launchPatternSearch(params);
    expect(result).toBe(12345);
  });

  test('retrieve pattern search job', async () => {
    const jobInfo = {
      createdTime: 100,
      completedTime: 200,
      description: 'My pattern search',
      id: 12345,
      project: 'test-tenant',
      service: 'abc',
      status: 'DONE',
    };
    mock.onGet(/\/analytics\/jobs\/12345$/).reply(200, jobInfo);
    const result = await Analytics.retrievePatternSearchJobInfo(12345);
    expect(result).toEqual(jobInfo);
  });

  test('retrieve pattern search result', async () => {
    const jobResults = [
      {
        from: 123,
        to: 456,
        score: 3.1415,
      },
      {
        from: 678,
        to: 789,
        score: 2.71828,
      },
    ];
    mock.onGet(/\/analytics\/patternsearch\/12345$/).reply(200, {
      data: {
        items: jobResults,
      },
    });
    const result = await Analytics.retrievePatternSearchResult(12345);
    expect(result).toEqual(jobResults);
  });
});

// Copyright 2019 Cognite AS

import axios, { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { MetadataMap } from '../metadata';
import { generateListEndpoint } from '../standardMethods';
import { sleepPromise } from '../utils';

function numberGeneratorAPIEndpoint(config: AxiosRequestConfig) {
  const params = config.params || {};
  const cursor = Number(params.cursor);
  if (cursor > 10) {
    return [200, { items: [cursor] }];
  } else if (isNaN(cursor)) {
    return [200, { items: [0, 1], nextCursor: '2' }];
  } else {
    return [
      200,
      {
        items: [cursor, cursor + 1],
        nextCursor: `${cursor + 2}`,
      },
    ];
  }
}

describe('standard methods', () => {
  function createMockedListEndpoint() {
    const axiosInstance = axios.create();
    const listEndpoint = generateListEndpoint<any, number>(
      axiosInstance,
      '/',
      new MetadataMap(),
      false
    );
    const axiosMock = new MockAdapter(axiosInstance);
    axiosMock.onGet('/').reply(numberGeneratorAPIEndpoint);
    return listEndpoint;
  }

  describe('generateListEndpoint', () => {
    test('for-await', async () => {
      const listEndpoint = createMockedListEndpoint();
      const numbers = [];
      for await (const item of listEndpoint()) {
        numbers.push(item);
      }
      expect(numbers).toMatchSnapshot();
    });

    test('autoPagingToArray', async () => {
      const listEndpoint = createMockedListEndpoint();
      await expect(
        listEndpoint().autoPagingToArray({ limit: 1 })
      ).resolves.toMatchSnapshot();
      await expect(
        listEndpoint().autoPagingToArray({ limit: 3 })
      ).resolves.toMatchSnapshot();
      await expect(
        listEndpoint().autoPagingToArray({ limit: 100 })
      ).resolves.toMatchSnapshot();
    });

    test('authPagingForEach', async () => {
      const listEndpoint = createMockedListEndpoint();

      // sync handler
      {
        const numbers: number[] = [];
        await listEndpoint().autoPagingEach(item => {
          numbers.push(item);
          if (numbers.length >= 3) {
            return false;
          }
        });
        expect(numbers).toMatchSnapshot();
      }

      // async handler
      {
        const numbers: number[] = [];
        await listEndpoint().autoPagingEach(async item => {
          numbers.push(item);
          await sleepPromise(10);
          if (numbers.length >= 3) {
            return false;
          }
        });
        expect(numbers).toMatchSnapshot();
      }

      // returning explicit true
      {
        const numbers: number[] = [];
        await listEndpoint().autoPagingEach(async item => {
          numbers.push(item);
          return numbers.length < 3;
        });
        expect(numbers).toMatchSnapshot();
      }
    });
  });
});

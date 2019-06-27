// Copyright 2019 Cognite AS

import axios, { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { MetadataMap } from '../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateInsertEndpoint,
  generateListEndpoint,
  generateRetrieveEndpoint,
  generateUpdateEndpoint,
} from '../standardMethods';
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

function countChunks(axiosMock: MockAdapter, url: string) {
  const counterObject = { value: 0 };
  axiosMock.onPost(url).reply(config => {
    counterObject.value++;
    const { items: requestItems } = JSON.parse(config.data);
    const responseItems = requestItems.map((item: any) => ({
      ...item,
      id: Number(item.name),
    }));
    return [201, { items: responseItems }];
  });
  return counterObject;
}

function fillArray() {
  return new Array(2003).fill(null).map(index => ({
    id: index,
  }));
}

describe('standard methods', () => {
  const axiosInstance = axios.create();
  const axiosMock = new MockAdapter(axiosInstance);
  beforeEach(() => {
    axiosMock.reset();
  });

  describe('generateCreateEndpoint', () => {
    test('automatic chunking for create', async () => {
      const metadataMap = new MetadataMap();
      const object = await chunkingTester(
        axiosMock,
        metadataMap,
        'path',
        generateCreateEndpoint(axiosInstance, 'path', metadataMap)
      );
      expect(object.response.length).toBe(object.items.length);
    });
  });
  describe('generateRetrieveEndpoint', () => {
    test('automatic chunking for retrieve', async () => {
      const metadataMap = new MetadataMap();
      const object = await chunkingTester(
        axiosMock,
        metadataMap,
        'path/byids',
        generateRetrieveEndpoint(axiosInstance, 'path', metadataMap)
      );
      expect(object.response.length).toBe(object.items.length);
    });
  });
  describe('generateListEndpoint', () => {
    function createMockedListEndpoint() {
      const listEndpoint = generateListEndpoint<any, number>(
        axiosInstance,
        '/',
        new MetadataMap(),
        false
      );
      axiosMock.onGet('/').reply(numberGeneratorAPIEndpoint);
      return listEndpoint;
    }
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
  describe('generateDeleteEndpoint', () => {
    test('automatic chunking for delete', async () => {
      const metadataMap = new MetadataMap();
      const { response } = await chunkingTester(
        axiosMock,
        metadataMap,
        'path/delete',
        generateDeleteEndpoint(axiosInstance, '/path', metadataMap)
      );
      expect(response).toMatchObject({});
    });
  });
  describe('generateUpdateEndpoint', () => {
    test('automatic chunking for update', async () => {
      const metadataMap = new MetadataMap();
      const object = await chunkingTester(
        axiosMock,
        metadataMap,
        'path/update',
        generateUpdateEndpoint(axiosInstance, 'path', metadataMap)
      );
      expect(object.response.length).toBe(object.items.length);
    });
  });
  describe('generateInsertEndpoint', () => {
    test('automatic chunking for insert', async () => {
      const metadataMap = new MetadataMap();
      const { response } = await chunkingTester(
        axiosMock,
        metadataMap,
        'path',
        generateInsertEndpoint(axiosInstance, '/path', metadataMap)
      );
      expect(response).toMatchObject({});
    });
  });
});

async function chunkingTester(
  axiosMock: MockAdapter,
  metadataMap: MetadataMap,
  url: string,
  generateEndpointFunction: (items: unknown[]) => Promise<any>
) {
  const items = fillArray();
  const chunkCounter = countChunks(axiosMock, url);
  const response = await generateEndpointFunction(items);
  expect(chunkCounter.value).toBe(3);
  expect(metadataMap.get(response)).toBeDefined();
  return { items, response };
}

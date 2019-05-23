// Copyright 2019 Cognite AS

import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { addRetryToAxiosInstance } from '../retryRequests';

describe('retry requests', () => {
  const responseMock = jest.fn();
  let instance: AxiosInstance;
  let mock: MockAdapter;

  beforeEach(() => {
    instance = axios.create();
    mock = new MockAdapter(instance);
    responseMock.mockReset();
    mock.onGet('/retry').reply((config: any) => responseMock(config));
  });

  test('dont retry be default', async () => {
    responseMock.mockReturnValueOnce([500, {}]);
    await expect(
      instance.get('/retry')
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Request failed with status code 500"`
    );
    expect(responseMock).toHaveBeenCalledTimes(1);
  });

  test('retry', async () => {
    addRetryToAxiosInstance(instance);
    responseMock.mockReturnValueOnce([500, {}]);
    responseMock.mockReturnValueOnce([200, {}]);
    const { status } = await instance.get('/retry');
    expect(status).toBe(200);
    expect(responseMock).toHaveBeenCalledTimes(2);
  });

  test('dont retry POST', async () => {
    addRetryToAxiosInstance(instance);
    responseMock.mockReturnValueOnce([500, {}]);
    responseMock.mockReturnValueOnce([200, {}]);
    mock.onPost('/retry').reply((config: any) => responseMock(config));
    await expect(
      instance.post('/retry')
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Request failed with status code 500"`
    );
    expect(responseMock).toHaveBeenCalledTimes(1);
  });

  test('dont retry other status codes', async () => {
    addRetryToAxiosInstance(instance);
    responseMock.mockReturnValueOnce([430, {}]);
    responseMock.mockReturnValueOnce([200, {}]);
    await expect(
      instance.get('/retry')
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Request failed with status code 430"`
    );
    expect(responseMock).toHaveBeenCalledTimes(1);
  });
});

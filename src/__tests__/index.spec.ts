// Copyright 2019 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { CDP } from '../index';

jest.setTimeout(60000);

describe('CDP', () => {
  const apiKey = 'TEST_KEY';
  test('createClientWithApiKey', async () => {
    const cdp = await CDP.createClientWithApiKey({
      apiKey,
      project: 'cognitesdk-js',
    });
    console.log(cdp);

    // await cdp.assets.list({ limit: 20 }).autoPagingEach(async item => {
    //   console.log(item);
    //   return false;
    // });
  });

  test('getApiKeyInfo', async () => {
    // const info = await CDP.getApiKeyInfo(API_KEY);
    // console.log(info);
  });
});

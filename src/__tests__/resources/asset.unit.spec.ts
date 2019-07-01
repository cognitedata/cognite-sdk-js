// Copyright 2019 Cognite AS

import axios, { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { POPUP, REDIRECT } from '../cogniteClient';
import * as Login from '../resources/login';
import { sleepPromise } from '../utils';
import { apiKey, authTokens, project, setupClient } from './testUtils';

describe('Asset class', () => {
  const axiosInstance = axios.create();
  const axiosMock = new MockAdapter(axiosInstance);
  beforeEach(() => {
    axiosMock.reset();
  });
  describe('Create new Asset', () => {
    test('test', () => {});
  });
});

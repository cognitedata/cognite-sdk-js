// Copyright 2019 Cognite AS

import {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { sleepPromise } from './utils';

/** @hidden */
export interface RetryConfig {
  numRetries: number;
  retryDelay: number;
  instance: AxiosInstance;
  shouldRetry: (err: AxiosError) => boolean;
  currentRetryAttempt?: number;
  isSafeToRetry?: boolean;
}

// name borrowed from retry-axios package
/** @hidden */
export type RaxConfig = {
  raxConfig: RetryConfig;
} & AxiosRequestConfig;

function attach(instance: AxiosInstance) {
  const onFulfilled = (res: AxiosResponse) => res;
  const onError = async (err: AxiosError) => {
    const config = (err.config as RaxConfig).raxConfig || {};
    config.currentRetryAttempt = config.currentRetryAttempt || 0;
    (err.config as RaxConfig).raxConfig = config;

    if (!config.shouldRetry(err)) {
      return Promise.reject(err);
    }
    // Calculate time to wait with exponential backoff.
    // Formula: (2^c - 1 / 2) * 1000
    const delay = ((Math.pow(2, config.currentRetryAttempt) - 1) / 2) * 1000;
    (err.config as RaxConfig).raxConfig.currentRetryAttempt! += 1;
    await sleepPromise(delay);
    return config.instance.request(err.config);
  };
  return instance.interceptors.response.use(onFulfilled, onError);
}

const httpMethodsToRetry = ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT'];
const statusCodesToRetry = [[100, 199], [429, 429], [500, 599]];

/** @hidden */
export function addRetryToAxiosInstance(instance: AxiosInstance) {
  // config for retry-axios package
  (instance.defaults as RaxConfig).raxConfig = {
    instance,
    retryDelay: 250,
    numRetries: 5,
    shouldRetry: (err: AxiosError) => {
      const config = err.config as RaxConfig;
      const {
        currentRetryAttempt,
        numRetries,
        isSafeToRetry,
      } = config.raxConfig;

      if (currentRetryAttempt! >= numRetries) {
        return false;
      }

      if (!config.method) {
        return true;
      }

      const httpMethod = config.method.toUpperCase();
      if (!isSafeToRetry && httpMethodsToRetry.indexOf(httpMethod) === -1) {
        return false;
      }

      if (!err.response) {
        return false;
      }

      const responseStatusCode = err.response.status;
      let isCodeInValidRange = false;
      statusCodesToRetry.forEach(([start, end]: any) => {
        if (responseStatusCode >= start && responseStatusCode <= end) {
          isCodeInValidRange = true;
        }
      });

      return isCodeInValidRange;
    },
  };
  attach(instance);
}

/** @hidden */
export function makeRequestSafeToRetry(config: AxiosRequestConfig) {
  const raxConfig = (config as RaxConfig).raxConfig || {};
  raxConfig.isSafeToRetry = true;
  (config as RaxConfig).raxConfig = raxConfig;
}

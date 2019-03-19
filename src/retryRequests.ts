// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { attach } from 'retry-axios';

const httpMethodsToRetry = ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT'];
const statusCodesToRetry = [[100, 199], [429, 429], [500, 599]];

/** @hidden */
export function addRetryToAxiosInstance(instance: AxiosInstance) {
  // config for retry-axios package
  (instance.defaults as any).raxConfig = {
    instance,
    retryDelay: 250,
    retry: 3,
    shouldRetry: (err: any) => {
      const { config } = err;

      const httpMethod = config.method.toUpperCase();
      if (httpMethodsToRetry.indexOf(httpMethod) === -1) {
        return false;
      }

      const responseStatusCode = err.response.status;
      let isCodeInValidRange = false;
      statusCodesToRetry.forEach(([start, end]: any) => {
        if (responseStatusCode >= start && responseStatusCode <= end) {
          isCodeInValidRange = true;
        }
      });
      if (!isCodeInValidRange) {
        return false;
      }

      const { currentRetryAttempt, retry } = config.raxConfig;
      return currentRetryAttempt < retry;
    },
  };
  attach(instance);
}

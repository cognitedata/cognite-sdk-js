// Copyright 2020 Cognite AS
import { sleepPromise } from '../utils';
import { BasicHttpClient, HttpRequest, HttpResponse } from './basicHttpClient';
import { RetryValidator } from './retryValidator';

export class RetryableHttpClient extends BasicHttpClient {
  private static calculateRetryDelayInMs(retryCount: number) {
    const INITIAL_RETRY_DELAY_IN_MS = 250;
    return (
      INITIAL_RETRY_DELAY_IN_MS + ((Math.pow(2, retryCount) - 1) / 2) * 1000
    );
  }

  constructor(baseUrl: string, private retryValidator: RetryValidator) {
    super(baseUrl);
  }

  protected async rawRequest<ResponseType>(
    request: HttpRequest
  ): Promise<HttpResponse<ResponseType>> {
    let retryCount = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const response = await super.rawRequest<ResponseType>(request);
      const shouldRetry = this.retryValidator(request, response, retryCount);
      if (!shouldRetry) {
        return response;
      }
      const delayInMs = RetryableHttpClient.calculateRetryDelayInMs(retryCount);
      await sleepPromise(delayInMs);
      retryCount++;
    }
  }
}

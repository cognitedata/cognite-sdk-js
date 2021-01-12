import {
  HttpError,
  RetryValidator,
  RetryableHttpClient,
} from '@cognite/sdk-core';

export class BasicRetryableHttpClient extends RetryableHttpClient {
  constructor(baseUrl: string, retryValidator: RetryValidator) {
    super(baseUrl, retryValidator);
  }

  private response401Handler: ResponseHandlerOn401 = (_, __, reject) =>
    reject();

  public set401ResponseHandler(handler: ResponseHandlerOn401) {
    this.response401Handler = handler;
    console.log(this.response401Handler);
  }
}

type ResponseHandlerOn401 = (
  err: HttpError,
  retry: () => void,
  reject: () => void
) => void;

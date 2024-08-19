// Copyright 2020 Cognite AS
import * as Constants from './constants';
import * as GraphUtils from './graphUtils';
import * as TestUtils from './__tests__/testUtils';

export * from './types';

export { CogniteAuthentication } from './authFlows/legacy';
export { ADFS } from './authFlows/adfs';

export { MetadataMap } from './metadata';
export { BaseResourceAPI } from './baseResourceApi';
export { default as BaseCogniteClient } from './baseCogniteClient';
export { default as DateParser } from './dateParser';
export * from './baseCogniteClient';

export { BasicHttpClient } from './httpClient/basicHttpClient';
export { RetryableHttpClient } from './httpClient/retryableHttpClient';
export { CDFHttpClient } from './httpClient/cdfHttpClient';
export { CogniteError } from './error';
export { CogniteMultiError } from './multiError';
export { CogniteLoginError } from './loginError';
export { HttpError } from './httpClient/httpError';
export {
  HttpResponse,
  HttpResponseType,
  HttpQueryParams,
  HttpRequestOptions,
  HttpMethod,
} from './httpClient/basicHttpClient';
export { HttpHeaders } from './httpClient/httpHeaders';
export {
  createUniversalRetryValidator,
  createRetryValidator,
  EndpointList,
  RetryValidator,
} from './httpClient/retryValidator';
export {
  POPUP,
  REDIRECT,
  getIdInfo,
  AuthenticateParams,
  IdInfo,
  OnAuthenticateLoginObject,
} from './authFlows/legacy';
export {
  AuthorizeOptions,
  AuthorizeParams,
  AuthTokens,
  loginPopupHandler,
  getLogoutUrl,
  isLoginPopupWindow,
} from './loginUtils';
export { RevertableArraySorter } from './revertableArraySorter';
export {
  sleepPromise,
  apiUrl,
  promiseAllAtOnce,
  promiseAllWithData,
  promiseEachInSequence,
} from './utils';

export { TestUtils, Constants, GraphUtils };

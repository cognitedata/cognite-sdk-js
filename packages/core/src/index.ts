// Copyright 2020 Cognite AS
import * as Constants from './constants';
import * as GraphUtils from './graphUtils';

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
export { HttpResponseType } from './httpClient/basicHttpClient';
export type {
  HttpResponse,
  HttpQueryParams,
  HttpRequestOptions,
} from './httpClient/basicHttpClient';
export { HttpMethod } from './httpClient/basicHttpClient';
export type { HttpHeaders } from './httpClient/httpHeaders';
export {
  createUniversalRetryValidator,
  createRetryValidator,
} from './httpClient/retryValidator';
export type { EndpointList, RetryValidator } from './httpClient/retryValidator';
export { POPUP, REDIRECT, getIdInfo } from './authFlows/legacy';
export type {
  AuthenticateParams,
  IdInfo,
  OnAuthenticateLoginObject,
} from './authFlows/legacy';
export {
  loginPopupHandler,
  getLogoutUrl,
  isLoginPopupWindow,
} from './loginUtils';
export type {
  AuthorizeOptions,
  AuthorizeParams,
  AuthTokens,
} from './loginUtils';
export { RevertableArraySorter } from './revertableArraySorter';
export {
  sleepPromise,
  apiUrl,
  promiseAllAtOnce,
  promiseAllWithData,
  promiseEachInSequence,
} from './utils';

export { Constants, GraphUtils };

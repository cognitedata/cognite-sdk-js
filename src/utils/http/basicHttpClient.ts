// Copyright 2019 Cognite AS

import { isJson } from '@/utils';
import fetch, { Response } from 'cross-fetch';
import { stringify } from 'query-string';
import * as Url from 'url';
import { HttpError } from './httpError';

export class BasicHttpClient {
  private static validateStatusCode(status: number) {
    return status >= 200 && status < 300;
  }
  private static throwCustomErrorResponse<T>(response: HttpResponse<T>) {
    throw new HttpError(response.status, response.data, response.headers);
  }

  private static jsonResponseHandler<ResponseType>(
    res: Response
  ): Promise<ResponseType> {
    return res.json() as Promise<ResponseType>;
  }

  private static textResponseHandler<ResponseType>(
    res: Response
  ): Promise<ResponseType> {
    return (res.text() as unknown) as Promise<ResponseType>;
  }

  private static arrayBufferResponseHandler<ResponseType>(
    res: Response
  ): Promise<ResponseType> {
    return (res.blob().then(blob => new Response(blob).arrayBuffer()) as unknown) as Promise<ResponseType>;
  }

  private static getResponseHandler<ResponseType>(
    responseType?: HttpResponseType
  ): ResponseHandler<ResponseType> {
    switch (responseType) {
      case HttpResponseType.ArrayBuffer:
        return BasicHttpClient.arrayBufferResponseHandler;
      case HttpResponseType.Text:
        return BasicHttpClient.textResponseHandler;
      default:
        return BasicHttpClient.jsonResponseHandler;
    }
  }

  private static convertFetchHeaders(fetchHeaders: Headers) {
    const headers: HttpHeaders = {};
    fetchHeaders.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  private static transformRequestBody(data: any) {
    const isJSONStringifyable = isJson(data);
    if (isJSONStringifyable) {
      return JSON.stringify(data, null, 2);
    }
    return data;
  }

  private defaultHeaders: HttpHeaders = {};

  constructor(protected baseUrl: string) {}

  public setDefaultHeader(name: string, value: string) {
    this.defaultHeaders[name] = value;
    return this;
  }

  public setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public getBaseUrl() {
    return this.baseUrl;
  }

  public get<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Get,
    });
  }

  // TODO: responseType -> factory pattern
  public post<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Post,
    });
  }

  public put<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Put,
    });
  }

  public delete<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Delete,
    });
  }

  protected async preRequest(request: HttpRequest): Promise<HttpRequest> {
    const populatedHeaders = this.populateDefaultHeaders(request.headers);
    return {
      ...request,
      headers: populatedHeaders,
    };
  }

  protected async postRequest<T>(
    response: HttpResponse<T>,
    _: HttpRequest
  ): Promise<HttpResponse<T>> {
    const requestIsOk = BasicHttpClient.validateStatusCode(response.status);
    if (!requestIsOk) {
      BasicHttpClient.throwCustomErrorResponse(response);
    }
    return response;
  }

  protected populateDefaultHeaders(headers: HttpHeaders = {}) {
    return {
      ...this.defaultHeaders,
      ...headers,
    };
  }

  protected async rawRequest<ResponseType>(
    request: HttpRequest
  ): Promise<HttpResponse<ResponseType>> {
    const url = this.constructUrl(request.path, request.params);
    const headers: HttpHeaders = {
      Accept: 'application/json',
      ...request.headers,
    };
    let body = request.data;
    if (isJson(body)) {
      body = BasicHttpClient.transformRequestBody(body);
      headers['Content-Type'] = 'application/json';
    } 
    const res = await fetch(url, {
      body,
      method: request.method,
      headers,
    });
    const responseHandler = BasicHttpClient.getResponseHandler<ResponseType>(
      request.responseType
    );
    const data = await responseHandler(res);
    return {
      headers: BasicHttpClient.convertFetchHeaders(res.headers),
      status: res.status,
      data,
    };
  }

  protected async request<ResponseType>(request: HttpRequest) {
    const mutatedRequest = await this.preRequest(request);
    const rawResponse = await this.rawRequest<ResponseType>(mutatedRequest);
    const response = await this.postRequest(rawResponse, request);
    return response;
  }

  private constructUrl(path: string, params: HttpQueryParams = {}) {
    let url = path;
    const hasQueryParams = Object.keys(params).length > 0;
    if (hasQueryParams) {
      url += `?${stringify(params)}`;
    }
    return Url.resolve(this.baseUrl, url);
  }
}

export interface HttpRequest extends HttpRequestOptions {
  path: string;
  method: HttpMethod;
}

export interface HttpRequestOptions {
  data?: any;
  params?: HttpQueryParams;
  headers?: HttpHeaders;
  responseType?: HttpResponseType;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: HttpHeaders;
}

export enum HttpMethod {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Delete = 'delete',
}

export enum HttpResponseType {
  Json = 'json',
  ArrayBuffer = 'arraybuffer',
  Text = 'text',
}

export interface HttpQueryParams {
  [key: string]: any;
}

export interface HttpHeaders {
  [key: string]: string;
}

type ResponseHandler<ResponseType> = (res: Response) => Promise<ResponseType>;

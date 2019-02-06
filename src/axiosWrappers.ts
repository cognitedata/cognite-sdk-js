// Copyright 2019 Cognite AS

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BASE_URL } from './constants';
import { handleErrorResponse } from './error';
import { addRetryToAxiosInstance } from './retryRequests';
import { CogniteResponse } from './types/types';

/** @hidden */
export function generateAxiosInstance(baseUrl?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: baseUrl || BASE_URL,
    headers: {},
  });
  addRetryToAxiosInstance(instance);
  return instance;
}

async function rawRequest(
  axiosInstance: AxiosInstance,
  verb: 'get' | 'post' | 'put' | 'delete',
  path: string,
  reqOpt: AxiosRequestConfig = {}
): Promise<any> {
  return axiosInstance({
    url: path,
    method: verb,
    ...reqOpt,
  }).catch(handleErrorResponse);
}

/** @hidden */
export async function rawGet<T>(
  axiosInstance: AxiosInstance,
  path: string,
  reqOpt: AxiosRequestConfig = {}
): Promise<AxiosResponse<CogniteResponse<T>>> {
  return rawRequest(axiosInstance, 'get', path, reqOpt);
}

/** @hidden */
export async function rawPost<T>(
  axiosInstance: AxiosInstance,
  path: string,
  reqOpt: AxiosRequestConfig = {}
): Promise<AxiosResponse<CogniteResponse<T>>> {
  return rawRequest(axiosInstance, 'post', path, reqOpt);
}

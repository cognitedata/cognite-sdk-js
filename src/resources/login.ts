// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { rawGet } from '../axiosWrappers';

export interface ApiKeyInfo {
  loggedIn: boolean;
  project: string;
  user: string;
}

/** @hidden */
export async function getApiKeyInfo(
  axiosInstance: AxiosInstance,
  apiKey: string
): Promise<ApiKeyInfo> {
  const response = await rawGet<any>(axiosInstance, '/login/status', {
    headers: { 'api-key': apiKey },
  });
  const { user, loggedIn, project } = response.data.data;
  return {
    user,
    loggedIn,
    project,
  };
}

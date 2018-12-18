// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, projectUrl, rawGet, rawPut } from './core';

export interface Project {
  name: string;
  urlName: string;
  defaultGroupId?: number;
  authentication?: {
    type?: string;
    protocol?: string;
    azureADConfiguration?: {
      appId?: string;
      appSecret?: string;
      tenantId?: string;
      appResourceId?: string;
    };
    validDomains?: string[];
    oAuth2Configuration?: {
      loginUrl?: string;
      logoutUrl?: string;
      tokenUrl?: string;
      clientId?: string;
      clientSecret?: string;
    };
  };
}

interface ProjectDataWithCursor {
  previousCursor?: string;
  nextCursor?: string;
  items: Project[];
}

interface ProjectDataWithCursorResponse {
  data: ProjectDataWithCursor;
}

export class Projects {
  public static async retrieve(projectName: string): Promise<Project> {
    const url = `${apiUrl(0.5)}/${projectUrl(projectName)}`;
    const response = (await rawGet(url)) as AxiosResponse<
      ProjectDataWithCursorResponse
    >;
    return response.data.data.items[0];
  }

  public static async update(
    projectName: string,
    project: Project
  ): Promise<Project> {
    const url = `${apiUrl(0.5)}/${projectUrl(projectName)}`;
    const body = {
      items: [project],
    };
    const response = (await rawPut(url, { data: body })) as AxiosResponse<
      ProjectDataWithCursorResponse
    >;
    return response.data.data.items[0];
  }
}

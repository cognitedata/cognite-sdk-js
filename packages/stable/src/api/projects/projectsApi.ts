// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { ProjectResponse } from '../../types';

export class ProjectsAPI extends BaseResourceAPI<unknown> {
  /**
   * [Retrieve a project](https://doc.cognitedata.com/api/v1/#operation/getProject)
   *
   * ```js
   * const projectInfo = await client.projects.retrieve('publicdata');
   * ```
   */
  public retrieve = async (projectName: string): Promise<ProjectResponse> => {
    const path = this.encodeUrl(projectName);
    const response = await this.get<ProjectResponse>(path);
    return this.addToMapAndReturn(response.data, response);
  };

  private encodeUrl(projectName: string) {
    return this.url(`projects/${encodeURIComponent(projectName)}`);
  }
}

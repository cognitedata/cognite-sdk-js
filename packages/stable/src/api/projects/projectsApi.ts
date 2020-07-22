// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import { ProjectResponse, ProjectUpdate } from '../../types';

export class ProjectsAPI extends BaseResourceAPI<any> {
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

  /**
   * [Update a project](https://doc.cognitedata.com/api/v1/#operation/putProject)
   *
   * ```js
   * await client.projects.update('new-project-name', {
   *   name: 'New project display name',
   *   defaultGroupId: 123,
   * });
   * ```
   */
  public update = async (
    projectName: string,
    replacement: ProjectUpdate
  ): Promise<ProjectResponse> => {
    const path = this.encodeUrl(projectName);
    const response = await this.put<ProjectResponse>(path, {
      data: replacement,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  private encodeUrl(projectName: string) {
    return this.url(`projects/${encodeURIComponent(projectName)}`);
  }
}

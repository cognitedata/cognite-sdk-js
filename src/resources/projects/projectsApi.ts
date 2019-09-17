// Copyright 2019 Cognite AS

import { BaseResourceAPI } from '../../resources/baseResourceApi';
import { ProjectResponse, ProjectUpdate } from '../../types/types';

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
    const response = await this.httpClient.get<ProjectResponse>(path);
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
    const response = await this.httpClient.put<ProjectResponse>(path, {
      data: replacement,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  private encodeUrl(projectName: string) {
    return this.url(`projects/${encodeURIComponent(projectName)}`);
  }
}

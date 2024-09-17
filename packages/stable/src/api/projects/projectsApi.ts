// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  PartialProjectUpdate,
  ProjectResponse,
  ProjectUpdate,
} from '../../types';

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

  /**
   * [Update a project](https://doc.cognitedata.com/api/v1/#operation/putProject)
   *
   * ```js
   * await client.projects.update('new-project-name', {
   *   name: 'New project display name',
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

  /**
   * [Partial update a project](https://docs.cognite.com/api/v1/#operation/updateProject)
   *
   * ```js
   * await client.projects.updateProject('new-project-name', {
   *   update: {
   *     name: {
   *       set: 'New project display name',
   *     }
   *   }
   * })
   * ```
   */
  public updateProject = async (
    projectName: string,
    replacement: PartialProjectUpdate
  ): Promise<ProjectResponse> => {
    const path = `${this.encodeUrl(projectName)}/update`;
    const response = await this.post<ProjectResponse>(path, {
      data: replacement,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  private encodeUrl(projectName: string) {
    return this.url(`projects/${encodeURIComponent(projectName)}`);
  }
}

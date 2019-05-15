// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../metadata';
import {
  generateRetrieveSingleEndpoint,
  generateSingleReplaceEndpoint,
} from '../standardMethods';
import { ProjectResponse, ProjectUpdate } from '../types/types';
import { apiUrl, projectUrl } from '../utils';

export interface ProjectsAPI {
  /**
   * [Retrieve a project](https://doc.cognitedata.com/api/v1/#tag/Projects)
   *
   * ```js
   * const projectInfo = await client.projects.retrieve('publicdata');
   * ```
   */
  retrieve: (projectName: string) => Promise<ProjectResponse>;

  /**
   * [Update a project](https://doc.cognitedata.com/api/v1/#operation/putProject)
   *
   * ```js
   * await client.projects.update({
   *   name: 'New project display name',
   *   defaultGroupId: 123,
   * });
   */
  update: (
    urlName: string,
    replacement: ProjectUpdate
  ) => Promise<ProjectResponse>;
}

/** @hidden */
export function generateProjectObject(
  instance: AxiosInstance,
  map: MetadataMap
): ProjectsAPI {
  const path = apiUrl() + '/projects';
  return {
    retrieve: generateRetrieveSingleEndpoint(instance, path, map),
    update: (urlName, replacement) => {
      return generateSingleReplaceEndpoint<ProjectUpdate, ProjectResponse>(
        instance,
        projectUrl(urlName),
        map
      )(replacement);
    },
  };
}

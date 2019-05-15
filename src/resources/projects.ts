// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../metadata';
import { generateRetrieveSingleEndpoint } from '../standardMethods';
import { ProjectResponse } from '../types/types';
import { apiUrl } from '../utils';

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
  update: () => void;
  // update: (updates: ProjectUpdate[]) => Promise<ProjectResponse>;
}

/** @hidden */
export function generateProjectObject(
  instance: AxiosInstance,
  map: MetadataMap
): ProjectsAPI {
  const path = apiUrl() + '/projects';
  return {
    retrieve: generateRetrieveSingleEndpoint(instance, path, map),
    update: () => {
      // https://github.com/cognitedata/service-contracts/issues/227
      throw Error('Not implemented');
    },
  };
}

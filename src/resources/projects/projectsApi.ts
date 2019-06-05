// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../../metadata';
import {
  generateRetrieveSingleEndpoint,
  generateSingleReplaceEndpoint,
} from '../../standardMethods';
import { InlineResponse2003, ProjectObject } from '../../types/types';
import { apiUrl, projectUrl } from '../../utils';

export class ProjectsAPI {
  /**
   * [Retrieve a project](https://doc.cognitedata.com/api/v1/#tag/Projects)
   *
   * ```js
   * const projectInfo = await client.projects.retrieve('publicdata');
   * ```
   */
  public retrieve: ProjectsRetrieveEndpoint;
  private instance: AxiosInstance;
  private map: MetadataMap;

  /** @hidden */
  constructor(instance: AxiosInstance, map: MetadataMap) {
    const path = apiUrl() + '/projects';
    this.instance = instance;
    this.map = map;
    this.retrieve = generateRetrieveSingleEndpoint(instance, path, map);
  }

  /**
   * [Update a project](https://doc.cognitedata.com/api/v1/#operation/putProject)
   *
   * ```js
   * await client.projects.update({
   *   name: 'New project display name',
   *   defaultGroupId: 123,
   * });
   * ```
   */
  public update: ProjectsUpdateEndpoint = (urlName, replacement) => {
    return generateSingleReplaceEndpoint<ProjectObject, InlineResponse2003>(
      this.instance,
      projectUrl(urlName),
      this.map
    )(replacement);
  };
}

export type ProjectsRetrieveEndpoint = (
  projectName: string
) => Promise<InlineResponse2003>;

export type ProjectsUpdateEndpoint = (
  urlName: string,
  replacement: ProjectObject
) => Promise<InlineResponse2003>;

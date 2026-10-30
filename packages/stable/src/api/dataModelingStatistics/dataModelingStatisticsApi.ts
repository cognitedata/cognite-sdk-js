// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  ListOfSpaceIdsRequest,
  ProjectStatistics,
  SpaceStatisticsResponseList,
} from './types.gen';

export class DataModelingStatisticsAPI extends BaseResourceAPI<ProjectStatistics> {
  /**
   * [Retrieve project-wide statistics and limits](https://api-docs.cognite.com/20230101/tag/Statistics/operation/getStatistics)
   *
   * Returns usage and limits for data modeling resources across the project.
   *
   * ```js
   * const statistics = await client.dataModelingStatistics.project();
   * console.log(statistics.instances.instances, statistics.instances.instancesLimit);
   * ```
   */
  public project = async (): Promise<ProjectStatistics> => {
    const response = await this.get<ProjectStatistics>(this.url());
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve statistics by space](https://api-docs.cognite.com/20230101/tag/Statistics/operation/getSpaceStatistics)
   *
   * Returns data modeling statistics for every space in the project.
   *
   * ```js
   * const { items } = await client.dataModelingStatistics.listSpaces();
   * ```
   */
  public listSpaces = async (): Promise<SpaceStatisticsResponseList> => {
    const response = await this.get<SpaceStatisticsResponseList>(
      this.url('spaces')
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve statistics by space for specific space-ids](https://api-docs.cognite.com/20230101/tag/Statistics/operation/getSpaceStatisticsByIds)
   *
   * Returns data modeling statistics for the given spaces.
   *
   * ```js
   * const { items } = await client.dataModelingStatistics.retrieveSpaces(['my_space']);
   * ```
   */
  public retrieveSpaces = async (
    spaces: string[]
  ): Promise<SpaceStatisticsResponseList> => {
    const data: ListOfSpaceIdsRequest = {
      items: spaces.map((space) => ({ space })),
    };
    const response = await this.post<SpaceStatisticsResponseList>(
      this.url('spaces/byids'),
      { data }
    );
    return this.addToMapAndReturn(response.data, response);
  };
}

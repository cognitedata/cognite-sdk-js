// Copyright 2023 Cognite AS

import { BaseResourceAPI, type IdEither } from '@cognite/sdk-core';
import type {
  MonitoringTask,
  MonitoringTaskCreate,
  MonitoringTaskFilterQuery,
} from '../../types';

export class MonitoringTasksAPI extends BaseResourceAPI<MonitoringTask> {
  public create = async (items: MonitoringTaskCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: MonitoringTaskFilterQuery) => {
    return this.listEndpoint<MonitoringTaskFilterQuery>(
      this.callListEndpointWithPost,
      filter,
    );
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };

  public upsert = async (items: MonitoringTaskCreate[]) => {
    return this.upsertEndpoint(items);
  };
}

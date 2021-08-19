// Copyright 2021 Cognite AS

import { ItemsResponse } from '@cognite/sdk';
import { BaseResourceAPI, CogniteInternalId } from '@cognite/sdk-core';
import {
  FunctionSchedule,
  FunctionScheduleCreate,
  FunctionSchedulesFilter,
} from '../../types';

export class FunctionSchedules extends BaseResourceAPI<FunctionSchedule> {
  public retrieve = (ids: CogniteInternalId[], ignoreUnknownIds?: boolean) =>
    this.retrieveEndpoint(ids.map(id => ({ id })), {
      params: ignoreUnknownIds,
    });

  public list = async (filter?: FunctionSchedulesFilter, limit?: number) => {
    const response = await this.post<ItemsResponse<Function>>(
      this.listPostUrl,
      {
        data: { filter, limit },
      }
    );
    return response.data;
  };

  public create = async (items: FunctionScheduleCreate[]) =>
    this.createEndpoint(items);

  public delete = async (ids: CogniteInternalId[]) =>
    this.deleteEndpoint(ids.map(id => ({ id })));

  public retrieveInputData = async (id: CogniteInternalId) => {
    const response = await this.post<{ id: CogniteInternalId; data: object }>(
      this.url(`${id}/input_data`)
    );

    return response.data;
  };
}

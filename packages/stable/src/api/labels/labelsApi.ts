// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator, BaseResourceAPI } from '@cognite/sdk-core';
import {
  ExternalId,
  ExternalLabel,
  Label,
  LabelFilterRequest,
} from '../../types';

export class LabelsAPI extends BaseResourceAPI<Label> {
  /**
   * [Create labels](https://docs.cognite.com/api/v1/#operation/createLabels)
   *
   * ```js
   * const labels = [
   *   { externalId: 'PUMP', name: "Pump" },
   *   { externalId: 'ROTATING_EQUIPMENT', name: 'Rotating equipment', description: 'Asset with rotating parts' }
   * ];
   * const createdLabels = await client.labels.create(labels);
   * ```
   */
  public create = (items: ExternalLabel[]): Promise<Label[]> => {
    return super.createEndpoint(items);
  };

  /**
   * [List labels](https://docs.cognite.com/api/v1/#operation/listLabels)
   *
   * ```js
   * const labels = await client.labels.list({ filter: { externalIdPrefix: 'Pu'}});
   * ```
   */
  public list = (query?: LabelFilterRequest): CursorAndAsyncIterator<Label> => {
    return super.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Delete labels](https://doc.cognitedata.com/api/v1/#operation/deleteLabels)
   *
   * ```js
   * await client.labels.delete([{externalId: 'PUMP'}, {externalId: 'VALVE'}]);
   * ```
   */
  public delete = (ids: ExternalId[]) => {
    return super.deleteEndpoint(ids);
  };
}

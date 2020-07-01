// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator, BaseResourceAPI } from '@cognite/sdk-core';
import {
  ExternalId,
  ExternalLabelDefinition,
  LabelDefinition,
  LabelDefinitionFilterRequest,
  DatePropFilter,
} from '../../types';

export class LabelsAPI extends BaseResourceAPI<LabelDefinition> {
  /**
   * Specify what fields in json responses should be parsed as Dates
   * @hidden
   */
  protected getDateProps(): DatePropFilter {
    return [['items'], ['createdTime']];
  }

  /**
   * [Create labels](https://docs.cognite.com/api/v1/#operation/createLabelDefinitions)
   *
   * ```js
   * const labels = [
   *   { externalId: 'PUMP', name: "Pump" },
   *   { externalId: 'ROTATING_EQUIPMENT', name: 'Rotating equipment', description: 'Asset with rotating parts' }
   * ];
   * const createdLabels = await client.labels.create(labels);
   * ```
   */
  public create = (
    items: ExternalLabelDefinition[]
  ): Promise<LabelDefinition[]> => {
    return super.createEndpoint(items);
  };

  /**
   * [List labels](https://docs.cognite.com/api/v1/#operation/listLabels)
   *
   * ```js
   * const labels = await client.labels.list({ filter: { externalIdPrefix: 'Pu'}});
   * ```
   */
  public list = (
    query?: LabelDefinitionFilterRequest
  ): CursorAndAsyncIterator<LabelDefinition> => {
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

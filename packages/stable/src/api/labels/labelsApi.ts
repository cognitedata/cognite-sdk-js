// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  ExternalId,
  ExternalLabelDefinition,
  LabelDefinition,
  LabelDefinitionFilterRequest,
} from '../../types';

/**
 * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release. See https://docs.cognite.com/cdf/deprecated#deprecated-and-retired-features for more details.
 */
export class LabelsAPI extends BaseResourceAPI<LabelDefinition> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime']);
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
   *
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release.
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
   *
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release.
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
   *
   * @deprecated Asset-centric API, to be retired end of 2027. Will move to `client.legacy` in the next major release.
   */
  public delete = (ids: ExternalId[]) => {
    return super.deleteEndpoint(ids);
  };
}

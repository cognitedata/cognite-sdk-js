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
 * @deprecated Asset-centric API, deprecated 2026-10-15 and retired 2027-12-31. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
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
   * @deprecated Asset-centric API, deprecated 2026-10-15 and retired 2027-12-31. Will be removed or moved in a future major release.
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
   * @deprecated Asset-centric API, deprecated 2026-10-15 and retired 2027-12-31. Will be removed or moved in a future major release.
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
   * @deprecated Asset-centric API, deprecated 2026-10-15 and retired 2027-12-31. Will be removed or moved in a future major release.
   */
  public delete = (ids: ExternalId[]) => {
    return super.deleteEndpoint(ids);
  };
}

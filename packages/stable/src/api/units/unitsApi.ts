// Copyright 2023 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  ExternalId,
  MetadataMap,
} from '@cognite/sdk-core';
import { Unit } from '../../types';
import { UnitSystemsAPI } from './unitSystemsApi';

export class UnitsAPI extends BaseResourceAPI<Unit> {
  private unitSystemsApi: UnitSystemsAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
    const [resourcePath, client, metadataMap] = args;

    this.unitSystemsApi = new UnitSystemsAPI(
      `${resourcePath}/systems`,
      client,
      metadataMap
    );
  }

  /**
   * [List all supported units](https://developer.cognite.com/api#tag/Units/operation/listUnits)
   *
   * ```js
   * const units = await client.units.list();
   * ```
   */
  public list = async () => {
    return this.listEndpoint(this.callListEndpointWithGet);
  };

  /**
   * [Retrieve one or more units](https://developer.cognite.com/api#tag/Units/operation/byIdsUnits)
   *
   * ```js
   * const units = await client.units.retrieve([{ externalId: 'temperature:deg_c' }, { externalId: 'pressure:bar' }]);
   * ```
   */
  public retrieve = async (ids: ExternalId[]): Promise<Unit[]> => {
    return this.retrieveEndpoint(ids);
  };

  /**
   * [List all supported unit systems](List all supported unit systems <https://developer.cognite.com/api#tag/Unit-Systems/operation/listUnitSystems)
   *
   * ```js
   * const units = await client.units.listUnitSystems();
   * ```
   */
  public listUnitSystems = async () => {
    return this.unitSystemsApi.list();
  };
}

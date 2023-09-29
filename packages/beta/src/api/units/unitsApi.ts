// Copyright 2022 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  IdEither,
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

  public list = async () => {
    return this.listEndpoint(this.callListEndpointWithGet);
  };

  public retrieve = async (ids: IdEither[]): Promise<Unit[]> => {
    return this.retrieveEndpoint(ids);
  };

  public listUnitSystems = async () => {
    return this.unitSystemsApi.list();
  };
}

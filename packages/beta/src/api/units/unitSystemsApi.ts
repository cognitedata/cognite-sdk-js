// Copyright 2022 Cognite AS

import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import { UnitSystem } from '../../types';

export class UnitSystemsAPI extends BaseResourceAPI<UnitSystem> {
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  public list = async () => {
    return this.listEndpoint(this.callListEndpointWithGet);
  };
}

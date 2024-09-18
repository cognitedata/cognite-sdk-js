// Copyright 2023 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { UnitSystem } from '../../types';

export class UnitSystemsAPI extends BaseResourceAPI<UnitSystem> {
  public list = async () => {
    return this.listEndpoint(this.callListEndpointWithGet);
  };
}

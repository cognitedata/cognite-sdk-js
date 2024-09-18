// Copyright 2022 Cognite AS

import type { IdEither } from '@cognite/sdk';
import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  Channel,
  ChannelChange,
  ChannelCreate,
  ChannelFilterQuery,
} from '../../types';

export class ChannelsAPI extends BaseResourceAPI<Channel> {
  public create = async (items: ChannelCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: ChannelFilterQuery) => {
    return this.listEndpoint(this.callListEndpointWithPost, filter);
  };

  public update = async (changes: ChannelChange[]) => {
    return this.updateEndpoint(changes);
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}

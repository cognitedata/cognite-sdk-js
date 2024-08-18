// Copyright 2024 Cognite AS

import { BaseResourceAPI, type IdEither } from '@cognite/sdk-core';
import type {
  SimulatorModelRevision,
  SimulatorModelRevisionChange,
  SimulatorModelRevisionCreate,
  SimulatorModelRevisionFilterQuery,
} from '../../types';

export class ModelRevisionsAPI extends BaseResourceAPI<SimulatorModelRevision> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  public create = async (items: SimulatorModelRevisionCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SimulatorModelRevisionFilterQuery) => {
    return this.listEndpoint<SimulatorModelRevisionFilterQuery>(
      this.callListEndpointWithPost,
      filter
    );
  };

  public retrieve(items: IdEither[]) {
    return this.retrieveEndpoint(items);
  }

  public update = async (changes: SimulatorModelRevisionChange[]) => {
    return this.updateEndpoint(changes);
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}

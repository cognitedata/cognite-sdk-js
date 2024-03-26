// Copyright 2024 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  InternalId,
  MetadataMap,
} from '@cognite/sdk-core';
import { SimulatorLog, SimulatorLogData } from '../../types';

export class LogsAPI extends BaseResourceAPI<SimulatorLog> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps<SimulatorLog & SimulatorLogData>(
      ['items', 'data'],
      ['createdTime', 'lastUpdatedTime', 'timestamp']
    );
  }

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  public retrieve(items: InternalId[]) {
    return this.retrieveEndpoint(items);
  }
}

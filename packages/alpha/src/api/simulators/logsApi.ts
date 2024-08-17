// Copyright 2024 Cognite AS

import { BaseResourceAPI, type InternalId } from '@cognite/sdk-core';
import type { SimulatorLog, SimulatorLogData } from '../../types';

export class LogsAPI extends BaseResourceAPI<SimulatorLog> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps<SimulatorLog & SimulatorLogData>(
      ['items', 'data'],
      ['createdTime', 'lastUpdatedTime', 'timestamp'],
    );
  }

  public retrieve(items: InternalId[]) {
    return this.retrieveEndpoint(items);
  }
}

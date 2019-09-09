// Copyright 2019 Cognite AS

import { CogniteClient } from '../..';

export abstract class BaseResource<T> {
  protected client: CogniteClient;
  protected props: T;

  constructor(client: CogniteClient, props: T) {
    this.client = client;
    this.props = props;
  }

  public toJSON() {
    return this.props;
  }

  public toString() {
    return JSON.stringify(this.props);
  }
}

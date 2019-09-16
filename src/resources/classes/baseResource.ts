// Copyright 2019 Cognite AS

import { CogniteClient } from '../..';

export abstract class BaseResource<T> {
  protected client: CogniteClient;

  constructor(client: CogniteClient) {
    this.client = client;
    Object.defineProperty(this, 'client', {
      value: this.client,
      enumerable: false,
    });
  }

  public abstract toJSON(): T;

  public toString() {
    return JSON.stringify(this.toJSON());
  }
}

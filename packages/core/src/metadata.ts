// Copyright 2020 Cognite AS
import type { HttpResponse } from './httpClient/basicHttpClient';

export interface Metadata {
  status: number;
  headers: { [key: string]: string };
}

/** @hidden */
export class MetadataMap {
  private map: WeakMap<object, Metadata>;
  constructor() {
    this.map = new WeakMap();
  }

  public addAndReturn<T extends object, V>(
    value: T,
    metadata: HttpResponse<V>,
  ): T {
    this.map.set(value, {
      // we extract out only what is necessary
      status: metadata.status,
      headers: metadata.headers,
    });
    return value;
  }

  public get(value: object): undefined | Metadata {
    return this.map.get(value);
  }
}

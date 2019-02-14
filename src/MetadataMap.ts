// Copyright 2019 Cognite AS

import { AxiosResponse } from 'axios';

export interface Metadata {
  status: number;
  headers: { [key: string]: string };
}

export class MetadataMap {
  private map: WeakMap<any, Metadata>;
  constructor() {
    this.map = new WeakMap();
  }

  public addAndReturn<T>(value: T, axiosResponse: AxiosResponse): T {
    const { status, headers } = axiosResponse;
    this.map.set(value, { status, headers });
    return value;
  }

  public get(value: any): undefined | Metadata {
    return this.map.get(value);
  }
}

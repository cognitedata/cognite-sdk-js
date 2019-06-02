// Copyright 2019 Cognite AS

import { AxiosResponse } from 'axios';

export interface Metadata {
  status: number;
  headers: { [key: string]: string };
}

/** @hidden */
export class MetadataMap {
  private map: WeakMap<any, Metadata>;
  constructor() {
    this.map = new WeakMap();
  }

  public addAndReturn<T>(value: T, metadata: Metadata): T {
    this.map.set(value, metadata);
    return value;
  }

  public get(value: any): undefined | Metadata {
    return this.map.get(value);
  }
}

export function convertAxiosResponseToMetadata(
  axiosResponse: AxiosResponse
): Metadata {
  const { status, headers } = axiosResponse;
  return { status, headers };
}

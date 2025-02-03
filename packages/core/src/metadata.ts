// Copyright 2020 Cognite AS
import type { HttpResponse } from './httpClient/basicHttpClient';

export interface Metadata {
  status: number;
  headers: { [key: string]: string };
}

/**
 * When making API requests, the response includes metadata such as the HTTP status code and headers.
 * Often, the SDK user doesn't care about this data, and therefore the happy path
 * of the SDK excludes this data by default.
 *
 * However, the SDK allows the user to look-up the metadata if they need it.
 *
 * @example
 * ```ts
 * const response = await client.assets.list();
 * const metadata = client.getMetadata(response);
 * ```
 *
 * @remarks
 * We utilize [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
 * to avoid memory leaks.
 *
 * @hidden
 */
export class MetadataMap {
  private map: WeakMap<object, Metadata>;
  constructor() {
    this.map = new WeakMap();
  }

  public addAndReturn<T extends object, V>(
    value: T,
    metadata: HttpResponse<V>
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

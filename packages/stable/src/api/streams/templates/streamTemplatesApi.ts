// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { StreamTemplate } from './types';

export class StreamTemplatesAPI extends BaseResourceAPI<StreamTemplate> {
  /**
   * [List stream templates](https://developer.cognite.com/api#tag/Streams/operation/listStreamTemplates)
   *
   * ```js
   * const templates = await client.streams.templates.list();
   * ```
   */
  public list = async (): Promise<StreamTemplate[]> => {
    const path = this.url();
    const response = await this.get<{ items: StreamTemplate[] }>(path);
    return this.addToMapAndReturn(response.data.items, response);
  };
}

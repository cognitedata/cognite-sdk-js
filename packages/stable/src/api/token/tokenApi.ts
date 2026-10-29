// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { TokenInspect } from '../../types';

export class TokenAPI extends BaseResourceAPI<unknown> {
  /**
   * [Inspect the current token](https://api-docs.cognite.com/20230101/tag/Token/operation/inspectToken)
   *
   * Retrieves the CDF access (projects, groups and capabilities) of the current user.
   *
   * ```js
   * const { subject, projects, capabilities } = await client.token.inspect();
   * ```
   */
  public inspect = async (): Promise<TokenInspect> => {
    const response = await this.get<TokenInspect>(this.url('token/inspect'));
    return this.addToMapAndReturn(response.data, response);
  };
}

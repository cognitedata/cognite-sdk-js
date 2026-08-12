// Copyright 2024 Cognite AS

import { InstancesAPI } from '@cognite/sdk';
import type {
  DebugNotice,
  QuerySelectV3,
  QueryTableExpressionV3,
  RawPropertyValueV3,
} from '@cognite/sdk';

/**
 * Minimal request type for debug/analysis queries.
 * Use with `emitResults: false` to suppress data and focus on notices.
 */
export interface InstanceDebugQueryRequest {
  /** Result set expressions — the same `with` clause as a regular query. */
  with: Record<string, QueryTableExpressionV3>;
  /** Which result sets to return — the same `select` clause as a regular query. */
  select: Record<string, QuerySelectV3>;
  /** Optional parameterised filter values. */
  parameters?: Record<string, RawPropertyValueV3>;
  debug: {
    /**
     * Query timeout in milliseconds.
     * @default API default
     */
    timeout?: number;
    /**
     * Enable the most thorough level of query analysis.
     * Produces the richest set of notices but takes longer.
     * @default false
     */
    profile?: boolean;
  };
}

/** Minimal response containing only the query analysis notices. */
export interface InstanceDebugQueryResponse {
  /** Analysis notices describing performance characteristics of the query. */
  notices: DebugNotice[];
}

export class InstancesAlphaAPI extends InstancesAPI {
  /**
   * Analyse a query without returning data — useful for understanding
   * indexing, sorting, filtering and cursoring behaviour before running
   * the query at scale.
   *
   * ```ts
   * const { notices } = await client.instances.debugQuery({
   *   with: {
   *     myNodes: { nodes: { filter: { matchAll: {} } } },
   *   },
   *   select: { myNodes: {} },
   *   debug: { profile: true },
   * });
   *
   * for (const n of notices) {
   *   console.log(`[${n.level}] ${n.category} (grade ${n.grade}): ${n.hint}`);
   * }
   * ```
   */
  public debugQuery = async (
    params: InstanceDebugQueryRequest
  ): Promise<InstanceDebugQueryResponse> => {
    const response = await this.post<{ debug?: { notices?: DebugNotice[] } }>(
      this.url('query'),
      {
        data: {
          with: params.with,
          select: params.select,
          parameters: params.parameters,
          debug: {
            emitResults: false,
            timeout: params.debug.timeout,
            profile: params.debug.profile,
          },
        },
      }
    );
    return { notices: response.data.debug?.notices ?? [] };
  };
}

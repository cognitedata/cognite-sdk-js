# Plan: Implement DMS Debug Endpoint Support in JS SDK

> **Reference docs:** https://docs.cognite.com/cdf/dm/dm_guides/dm_debug_query_performance  
> **API endpoints affected:** `POST models/instances/query`, `POST models/instances/sync`, `POST models/instances/list`

---

## Background

The Cognite Data Fusion API added a `debug` parameter to three DMS instance endpoints (announced 2025-09-02 in the changelog). Sending a `debug` object in the request body returns `notices` in the response — structured performance insights that highlight index misses, inefficient filters, sort issues, and cursor problems.

The feature is **already present in the OpenAPI snapshot** (`DebugParameters`, `DebugResponse`, and all notice sub-schemas), but the TypeScript types in `types.gen.ts` and the method signatures in `instancesApi.ts` have not been updated yet.

Two alpha sub-features are documented but **not yet in the OpenAPI snapshot**:
- `includePlan` — returns the raw PostgreSQL execution plan
- `translatedQuery` — returns the internal query representation

These will be included in the types as optional fields (marked alpha in JSDoc) to make them available to early adopters.

---

## Scope

| File | Change |
|------|--------|
| `packages/stable/src/api/instances/types.gen.ts` | Add all new debug types; extend `QueryRequest`, `SyncRequest`, `NodeOrEdgeListRequestV3`, `QueryResponse`, `NodeAndEdgeCollectionResponseWithCursorV3Response` |
| `packages/stable/src/api/instances/instancesApi.ts` | Update JSDoc examples for `query`, `sync`, and `list` to show debug usage |
| `packages/stable/src/types.ts` | Re-export the new debug types |
| `packages/stable/src/__tests__/api/instances.int.spec.ts` | Add integration tests covering debug on `query`, `sync`, and `list` |

No changes needed in `instancesApi.ts` method bodies — the SDK passes the request body through as-is, so `debug` will flow automatically once the types are in place.

---

## Step-by-Step Implementation

### Step 1 — Add debug types to `types.gen.ts`

Add the following new exported interfaces and types **after** the existing `QueryResponse` interface (roughly line 774). Keep alphabetical order within the file's existing conventions.

#### 1a. `DebugParameters`

```typescript
/**
 * Configuration for query debug notices.
 * Add this to a `query`, `sync`, or `list` request to receive performance insights.
 */
export interface DebugParameters {
  /**
   * Include the query result in the response.
   * Set to `false` to enable `timeout`, `profile`, `includePlan`, and `translatedQuery`.
   * @default true
   */
  emitResults?: boolean;
  /**
   * Query timeout in milliseconds (max 60 000). Only valid when `emitResults` is `false`.
   */
  timeout?: number;
  /**
   * Enable detailed query profiling (runtime statistics, execution timing).
   * Requires `emitResults: false`.
   * @default false
   */
  profile?: boolean;
  /**
   * @alpha Include the underlying PostgreSQL execution plan in debug notices.
   * Requires `emitResults: false`. The format is not stable and may change.
   */
  includePlan?: boolean;
  /**
   * @alpha Include the internal translated query representation in debug notices.
   * Intended for advanced debugging. The format is not stable and may change.
   */
  translatedQuery?: boolean;
}
```

#### 1b. Notice base fields (shared properties)

Rather than a base class/interface (which the OpenAPI doesn't model), use a union type pattern consistent with the existing codebase style.

#### 1c. Leaf notice interfaces

Each notice has a discriminant `code` string literal, a `category`, a `level`, a `hint`, and notice-specific fields. Add all 10 leaf types:

```typescript
// ── Invalid debug options ──────────────────────────────────────────────────

export interface ExcessiveTimeoutNotice {
  code: 'excessiveTimeout';
  category: 'invalidDebugOptions';
  level: 'warning';
  hint: string;
  /** The specified timeout for the query. */
  timeout: number;
}

export interface NoTimeoutWithResultsNotice {
  code: 'noTimeoutWithResults';
  category: 'invalidDebugOptions';
  level: 'warning';
  hint: string;
}

// ── Sorting notices ────────────────────────────────────────────────────────

export interface SortNotBackedByIndexNotice {
  code: 'sortNotBackedByIndex';
  category: 'sorting';
  level: 'warning';
  hint: string;
  grade: 'C';
  sort: PropertySortV3[];
  /** Identifier for the result set expression that the notice applies to. */
  resultExpression: string;
}

export interface FilterMatchesCursorableSortNotice {
  code: 'filterMatchesCursorableSort';
  category: 'sorting';
  level: 'info';
  hint: string;
  grade: 'A' | 'B';
  sort?: PropertySortV3[];
  resultExpression: string;
}

export interface FilterMatchesBrokenCursorableIndexNotice {
  code: 'filterMatchesBrokenCursorableIndex';
  category: 'sorting';
  level: 'warning';
  hint: string;
  grade: 'D';
  sort?: PropertySortV3[];
  /** Identifier for the broken index. */
  index?: ContainerSubObjectIdentifier;
  resultExpression: string;
}

// ── Indexing notices ───────────────────────────────────────────────────────

export interface UnindexedThroughNotice {
  code: 'unindexedThrough';
  category: 'indexing';
  level: 'warning';
  hint: string;
  grade: 'E';
  resultExpression: string;
  /** Reference to the property that the notice applies to. */
  property: string[];
}

export interface ContainersWithoutIndexesInvolvedNotice {
  code: 'containersWithoutIndexesInvolved';
  category: 'indexing';
  level: 'warning';
  hint: string;
  grade: 'C';
  resultExpression: string;
  /** List of containers that the notice applies to. */
  containers: ContainerReference[];
}

// ── Filtering notices ──────────────────────────────────────────────────────

export interface SelectiveExternalIDFilterNotice {
  code: 'selectiveExternalIDFilter';
  category: 'filtering';
  level: 'info';
  hint: string;
  grade: 'A';
  /** Indicates that the notice is inherited from this result expression. */
  viaFrom?: string;
  resultExpression: string;
}

export interface SignificantPostFilteringNotice {
  code: 'significantPostFiltering';
  category: 'filtering';
  level: 'warning';
  hint: string;
  grade: 'C';
  resultExpression: string;
  /** The specified limit for the result expression. */
  limit: number;
  /**
   * Number of rows processed internally. Gives an indication of the query's complexity.
   */
  maxInvolvedRows: number;
}

export interface SignificantHasDataFiltersNotice {
  code: 'significantHasDataFiltering';
  category: 'filtering';
  level: 'warning';
  hint: string;
  grade: 'C';
  resultExpression: string;
  containers: ContainerReference[];
}

// ── Cursoring notices ──────────────────────────────────────────────────────

export interface IntractableDirectRelationsCursorNotice {
  code: 'intractableDirectRelationsCursor';
  category: 'cursoring';
  level: 'warning';
  hint: string;
  grade: 'D';
  resultExpression: string;
}

export interface IntractableCursorWithNestedFilterNotice {
  /**
   * Emitted when a query supplies both a cursor and a nested filter on the same result
   * set expression. The join required by the nested filter can prevent efficient
   * index-backed pagination.
   */
  code: 'intractableCursorWithNestedFilter';
  category: 'cursoring';
  level: 'warning';
  hint: string;
  grade: 'D';
  resultExpression: string;
}
```

#### 1e. `ContainerSubObjectIdentifier` helper type

`ContainerSubObjectIdentifier` is referenced by `FilterMatchesBrokenCursorableIndexNotice` but is not yet in `types.gen.ts`. Add it alongside the debug types:

```typescript
/** Identifies a named sub-object (e.g. an index) within a container. */
export interface ContainerSubObjectIdentifier {
  space: string;
  containerExternalId: string;
  identifier: string;
}
```

#### 1d. Union discriminated types

```typescript
export type InvalidDebugOptionsNotice =
  | ExcessiveTimeoutNotice
  | NoTimeoutWithResultsNotice;

export type SortingNotice =
  | SortNotBackedByIndexNotice
  | FilterMatchesCursorableSortNotice
  | FilterMatchesBrokenCursorableIndexNotice;

export type IndexingNotice =
  | UnindexedThroughNotice
  | ContainersWithoutIndexesInvolvedNotice;

export type FilteringNotice =
  | SelectiveExternalIDFilterNotice
  | SignificantPostFilteringNotice
  | SignificantHasDataFiltersNotice;

export type CursoringNotice =
  | IntractableDirectRelationsCursorNotice
  | IntractableCursorWithNestedFilterNotice;

/** A single debug notice returned by the API. Discriminate on the `code` field. */
export type DebugNotice =
  | InvalidDebugOptionsNotice
  | SortingNotice
  | IndexingNotice
  | FilteringNotice
  | CursoringNotice;

/** Debug information returned when `debug` is set on a request. */
export interface DebugResponse {
  /**
   * A list of notices providing insights into query execution: potential performance
   * issues, optimization suggestions, or confirmations of good practices.
   */
  notices: DebugNotice[];
}
```

---

### Step 2 — Extend existing request/response interfaces in `types.gen.ts`

Modify the four existing interfaces with a single optional `debug` field each.

#### `QueryRequest` (line ~758)

```typescript
export interface QueryRequest {
  cursors?: Record<string, NextCursorV3>;
  includeTyping?: IncludeTyping;
  parameters?: Record<string, RawPropertyValueV3>;
  select: Record<string, QuerySelectV3>;
  with: Record<string, QueryTableExpressionV3>;
  /** Enable debug notices for performance analysis. */
  debug?: DebugParameters;
}
```

#### `QueryResponse` (line ~769)

```typescript
export interface QueryResponse {
  items: Record<string, NodeOrEdge[]>;
  nextCursor: Record<string, NextCursorV3>;
  typing?: Record<string, TypeInformationOuter>;
  /** Present when `debug` was set on the request. */
  debug?: DebugResponse;
}
```

#### `SyncRequest` (line ~1010)

```typescript
export interface SyncRequest {
  allowExpiredCursorsAndAcceptMissedDeletes?: boolean;
  cursors?: Record<string, NextCursorV3>;
  includeTyping?: IncludeTyping;
  parameters?: Record<string, RawPropertyValueV3>;
  select: Record<string, SyncSelectV3>;
  with: Record<string, SyncTableExpressionV3>;
  /** Enable debug notices for performance analysis. */
  debug?: DebugParameters;
}
```

#### `NodeOrEdgeListRequestV3`

Search for the `NodeOrEdgeListRequestV3` interface and add:

```typescript
  /** Enable debug notices for performance analysis. */
  debug?: DebugParameters;
```

#### `NodeAndEdgeCollectionResponseWithCursorV3Response`

Search for `NodeAndEdgeCollectionResponseWithCursorV3Response` and add:

```typescript
  /** Present when `debug` was set on the request. */
  debug?: DebugResponse;
```

---

### Step 3 — Re-export new debug types from `packages/stable/src/types.ts`

Find the existing block that re-exports from `./api/instances/types.gen` and add the new types to the named export list:

```typescript
export type {
  // ... existing exports ...
  DebugParameters,
  DebugResponse,
  DebugNotice,
  InvalidDebugOptionsNotice,
  SortingNotice,
  IndexingNotice,
  FilteringNotice,
  CursoringNotice,
  ExcessiveTimeoutNotice,
  NoTimeoutWithResultsNotice,
  SortNotBackedByIndexNotice,
  FilterMatchesCursorableSortNotice,
  FilterMatchesBrokenCursorableIndexNotice,
  UnindexedThroughNotice,
  ContainersWithoutIndexesInvolvedNotice,
  SelectiveExternalIDFilterNotice,
  SignificantPostFilteringNotice,
  SignificantHasDataFiltersNotice,
  IntractableDirectRelationsCursorNotice,
  IntractableCursorWithNestedFilterNotice,
} from './api/instances/types.gen';
```

---

### Step 4 — Update JSDoc in `instancesApi.ts`

Update the JSDoc example blocks on `query`, `sync`, and `list` to include a `debug` usage snippet. No changes to the method bodies are needed — the `data: params` passthrough already handles the new field.

**Example for `query`:**

```typescript
/**
 * [Query instances](https://developer.cognite.com/api#tag/Instances/operation/queryContent)
 *
 * ```js
 * // Basic query
 * const response = await client.instances.query({ ... });
 *
 * // With debug notices for performance analysis
 * const debugResponse = await client.instances.query({
 *   with: { result_set_1: { nodes: { filter: { hasData: [['schema', 'Pump', 'v1']] } } } },
 *   select: { result_set_1: {} },
 *   debug: {},
 * });
 * for (const notice of debugResponse.debug?.notices ?? []) {
 *   console.log(notice.code, notice.hint);
 * }
 *
 * // Profile mode (disables result output, enables deep analysis)
 * const profileResponse = await client.instances.query({
 *   with: { ... },
 *   select: { ... },
 *   debug: { emitResults: false, profile: true, timeout: 30000 },
 * });
 * ```
 */
```

---

### Step 5 — Integration tests in `instances.int.spec.ts`

Add a new `describe('debug notices', ...)` block. The tests require a live CDF environment (consistent with the existing integration test pattern in the file).

#### Test cases to add

| Test | `debug` config | What to assert |
|------|---------------|----------------|
| `query with debug: {}` | `{}` | Response has `debug.notices` array (may be empty); `items` are returned. |
| `query with emitResults: false` | `{ emitResults: false }` | `items` key is absent or empty; `debug.notices` is present. |
| `query with profile: true` | `{ emitResults: false, profile: true, timeout: 30000 }` | `debug.notices` array is present. |
| `sync with debug: {}` | `{}` | Response has `debug.notices` array. |
| `list with debug: {}` | `{}` | Response has `debug.notices` array; `items` are returned. |
| `notice type narrowing` | `{}` | TypeScript discriminated union narrows correctly by `notice.code`. |

> **Note:** The test environment may not trigger specific notices (e.g. `sortNotBackedByIndex`) without specific data model setup. The tests should verify the shape of the response, not specific notice codes, unless a suitable test fixture is available.

---

### Step 6 — Verify types compile

Run the TypeScript compiler to ensure no regressions:

```bash
cd packages/stable
yarn tsc --noEmit
```

---

## What Is NOT in Scope

- **Python SDK / other SDKs** — this PR only covers `cognite-sdk-js`.
- **OpenAPI snapshot update** — the snapshot already has the relevant schemas. No regeneration needed; types are being added manually (consistent with the existing `codegen.skip.json` approach).
- **Changelog entry** — will be added as part of the PR; follows the existing `CHANGELOG.md` pattern.
- **`includePlan` / `translatedQuery` server-side support** — these alpha fields are typed but not tested end-to-end as they depend on server availability.

---

## Risk & Considerations

| Area | Risk | Mitigation |
|------|------|-----------|
| `types.gen.ts` is auto-generated | Manual edits may be overwritten on next regen | Add a comment block near the debug types noting they were hand-added; update `codegen.skip.json` if applicable |
| Alpha fields (`includePlan`, `translatedQuery`) | Not in OpenAPI snapshot → may diverge | Mark with `@alpha` JSDoc; easy to update when promoted |
| `ContainerSubObjectIdentifier` reference | Used in `FilterMatchesBrokenCursorableIndexNotice` — does **not** yet exist in `types.gen.ts` | Add it alongside the debug types (see Step 1e above) |
| `ContainerReference` reference | Used in several notices | Already exists in `types.gen.ts` (line 126) ✅ |

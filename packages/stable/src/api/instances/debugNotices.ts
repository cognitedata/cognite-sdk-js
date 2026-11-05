// Copyright 2026 Cognite AS

import type { UnknownDebugNotice } from './debugTypes';
import type { DebugNotice } from './types.gen';

/**
 * Every (`category`, `code`) pair the SDK has a typed `DebugNotice` for.
 *
 * This is the TypeScript counterpart of `_create_debug_notice_subclass_map` in the
 * Python SDK. The key type is derived from the `DebugNotice` union, so adding a notice
 * to the generated types without registering it here is a compile error (and so is
 * leaving a stale entry behind).
 */
const KNOWN_DEBUG_NOTICES: {
  [N in DebugNotice as `${N['category']}/${N['code']}`]: true;
} = {
  'invalidDebugOptions/excessiveTimeout': true,
  'invalidDebugOptions/noTimeoutWithResults': true,
  'sorting/sortNotBackedByIndex': true,
  'sorting/suggestedCursorableSort': true,
  'sorting/filterMatchesCursorableSort': true,
  'sorting/filterMatchesBrokenCursorableIndex': true,
  'indexing/unindexedThrough': true,
  'indexing/containersWithoutIndexesInvolved': true,
  'indexing/filterIncompatibleWithCursorableIndexScan': true,
  'filtering/selectiveExternalIDFilter': true,
  'filtering/significantPostFiltering': true,
  'filtering/significantHasDataFiltering': true,
  'filtering/unfilteredContainerScan': true,
  'cursoring/intractableDirectRelationsCursor': true,
  'cursoring/intractableCursorWithNestedFilter': true,
  'sync/syncMissingSpaceFilter': true,
};

const noticeKey = (notice: Record<string, unknown>) =>
  `${String(notice.category)}/${String(notice.code)}`;

const isKnownKey = (key: string) =>
  Object.prototype.hasOwnProperty.call(KNOWN_DEBUG_NOTICES, key);

const MISSING = 'MISSING/UNKNOWN';

const loadUnknownDebugNotice = (
  data: Record<string, unknown>
): UnknownDebugNotice => {
  const { category, code, hint, level, ...rest } = data;
  return {
    category: typeof category === 'string' ? category : MISSING,
    code: typeof code === 'string' ? code : MISSING,
    hint: typeof hint === 'string' ? hint : MISSING,
    level: typeof level === 'string' ? level : MISSING,
    data: rest,
  };
};

/**
 * Maps a raw notice from the API to a typed {@link DebugNotice} by looking up its
 * (`category`, `code`) pair, falling back to an {@link UnknownDebugNotice} for notices
 * this SDK version does not know about. Mirrors `DebugNotice._load` in the Python SDK.
 *
 * @internal
 */
export const loadDebugNotice = (
  data: Record<string, unknown>
): DebugNotice | UnknownDebugNotice =>
  isKnownKey(noticeKey(data))
    ? (data as unknown as DebugNotice)
    : loadUnknownDebugNotice(data);

/**
 * Type guard for notices this SDK version has no typed shape for. Checking it first
 * narrows the remaining notices to the known {@link DebugNotice} union, which can then
 * be narrowed further on `code`:
 *
 * ```js
 * for (const notice of response.debug?.notices ?? []) {
 *   if (isUnknownDebugNotice(notice)) continue;
 *   if (notice.code === 'unindexedThrough') console.log(notice.property);
 * }
 * ```
 */
export const isUnknownDebugNotice = (
  notice: DebugNotice | UnknownDebugNotice
): notice is UnknownDebugNotice => !isKnownKey(noticeKey({ ...notice }));

/**
 * Returns the response with every `debug.notices` entry passed through
 * {@link loadDebugNotice}. Responses without notices are returned untouched.
 *
 * @internal
 */
export const loadDebugNotices = <T extends { debug?: { notices?: unknown[] } }>(
  response: T
): T => {
  const notices = response.debug?.notices;
  if (!Array.isArray(notices)) {
    return response;
  }
  return {
    ...response,
    debug: {
      ...response.debug,
      notices: notices.map((notice) =>
        loadDebugNotice(notice as Record<string, unknown>)
      ),
    },
  };
};

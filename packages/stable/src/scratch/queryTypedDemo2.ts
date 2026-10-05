// Demo 2: queryTyped with MULTIPLE system views (cdf_cdm).
// Type-check-only, never executed. See queryTypedDemo.ts for the single-view demo.
// Do not merge: this PR is for review/testing only.
import type { CogniteClient, QueryRequest } from '@cognite/sdk';

declare const client: CogniteClient;

const CogniteAssetView = {
  type: 'view',
  space: 'cdf_cdm',
  externalId: 'CogniteAsset',
  version: 'v1',
} as const;

const CogniteTimeSeriesView = {
  type: 'view',
  space: 'cdf_cdm',
  externalId: 'CogniteTimeSeries',
  version: 'v1',
} as const;

const CogniteFileView = {
  type: 'view',
  space: 'cdf_cdm',
  externalId: 'CogniteFile',
  version: 'v1',
} as const;

// Three result sets, one system view each.
const query = {
  with: {
    assets: {
      nodes: { filter: { hasData: [CogniteAssetView] } },
      limit: 10,
    },
    timeseries: {
      nodes: { filter: { hasData: [CogniteTimeSeriesView] } },
      limit: 10,
    },
    files: {
      nodes: { filter: { hasData: [CogniteFileView] } },
      limit: 10,
    },
  },
  select: {
    assets: {
      sources: [
        { source: CogniteAssetView, properties: ['name', 'description'] },
      ],
    },
    timeseries: {
      sources: [
        { source: CogniteTimeSeriesView, properties: ['name', 'isStep'] },
      ],
    },
    files: {
      sources: [{ source: CogniteFileView, properties: ['name', 'mimeType'] }],
    },
  },
} as const satisfies QueryRequest;

// One result set that selects TWO views at once.
const multiSourceQuery = {
  with: {
    assets: {
      nodes: { filter: { hasData: [CogniteAssetView] } },
      limit: 10,
    },
  },
  select: {
    assets: {
      sources: [
        { source: CogniteAssetView, properties: ['name'] },
        { source: CogniteTimeSeriesView, properties: ['isStep'] },
      ],
    },
  },
} as const satisfies QueryRequest;

// ---------------------------------------------------------------------------
// (A) queryTyped WITHOUT generics, several result sets / views
// ---------------------------------------------------------------------------
export async function noGenerics() {
  const res = await client.instances.queryTyped(query);

  const asset = res.items.assets[0].properties.cdf_cdm['CogniteAsset/v1'];
  const ts = res.items.timeseries[0].properties.cdf_cdm['CogniteTimeSeries/v1'];
  const file = res.items.files[0].properties.cdf_cdm['CogniteFile/v1'];

  const assetName = asset.name;
  const tsIsStep = ts.isStep;
  const fileMime = file.mimeType;

  // @ts-expect-error TS2339
  const assetTypo = asset.nmae;
  // @ts-expect-error TS2551
  const tsTypo = ts.isStepp;
  // @ts-expect-error TS2339
  const wrongViewForResultSet = asset.isStep; // isStep belongs to timeseries
  // @ts-expect-error TS7053
  const wrongViewKey = res.items.assets[0].properties.cdf_cdm['CogniteFile/v1'];
  const wrongVersion =
    // @ts-expect-error TS2551
    res.items.assets[0].properties.cdf_cdm['CogniteAsset/v2'];
  // @ts-expect-error TS2339
  const wrongSpace = res.items.assets[0].properties.cdf_core;
  // @ts-expect-error TS2551
  const resultKeyTypo = res.items.assetz;
  // @ts-expect-error TS2339
  const trimAsset = asset.name.trim();
  // @ts-expect-error TS2322
  const flagAsBoolean: boolean = ts.isStep;

  return {
    assetName,
    tsIsStep,
    fileMime,
    assetTypo,
    tsTypo,
    wrongViewForResultSet,
    wrongViewKey,
    wrongVersion,
    wrongSpace,
    resultKeyTypo,
    trimAsset,
    flagAsBoolean,
  };
}

// ---------------------------------------------------------------------------
// (A2) a single result set that selects two views
// ---------------------------------------------------------------------------
export async function noGenericsMultiSource() {
  const res = await client.instances.queryTyped(multiSourceQuery);
  const props = res.items.assets[0].properties.cdf_cdm;
  const assetName = props['CogniteAsset/v1'].name;
  const tsIsStep = props['CogniteTimeSeries/v1'].isStep;
  // @ts-expect-error TS2339
  const notSelectedProp = props['CogniteAsset/v1'].description; // not in `properties`
  // @ts-expect-error TS7053
  const notSelectedView = props['CogniteFile/v1'];
  return { assetName, tsIsStep, notSelectedProp, notSelectedView };
}

// ---------------------------------------------------------------------------
// (B) One set of view types, supplied explicitly as the 2nd generic.
// Each entry describes a FULL view once (not per query).
// ---------------------------------------------------------------------------
export type SystemViewSources = [
  {
    source: typeof CogniteAssetView;
    properties: { name: string; description: string };
  },
  {
    source: typeof CogniteTimeSeriesView;
    properties: { name: string; isStep: boolean };
  },
  {
    source: typeof CogniteFileView;
    properties: { name: string; mimeType: string };
  },
];

export async function withViewSet() {
  const res = await client.instances.queryTyped<
    typeof query,
    SystemViewSources
  >(query);
  const assetName =
    res.items.assets[0].properties.cdf_cdm['CogniteAsset/v1'].name;
  const tsIsStep =
    res.items.timeseries[0].properties.cdf_cdm['CogniteTimeSeries/v1'].isStep;
  const fileMime =
    res.items.files[0].properties.cdf_cdm['CogniteFile/v1'].mimeType;
  const assetTrim = assetName.trim();
  const flag: boolean = tsIsStep;
  const mimeTrim = fileMime.trim();
  const tsTypo =
    // @ts-expect-error TS2551
    res.items.timeseries[0].properties.cdf_cdm['CogniteTimeSeries/v1'].isStepp;
  return { assetName, tsIsStep, fileMime, assetTrim, flag, mimeTrim, tsTypo };
}

// The same view set also types a query that selects only SOME properties,
// and a query that selects two views in one result set.
export async function withViewSetSubsetAndMulti() {
  const res = await client.instances.queryTyped<
    typeof multiSourceQuery,
    SystemViewSources
  >(multiSourceQuery);
  const props = res.items.assets[0].properties.cdf_cdm;
  const assetName = props['CogniteAsset/v1'].name;
  const tsIsStep = props['CogniteTimeSeries/v1'].isStep;
  // @ts-expect-error TS2339
  const notSelected = props['CogniteAsset/v1'].description;
  return { assetName, tsIsStep, notSelected };
}

// ---------------------------------------------------------------------------
// (C) "Default generics": a one-line wrapper that bakes the view set in,
// so call sites need no generics at all.
// ---------------------------------------------------------------------------
export const queryTypedSystem = <TQuery extends QueryRequest>(params: TQuery) =>
  client.instances.queryTyped<TQuery, SystemViewSources>(params);

export async function viaWrapper() {
  const res = await queryTypedSystem(query);
  const assetName =
    res.items.assets[0].properties.cdf_cdm['CogniteAsset/v1'].name;
  const tsIsStep =
    res.items.timeseries[0].properties.cdf_cdm['CogniteTimeSeries/v1'].isStep;
  const fileMime =
    res.items.files[0].properties.cdf_cdm['CogniteFile/v1'].mimeType;
  const assetTrim = assetName.trim();
  const flag: boolean = tsIsStep;
  const mimeTrim = fileMime.trim();
  const assetTypo =
    // @ts-expect-error TS2339
    res.items.assets[0].properties.cdf_cdm['CogniteAsset/v1'].nmae;
  // @ts-expect-error TS2551
  const keyTypo = res.items.assetz;
  return {
    assetName,
    tsIsStep,
    fileMime,
    assetTrim,
    flag,
    mimeTrim,
    assetTypo,
    keyTypo,
  };
}

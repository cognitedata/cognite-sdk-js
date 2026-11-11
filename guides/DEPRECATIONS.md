# Deprecations

This page lists the parts of `@cognite/sdk` that are deprecated, why, and what to use instead.
Deprecated members are marked with `@deprecated` in the TypeScript declarations, so your editor
shows them struck through. Nothing changes at runtime in the 10.x line.

See the [CDF deprecation page](https://docs.cognite.com/cdf/deprecated#deprecated-and-retired-features)
for the official announcements and dates.

## Asset-centric APIs (deprecated 2026-10-15, retired 2027-12-31)

CDF announced the deprecation of the asset-centric (classic) resources on 2026-10-15. The APIs
keep working during the deprecation period but get no new features, and they shut down on
2027-12-31. Their replacement is [data modeling](https://docs.cognite.com/cdf/dm/) via
`client.instances`, `client.views`, `client.containers`, `client.dataModels` and `client.spaces`.

In the SDK these APIs are marked `@deprecated` and will be removed or moved in a future major
release. The methods and types themselves are unchanged.

| Deprecated              | Replacement                                                              |
| ----------------------- | ------------------------------------------------------------------------ |
| `client.assets`         | `CogniteAsset` instances                                                 |
| `client.events`         | Records, or `CogniteActivity` / `CogniteMaintenanceOrder` instances      |
| `client.sequences`      | Files in data modeling, or records for data that needs row-level queries |
| `client.labels`         | No direct replacement; model labels as a concept in your data model      |
| `client.datasets`       | Spaces, with data products for governance                                |
| `client.relationships`  | Edges                                                                    |
| `client.annotations`    | `CogniteAnnotation` instances                                            |
| `client.securityCategories` | Data products and granular access control                        |
| `client.geospatial`     | No replacement; stop using it before 2027-12-31                          |

### 3D asset mappings

`client.assetMappings3D` is deprecated as of 2026-10-15 as part of asset-centric 3D
contextualization; no retirement date is announced. The replacement is the 3D contextualization
APIs in data modeling, which are in public preview and not yet part of this SDK. The other 3D
APIs (`client.models3D`, `client.revisions3D`, `client.files3D`, `client.viewer3D`) are **not**
deprecated.

### Time series: metadata is deprecated

`client.timeseries` is not going away. CDF deprecates asset-centric time series metadata and the
asset-hierarchy filters as of 2026-10-15 and retires them on 2027-12-31. Data point reads and
writes stay on the Time series API and address a time series by `instanceId` (see below).

- Deprecated: `client.timeseries.create`, `update`, `list`, `search`, `aggregate`, `delete` and
  `retrieve`, together with the `TimeSeries` type and the create, filter, search, update and
  aggregate types. Create and query time series as `CogniteTimeSeries` instances via
  `client.instances` instead.
- Not deprecated: the data point endpoints (`client.datapoints`, also available as
  `client.timeseries.data`) stay available, but identify time series by `instanceId`; see
  [Datapoints: identify time series by `instanceId`](#datapoints-identify-time-series-by-instanceid).
  Synthetic queries (`client.timeseries.syntheticQuery`, also available as
  `client.timeseries.synthetic.query`) also stay available; reference time series in expressions
  as `TS{space='...', externalId='...'}` instead of `TS{id=...}` or `TS{externalId='...'}`. See
  [Data points and synthetic queries under `client.timeseries`](#data-points-and-synthetic-queries-under-clienttimeseries)
  for the new paths.
- Subscriptions (`client.timeseries.subscriptions`) stay available, but track time series by
  `instanceIds`; see
  [Data point subscriptions: track time series by `instanceIds`](#data-point-subscriptions-track-time-series-by-instanceids).

```ts
// before
await client.timeseries.create([{ externalId: 'my-ts', name: 'Pressure', isStep: false }]);

// after
await client.instances.upsert({
  items: [
    {
      instanceType: 'node',
      space: 'my-space',
      externalId: 'my-ts',
      sources: [
        {
          source: { type: 'view', space: 'cdf_cdm', externalId: 'CogniteTimeSeries', version: 'v1' },
          properties: { name: 'Pressure', isStep: false, type: 'numeric' },
        },
      ],
    },
  ],
});
```

### Data points and synthetic queries under `client.timeseries`

The SDK now also exposes the data point and synthetic query endpoints under `client.timeseries`,
mirroring their API paths (`/timeseries/data`, `/timeseries/synthetic/query`). The Python SDK uses
the same layout under `client.time_series`.

```
client.timeseries
  create ... aggregate     @deprecated, see "Time series: metadata is deprecated"
  data                     new, /timeseries/data (same as client.datapoints)
    insert  retrieve  retrieveLatest  delete
  synthetic.query          new, /timeseries/synthetic/query (same as syntheticQuery)
  syntheticQuery           unchanged
  subscriptions.*          methods unchanged, /timeseries/subscriptions
client.datapoints          unchanged
```

- New: `client.timeseries.data` (`insert`, `retrieve`, `retrieveLatest`, `delete`) and
  `client.timeseries.synthetic.query`.
- Not deprecated: `client.datapoints` and `client.timeseries.syntheticQuery` keep working. They
  call the same endpoints as the new paths, so switching is optional.

```ts
// old path
await client.datapoints.retrieve({
  items: [{ instanceId: { space: 'my-space', externalId: 'my-ts' } }],
});
await client.timeseries.syntheticQuery([
  { expression: "TS{space='my-space', externalId='my-ts'} * 2" },
]);

// new path
await client.timeseries.data.retrieve({
  items: [{ instanceId: { space: 'my-space', externalId: 'my-ts' } }],
});
await client.timeseries.synthetic.query([
  { expression: "TS{space='my-space', externalId='my-ts'} * 2" },
]);
```

### Datapoints: identify time series by `instanceId`

Addressing a time series by `id` or `externalId` is deprecated as of 2026-10-15 and retired on
2027-12-31, in favour of `instanceId`. This applies to all `client.datapoints` methods and to
`client.timeseries.data`. The input types `DatapointsInsertById`, `DatapointsInsertByExternalId`,
`DatapointsQueryId`, `DatapointsQueryExternalId`, `LatestDataBeforeRequestId`, `LatestDataBeforeRequestExternalId`,
`DatapointsDeleteRequestId` and `DatapointsDeleteRequestExternalId` are deprecated; use
`DatapointsInsertByInstanceId`, `DatapointsQueryInstanceId`, `LatestDataBeforeRequestInstanceId`
and `DatapointsDeleteRequestInstanceId`. `TimeSeriesIdEither` is deprecated on the same terms; use
`InstanceId` instead.

These types (and the aliases `ExternalDatapointId`, `ExternalDatapointExternalId` and
`TimeseriesIdEither`) are tagged `@deprecated`, so your editor flags them where you reference them
by name. Inline request objects such as `retrieve({ items: [{ id: 123 }] })` get no warning, so
check your own code for `id` or `externalId` in datapoint requests. Nothing changes at runtime.

```ts
// before
await client.datapoints.retrieve({ items: [{ externalId: 'my-ts' }] });

// after
await client.datapoints.retrieve({
  items: [{ instanceId: { space: 'my-space', externalId: 'my-ts' } }],
});
```

### Data point subscriptions: track time series by `instanceIds`

`client.timeseries.subscriptions` and its methods stay available. Defining a subscription by time
series external ids (`timeSeriesIds`), filter subscriptions (`filter`) and data sets on
subscriptions (`dataSetId`) are deprecated as of 2026-10-15 and retired on 2027-12-31. Define
subscriptions through a list of time series instance ids (`instanceIds`) instead.

- Deprecated on create and update: `timeSeriesIds`, `filter` and `dataSetId`
  (`DataPointSubscriptionCreate`, `DataPointSubscriptionUpdateBody`), and the
  `DataPointSubscriptionTimeSeriesIdsUpdate` type. Use `instanceIds` and
  `DataPointSubscriptionInstanceIdsUpdate`. `dataSetId` has no replacement on subscriptions.
- Deprecated in responses: `dataSetId` and `filter` on `DataPointSubscription`, `id` and
  `externalId` on subscription members (`listMembers`), and `id` and `externalId` on the time
  series in subscription data and subscription changes (`listData`). Use `instanceId`.

Existing filter subscriptions keep working until retirement, but there is no filter-based
replacement: to replace one, create a subscription that lists its time series in `instanceIds`.
The filter types (`SubscriptionFilterLanguage` and the filters it is built from) are not tagged.
As with data points, editors flag the deprecated fields when you read them or reference the
deprecated types by name, but not in inline request objects, so check your own code for
`timeSeriesIds`, `filter` and `dataSetId` in subscription requests. Nothing changes at runtime.

```ts
// before
await client.timeseries.subscriptions.create([
  { externalId: 'my-subscription', partitionCount: 1, timeSeriesIds: ['my-ts'] },
]);

// after
await client.timeseries.subscriptions.create([
  {
    externalId: 'my-subscription',
    partitionCount: 1,
    instanceIds: [{ space: 'my-space', externalId: 'my-ts' }],
  },
]);
```

### Files: asset-centric metadata and filters

`client.files` is not going away. CDF deprecates asset-centric file metadata and the asset filters
on the Files API as of 2026-10-15 and retires them on 2027-12-31. File content upload and download
stay on the Files API and use `instanceId`.

- Deprecated: `client.files.retrieve`, `search`, `update`, `aggregate` and `delete`. Create and
  query files as `CogniteFile` instances via `client.instances` instead. To read a file, retrieve
  its `CogniteFile` instance and get the download URL with `getDownloadUrls` by `instanceId`; to
  delete one, delete its `CogniteFile` instance with `client.instances.delete`.
- Not deprecated: `upload` and `multipartUploadSession` (single-part and multi-part upload stay
  available, also for files that are not `CogniteFile`), `list`, and `getDownloadUrls`. Prefer
  `instanceId` where a method accepts it.
- Deprecated fields on the file types (`ExternalFileInfo`, `FileInfo`, the update types and the
  filter used by `list`, `search` and `aggregate`), each with the replacement from its row on the
  CDF deprecation page:

| Field                                                           | Replacement                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------------------- |
| `assetIds` (file and filter), `rootAssetIds`, `assetSubtreeIds` | Query `CogniteFile` instances connected to `CogniteAsset`           |
| `dataSetId`, `dataSetIds`                                       | Scope data with spaces and govern consumption with data products    |
| `labels`                                                        | No direct replacement; model labels as a concept in your data model |
| `securityCategories`                                            | Data products and granular access control                           |

```ts
// before
await client.files.retrieve([{ id: 123 }]);
await client.files.getDownloadUrls([{ id: 123 }]);

// after
const { items } = await client.instances.retrieve({
  items: [{ instanceType: 'node', space: 'my-space', externalId: 'my-file' }],
  sources: [
    { source: { type: 'view', space: 'cdf_cdm', externalId: 'CogniteFile', version: 'v1' } },
  ],
});
await client.files.getDownloadUrls([
  { instanceId: { space: 'my-space', externalId: 'my-file' } },
]);
```

Editors flag the deprecated methods, and the deprecated fields where you read them (for example
`file.assetIds`). TypeScript does not flag deprecated fields inside inline object literals, so
`list({ filter: { assetIds: [1] } })` shows no warning; check your own code for these fields.
Nothing changes at runtime.

## Templates (retired 2025-05-31)

The Templates API was retired on 2025-05-31. `client.templates` and its types will be removed in
a future major release. Use data modeling instead.

## Vision (retired 2027-02-17)

`client.vision` is deprecated with retirement date 2027-02-17. See the CDF deprecation page for
replacements.

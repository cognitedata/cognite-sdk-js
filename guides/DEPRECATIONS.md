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
- Not deprecated: the data point endpoints (`client.datapoints`) stay available, but identify time
  series by `instanceId`; see
  [Datapoints: identify time series by `instanceId`](#datapoints-identify-time-series-by-instanceid).
  Synthetic queries (`client.timeseries.syntheticQuery`) also stay available.
- Unchanged: `client.timeseries.subscriptions`.

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

### Datapoints: identify time series by `instanceId`

Addressing a time series by `id` or `externalId` is deprecated as of 2026-10-15 and retired on
2027-12-31, in favour of `instanceId`. This applies to all `client.datapoints` methods. The input
types `DatapointsInsertById`, `DatapointsInsertByExternalId`, `DatapointsQueryId` and
`DatapointsQueryExternalId` are deprecated; use `DatapointsInsertByInstanceId` and
`DatapointsQueryInstanceId`. `TimeSeriesIdEither` is deprecated on the same terms; use
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

## Templates (retired 2025-05-31)

The Templates API was retired on 2025-05-31. `client.templates` and its types will be removed in
a future major release. Use data modeling instead.

## Vision (retired 2027-02-17)

`client.vision` is deprecated with retirement date 2027-02-17. See the CDF deprecation page for
replacements.

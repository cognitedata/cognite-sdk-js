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

| Deprecated                | Notes                                                   |
| ------------------------- | ------------------------------------------------------- |
| `client.assets`           |                                                         |
| `client.timeseries`       | Includes synthetic time series and datapoint subscriptions |
| `client.events`           |                                                         |
| `client.sequences`        |                                                         |
| `client.labels`           |                                                         |
| `client.datasets`         |                                                         |
| `client.relationships`    |                                                         |
| `client.annotations`      |                                                         |
| `client.entityMatching`   |                                                         |
| `client.geospatial`       |                                                         |
| `client.assetMappings3D`  | No SDK replacement yet. A data-modeling-based 3D mapping API will be added before this is removed. |

The other 3D APIs (`client.models3D`, `client.revisions3D`, `client.files3D`, `client.viewer3D`)
are **not** deprecated.

### Datapoints: identify time series by `instanceId`

`client.datapoints` stays, but addressing a time series by `id` or `externalId` is deprecated in
favour of `instanceId`. The input types `DatapointsInsertById`, `DatapointsInsertByExternalId`,
`DatapointsQueryId` and `DatapointsQueryExternalId` are deprecated; use `DatapointsInsertByInstanceId`
and `DatapointsQueryInstanceId`.

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

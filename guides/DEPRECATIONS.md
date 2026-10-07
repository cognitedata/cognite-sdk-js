# Deprecations

This page lists the parts of `@cognite/sdk` that are deprecated, why, and what to use instead.
Deprecated members are marked with `@deprecated` in the TypeScript declarations, so your editor
shows them struck through. Nothing changes at runtime in the 10.x line.

See the [CDF deprecation page](https://docs.cognite.com/cdf/deprecated#deprecated-and-retired-features)
for the official announcements and dates.

## Asset-centric APIs (retired end of 2027)

The asset-centric (classic) CDF resources are deprecated and will be retired at the end of 2027.
Their replacement is [data modeling](https://docs.cognite.com/cdf/dm/) via `client.instances`,
`client.views`, `client.containers`, `client.dataModels` and `client.spaces`.

In the next major release of the SDK these APIs move from `client.<name>` to `client.legacy.<name>`,
so that the top-level client only shows the APIs with a future. The methods and types themselves
are unchanged.

| Deprecated                | In the next major          | Notes                                                   |
| ------------------------- | -------------------------- | ------------------------------------------------------- |
| `client.assets`           | `client.legacy.assets`     |                                                         |
| `client.timeseries`       | `client.legacy.timeseries` | Includes synthetic time series and datapoint subscriptions |
| `client.events`           | `client.legacy.events`     |                                                         |
| `client.sequences`        | `client.legacy.sequences`  |                                                         |
| `client.labels`           | `client.legacy.labels`     |                                                         |
| `client.datasets`         | `client.legacy.datasets`   |                                                         |
| `client.relationships`    | `client.legacy.relationships` |                                                      |
| `client.annotations`      | `client.legacy.annotations` |                                                        |
| `client.entityMatching`   | `client.legacy.entityMatching` |                                                     |
| `client.geospatial`       | `client.legacy.geospatial` |                                                         |
| `client.assetMappings3D`  | `client.legacy.assetMappings3D` | No SDK replacement yet. A data-modeling-based 3D mapping API will be added before this is removed. |

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
the next major release without a legacy replacement. Use data modeling instead.

## Vision (retired 2027-02-17)

`client.vision` is deprecated with retirement date 2027-02-17. See the CDF deprecation page for
replacements.

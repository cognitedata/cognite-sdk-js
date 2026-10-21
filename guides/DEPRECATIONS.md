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

### 3D (classic)

The classic 3D API is deprecated as of 2026-10-15; no retirement date is announced. 3D models are
managed through data modeling going forward. `client.assetMappings3D` is part of asset-centric 3D
contextualization, whose replacement is the 3D contextualization APIs in data modeling (public
preview, not yet part of this SDK).

```
client
  models3D                 @deprecated, /3d/models
  revisions3D              @deprecated, /3d/models/{id}/revisions (incl. nodes, logs, thumbnail, outputs)
  files3D                  @deprecated, /3d/files
  assetMappings3D          @deprecated, /3d/models/{id}/revisions/{id}/mappings
  viewer3D                 unchanged (not part of the public API contract)
```

## Templates (retired 2025-05-31)

The Templates API was retired on 2025-05-31. `client.templates` and its types will be removed in
a future major release. Use data modeling instead.

## Vision (retired 2027-02-17)

`client.vision` is deprecated with retirement date 2027-02-17. See the CDF deprecation page for
replacements.

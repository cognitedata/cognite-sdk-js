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

### Files: asset-centric metadata and filters

`client.files` stays, but its asset-centric metadata and asset filters are deprecated (2026-10-15,
retired 2027-12-31). File content upload and download stay on the Files API and use `instanceId`.
The upload endpoints also stay available for files that are not `CogniteFile`.

```
files
  upload  multipartUploadSession   unchanged
  getDownloadUrls                  prefer instanceId
  retrieve                         prefer instanceId; look up files as CogniteFile instances
  list  search  aggregate          unchanged, asset filters deprecated
  update  delete                   unchanged
  fields
    assetIds  rootAssetIds  assetSubtreeIds (filter)   @deprecated → CogniteFile linked to CogniteAsset
    assetIds (file)                                    @deprecated → CogniteFile.assets
    dataSetId  dataSetIds  labels                      @deprecated, governance removed
    securityCategories                                 @deprecated → data products and access control
```

```ts
// before
await client.files.list({ filter: { assetSubtreeIds: [{ externalId: 'plant' }] } });
await client.files.getDownloadUrls([{ externalId: 'my-file' }]);

// after: look up files as CogniteFile instances, download by instanceId
await client.instances.list({
  instanceType: 'node',
  sources: [{ source: { type: 'view', space: 'cdf_cdm', externalId: 'CogniteFile', version: 'v1' } }],
});
await client.files.getDownloadUrls([
  { instanceId: { space: 'my-space', externalId: 'my-file' } },
]);
```

The field tags are docs-only in most code: TypeScript only flags `@deprecated` when a name is
referenced directly, so `list({ filter: { assetIds: [1] } })` shows no warning in the editor.
Check your own code for these fields.

## Templates (retired 2025-05-31)

The Templates API was retired on 2025-05-31. `client.templates` and its types will be removed in
a future major release. Use data modeling instead.

## Vision (retired 2027-02-17)

`client.vision` is deprecated with retirement date 2027-02-17. See the CDF deprecation page for
replacements.

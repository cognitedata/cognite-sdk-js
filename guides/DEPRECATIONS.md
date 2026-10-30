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

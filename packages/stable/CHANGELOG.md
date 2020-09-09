# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 3.0.0 (2020-08-03)


### Bug Fixes

* make Node3D.boundingBox optional ([#403](https://github.com/cognitedata/cognite-sdk-js/issues/403)) ([768b0d9](https://github.com/cognitedata/cognite-sdk-js/commit/768b0d96de43f5a58da4b894993f484dd19dc75f))


### Features

* **datapoints:** add unit property to retrieve response ([5187c1c](https://github.com/cognitedata/cognite-sdk-js/commit/5187c1c2c30eaecbe7089770ad5c727735f71fd3))
* removed `AssetClass`, `AssetList`, `TimeseriesClass`, `TimeSeriesList` ([9315a95](https://github.com/cognitedata/cognite-sdk-js/commit/9315a95360561429af2e6f050a1e13f9ac9a2979))
* renamed interfaces ([#388](https://github.com/cognitedata/cognite-sdk-js/issues/388)) ([7f2ef5d](https://github.com/cognitedata/cognite-sdk-js/commit/7f2ef5d83869bffa932d8bc6f25a305e25a4e954))
* **avents-aggregate:** aggregates moved to separate api ([3f7f183](https://github.com/cognitedata/cognite-sdk-js/commit/3f7f183f02f230fa3d727c6b9dfe155c526d6d2c))


### BREAKING CHANGES

* Node3D.boundingBox has always been optional in API. This commit just fixes the bug in documentation.
* **core:** Fields that can have arbitrary string names (Raw, Metadata) are no longer converted to Date objects if their names happen to be:
`createdTime`, `lastUpdatedTime`, `uploadedTime`, `deletedTime`, `timestamp`, `sourceCreatedTime` or `sourceModifiedTime`.

* Helper classes that have been removed:
  - AssetClass
  - AssetList
  - TimeseriesClass
  - TimeSeriesList

For replacements, see [MIGRATION_GUIDE_2xx_3xx.md](https://docs.cognite.com/dev/guides/sdk/js/migration.html#upgrade-javascript-sdk-2-x-to-3-x)

* Interfaces renamed:
  - AzureADConfigurationDTO -> AzureADConfiguration
  - DatapointsGetAggregateDatapoint -> DatapointsAggregates
  - DatapointsGetDatapoint -> Datapoints
  - DatapointsGetDoubleDatapoint -> DoubleDatapoints
  - DatapointsGetStringDatapoint -> StringDatapoints
  - DatapointsInsertProperties -> ExternalDatapoints
  - DatapointsPostDatapoint -> ExternalDatapointsQuery
  - ExternalFilesMetadata -> ExternalFileInfo
  - FilesMetadata -> FileInfo
  - GetAggregateDatapoint -> DatapointAggregate
  - GetDatapointMetadata -> DatapointInfo
  - GetDoubleDatapoint -> DoubleDatapoint
  - GetStringDatapoint -> StringDatapoint
  - GetTimeSeriesMetadataDTO -> Timeseries
  - OAuth2ConfigurationDTO -> OAuth2Configuration
  - PostDatapoint -> ExternalDatapoint
  - PostTimeSeriesMetadataDTO -> ExternalTimeseries
  - TimeSeriesSearchDTO -> TimeseriesSearchFilter
  - TimeseriesFilter -> TimeseriesFilterQuery (structure changed)
  - TimeseriesFilterProps -> TimeseriesFilter
  - UploadFileMetadataResponse -> FileUploadResponse

* Interfaces removed:
  - Filter (use TimeseriesFilter)
  - Search (use TimeseriesSearch)


* `timeseries.list()` signature is now consistent with other resource types

* **avents-aggregate:** Event aggregate methods moved to a separate api.

`client.events.aggregate(...)` -> `client.events.aggregate.count()`
`client.events.uniqueValuesAggregate(...)` -> `client.events.aggregate.uniqueValues(...)`





# [2.33.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.32.0...v2.33.0) (2020-07-09)


### Features

* **projects:** added application domains to the update object ([83c67ec](https://github.com/cognitedata/cognite-sdk-js/commit/83c67ec7c693eb4b0e7df0670299a7b27e99743e))

# [2.32.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.31.0...v2.32.0) (2020-06-26)


### Features

* **labels:** new resource type, works with assets ([e275b76](https://github.com/cognitedata/cognite-sdk-js/commit/e275b766d4ce82b264e23467dad59833679d2f53))
* **timeseries:** add synthetic timeseries query ([#375](https://github.com/cognitedata/cognite-sdk-js/issues/375)) ([72723d1](https://github.com/cognitedata/cognite-sdk-js/commit/72723d13d244c4dfb3aa556b0300f698dffcaa1e))

# [2.31.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.30.0...v2.31.0) (2020-06-23)


### Features

* **events:** unique values aggregate ([#377](https://github.com/cognitedata/cognite-sdk-js/issues/377)) ([d47152c](https://github.com/cognitedata/cognite-sdk-js/commit/d47152c4873274648e9bf525737810ef14e9572c))

# [2.30.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.29.0...v2.30.0) (2020-06-18)


### Features

* export Revision3DStatus type ([#374](https://github.com/cognitedata/cognite-sdk-js/issues/374)) ([54112f0](https://github.com/cognitedata/cognite-sdk-js/commit/54112f02a6dacd3afcbbdda529c762a156de25aa))

# [2.29.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.28.0...v2.29.0) (2020-06-08)


### Features

* **files:** create + update security categories ([#372](https://github.com/cognitedata/cognite-sdk-js/issues/372)) ([f7192ca](https://github.com/cognitedata/cognite-sdk-js/commit/f7192cae4d55192ae09d394718c755d025610ea4))

# [2.28.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.27.1...v2.28.0) (2020-05-19)


### Features

* **retrieve:** ignoreUnknownIds for events/sequences/files/timeseries ([a905795](https://github.com/cognitedata/cognite-sdk-js/commit/a905795a7bdeef49886c1cc687c1b6d8fe8fda42))

## [2.27.1](https://github.com/cognitedata/cognite-sdk-js/compare/v2.27.0...v2.27.1) (2020-04-29)


### Bug Fixes

* authentication with a token in node environment ([08b11b9](https://github.com/cognitedata/cognite-sdk-js/commit/08b11b97c5d2d7e90a5a74fc10f961ca46c8d796))

# [2.27.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.26.0...v2.27.0) (2020-04-28)


### Features

* **events:** filter for ongoing and active events ([#365](https://github.com/cognitedata/cognite-sdk-js/issues/365)) ([fb5d4e9](https://github.com/cognitedata/cognite-sdk-js/commit/fb5d4e943db17784ad5b5270a078276235416fe2))

# [2.26.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.25.0...v2.26.0) (2020-03-25)


### Features

* add 'extra' field to CogniteError ([#362](https://github.com/cognitedata/cognite-sdk-js/issues/362)) ([c263f6d](https://github.com/cognitedata/cognite-sdk-js/commit/c263f6de45f3b769416a34514335aceaa4179f0d))

# [2.25.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.24.1...v2.25.0) (2020-03-19)


### Features

* **timeseries, sequences, files:** added aggregate support ([0aa83b9](https://github.com/cognitedata/cognite-sdk-js/commit/0aa83b99b31d0c6323527317447d154d2b8b5d8c))

## [2.24.1](https://github.com/cognitedata/cognite-sdk-js/compare/v2.24.0...v2.24.1) (2020-03-11)


### Bug Fixes

* deploy pipeline ([#355](https://github.com/cognitedata/cognite-sdk-js/issues/355)) ([3ca80f2](https://github.com/cognitedata/cognite-sdk-js/commit/3ca80f2c0226ee12fb21e83944da2b7a5634528c))

# [2.24.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.23.0...v2.24.0) (2020-03-11)


### Features


* Introduce support for Data sets. Document and track data lineage, ensure data integrity, and allow 3rd parties to write their insights securely back to your Cognite Data Fusion (CDF) project. Learn more about data sets [here.](https://docs.cognite.com/cdf/blog/data_sets.html)

# [2.22.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.21.0...v2.22.0) (2020-03-05)


### Features

* **datapoints:** added ignoreUnknownIds to getAllDatapoints ([aa25062](https://github.com/cognitedata/cognite-sdk-js/commit/aa250621a860070260b024b00a06c598d687f2af))
* **datapoints:** added ignoreUnknownIds to retrieveLatest in datapoints ([60832e6](https://github.com/cognitedata/cognite-sdk-js/commit/60832e6d00ba915232433569cde9ec45312311ae))
* **events:** added type and subtype to event update ([e3fdf74](https://github.com/cognitedata/cognite-sdk-js/commit/e3fdf7407eeb6f59ba5fb8e75616b0b105a8cf6d))

# [2.21.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.20.0...v2.21.0) (2020-02-26)


### Features

* **assets-and-events:** aggregate endpoint ([#350](https://github.com/cognitedata/cognite-sdk-js/issues/350)) ([efe933f](https://github.com/cognitedata/cognite-sdk-js/commit/efe933f8f5577a32c6f93d2698025325ace20c9b))

# [2.20.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.19.0...v2.20.0) (2020-02-20)


### Features

* **assets:** ignoreUnknownIds and aggregates for retrieve(...) ([cb04c46](https://github.com/cognitedata/cognite-sdk-js/commit/cb04c46172e52bcae0409890faebecc1f50fad28))

# [2.19.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.18.0...v2.19.0) (2020-02-12)


### Features

* **assets:** added support for depth & path aggregates ([#347](https://github.com/cognitedata/cognite-sdk-js/issues/347)) ([367d163](https://github.com/cognitedata/cognite-sdk-js/commit/367d163c683d262f909d42c6685c8c4bd2ed5a35))

# [2.18.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.17.0...v2.18.0) (2020-02-11)


### Features

* add getDefaultRequestHeaders() to get headers required by the API ([c5f01eb](https://github.com/cognitedata/cognite-sdk-js/commit/c5f01eb2ac3f5938032a55ede184ec0b62ad2111))

# [2.17.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.16.2...v2.17.0) (2020-02-10)


### Bug Fixes

* correct type on deleteDatapointsEndpoint method ([32630b7](https://github.com/cognitedata/cognite-sdk-js/commit/32630b72c551991c74b9d99b50df14ac6f717264))


### Features

* return parentExternalId for assets ([#346](https://github.com/cognitedata/cognite-sdk-js/issues/346)) ([c464632](https://github.com/cognitedata/cognite-sdk-js/commit/c464632b9226ac89ac39955235a4c896c2a24c8c))

## [2.16.2](https://github.com/cognitedata/cognite-sdk-js/compare/v2.16.1...v2.16.2) (2020-01-17)


### Bug Fixes

* capitalize all HTTP method strings ([dedd4de](https://github.com/cognitedata/cognite-sdk-js/commit/dedd4de379c460b9dcdd370b44b0c4a7bdffd6a9))

## [2.16.1](https://github.com/cognitedata/cognite-sdk-js/compare/v2.16.0...v2.16.1) (2019-12-11)


### Bug Fixes

* support all query parameters on client.raw.listRows(...) ([03681cd](https://github.com/cognitedata/cognite-sdk-js/commit/03681cd9cb6823e7949f4605a404684b4c0a7556))

# [2.16.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.15.0...v2.16.0) (2019-12-11)


### Features

* support assetSubtreeIds and assetExternalIds filters ([2f34364](https://github.com/cognitedata/cognite-sdk-js/commit/2f34364af3423f4eabc9b8da7a01d1326c9b9354))
* **assets:** parentExternalIds filter ([3579640](https://github.com/cognitedata/cognite-sdk-js/commit/3579640b694ded55858b2409d6f316fab36d2f09))
* **files:** source created/modified time, rootAssetIds, assetSubtreeIds ([3886331](https://github.com/cognitedata/cognite-sdk-js/commit/388633134b5621cd4f85e07ae1d27904c807c261))
* **sequences:** assetSubtreeIds filter ([b5f7ece](https://github.com/cognitedata/cognite-sdk-js/commit/b5f7ece4ba91362fc403f80c3aa341e9c83763b7))

# [2.15.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.14.0...v2.15.0) (2019-12-02)


### Features

* add HTTP patch method to httpClient ([e37614d](https://github.com/cognitedata/cognite-sdk-js/commit/e37614d57a6f4bf2be29916960fab507d7129113))

# [2.14.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.13.0...v2.14.0) (2019-11-25)


### Features

* **capability:** add type for scope with time series ids ([5492adf](https://github.com/cognitedata/cognite-sdk-js/commit/5492adf5975e39c00210164bae3a50abf38b8d41))

# [2.13.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.12.0...v2.13.0) (2019-11-21)


### Features

* **asset mappings 3d:** add intersectsBoundingBox to filter [DEVX-185] ([a845b56](https://github.com/cognitedata/cognite-sdk-js/commit/a845b56b65c8d5fe4a699c10aead488179b4c44a))

# [2.12.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.11.1...v2.12.0) (2019-11-19)


### Features

* **events api:** support sorting [DEVX-145] ([97883ee](https://github.com/cognitedata/cognite-sdk-js/commit/97883eede2d6cdb88b466a11b12d4ae9f21cc6c8))

## [2.11.1](https://github.com/cognitedata/cognite-sdk-js/compare/v2.11.0...v2.11.1) (2019-11-18)


### Bug Fixes

* expose HttpError from main module ([12ecffa](https://github.com/cognitedata/cognite-sdk-js/commit/12ecffab8c4a2fa2ac0fe6e2d991922fbc87ea09))

# [2.11.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.10.0...v2.11.0) (2019-11-09)


### Features

* add support for one-time sdk header ([ff9931f](https://github.com/cognitedata/cognitesdk-js/commit/ff9931fa5763c8ac788d6b40a451e87edd9d160c))

# [2.10.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.9.0...v2.10.0) (2019-11-06)


### Features

* **assets, events:** add list partition parameter ([96db310](https://github.com/cognitedata/cognitesdk-js/commit/96db31019e87c2a73d6ab31a1ebac7137db73ed3))

# [2.9.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.8.0...v2.9.0) (2019-11-06)


### Features

* **timeseries:** support advanced filters, partitions [DEVX-162] ([fbd4d69](https://github.com/cognitedata/cognitesdk-js/commit/fbd4d69db17a9e6a4920d587899762ba4615a335))

# [2.8.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.7.2...v2.8.0) (2019-11-05)


### Features

* add query parameters for assets search ([#309](https://github.com/cognitedata/cognitesdk-js/issues/309)) ([438b134](https://github.com/cognitedata/cognitesdk-js/commit/438b1346b4995e8089c774132d5bf32db37906b4))

## [2.7.2](https://github.com/cognitedata/cognitesdk-js/compare/v2.7.1...v2.7.2) (2019-10-29)


### Bug Fixes

* assets acl actions enum didn't match API value [DEVX-126] ([98b3733](https://github.com/cognitedata/cognitesdk-js/commit/98b37331fd56a847b68ea4de2f721532696c4ac3))

## [2.7.1](https://github.com/cognitedata/cognitesdk-js/compare/v2.7.0...v2.7.1) (2019-10-22)


### Bug Fixes

* message serialisation for non-api errors ([b33e758](https://github.com/cognitedata/cognitesdk-js/commit/b33e7589ac6295c6d30185be5f04d5601675db3f))

# [2.7.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.6.1...v2.7.0) (2019-10-21)


### Features

* added withCredentials option to send raw HTTP request to other domains ([#299](https://github.com/cognitedata/cognitesdk-js/issues/299)) ([036dedc](https://github.com/cognitedata/cognitesdk-js/commit/036dedcbb8bf3e0e5df493401207bd25f84ea801))

## [2.6.1](https://github.com/cognitedata/cognitesdk-js/compare/v2.6.0...v2.6.1) (2019-10-13)


### Bug Fixes

* **autoPagination:** failing autoPagination - recursively add .next-property ([f7208cf](https://github.com/cognitedata/cognitesdk-js/commit/f7208cf4c5ef0135112ee6ba08c8ee163c65d616))

# [2.6.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.5.1...v2.6.0) (2019-10-07)


### Bug Fixes

* export asset and timeseries helper classes ([7cde371](https://github.com/cognitedata/cognitesdk-js/commit/7cde371))
* export auth-related types ([7f24e74](https://github.com/cognitedata/cognitesdk-js/commit/7f24e74))


### Features

* add metadata property to 3d models and revisions ([04bffc6](https://github.com/cognitedata/cognitesdk-js/commit/04bffc6))

## [2.5.1](https://github.com/cognitedata/cognitesdk-js/compare/v2.5.0...v2.5.1) (2019-10-07)


### Bug Fixes

* export error types from main module ([c5fc35d](https://github.com/cognitedata/cognitesdk-js/commit/c5fc35d))

# [2.5.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.4.3...v2.5.0) (2019-10-02)


### Features

* **new api:** sequences api support ([00bcb4a](https://github.com/cognitedata/cognitesdk-js/commit/00bcb4a))

## [2.4.3](https://github.com/cognitedata/cognitesdk-js/compare/v2.4.2...v2.4.3) (2019-09-27)


### Bug Fixes

* support baseUrl with path ([e8670a9](https://github.com/cognitedata/cognitesdk-js/commit/e8670a9))

## [2.4.2](https://github.com/cognitedata/cognitesdk-js/compare/v2.4.1...v2.4.2) (2019-09-25)


### Bug Fixes

* **OAuth:** add warning when using OAuth without SSL ([a81b08d](https://github.com/cognitedata/cognitesdk-js/commit/a81b08d))

## [2.4.1](https://github.com/cognitedata/cognitesdk-js/compare/v2.4.0...v2.4.1) (2019-09-18)


### Bug Fixes

* convert api class methods to arrow functions ([f200589](https://github.com/cognitedata/cognitesdk-js/commit/f200589))

# [2.4.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.3.1...v2.4.0) (2019-09-16)


### Features

* asset childCount-aggregates ([79129ce](https://github.com/cognitedata/cognitesdk-js/commit/79129ce))

## [2.3.1](https://github.com/cognitedata/cognitesdk-js/compare/v2.3.0...v2.3.1) (2019-09-16)


### Bug Fixes

* only data props on Timeseries and Asset class are enumerable ([a2f412d](https://github.com/cognitedata/cognitesdk-js/commit/a2f412d))

# [2.3.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.2.2...v2.3.0) (2019-09-10)


### Bug Fixes

* incorrect types on timeseries filters and missing filters ([363a00b](https://github.com/cognitedata/cognitesdk-js/commit/363a00b))
* safely delete assets with chunking ([424cba9](https://github.com/cognitedata/cognitesdk-js/commit/424cba9))


### Features

* custom toString & toJSON methods for resource class ([1eae87b](https://github.com/cognitedata/cognitesdk-js/commit/1eae87b))
* expose logout.getUrl() endpoint ([a85c4a0](https://github.com/cognitedata/cognitesdk-js/commit/a85c4a0))
* expose projectId on login.status() ([00ab757](https://github.com/cognitedata/cognitesdk-js/commit/00ab757))
* list 3d nodes with property filtering ([8b85817](https://github.com/cognitedata/cognitesdk-js/commit/8b85817))
* use cached access token to skip auth flow ([b28f506](https://github.com/cognitedata/cognitesdk-js/commit/b28f506))

## [2.2.2](https://github.com/cognitedata/cognitesdk-js/compare/v2.2.1...v2.2.2) (2019-08-12)


### Bug Fixes

* **delete datapoints:** make 'exclusiveEnd' filter prop as optional ([d7f2e82](https://github.com/cognitedata/cognitesdk-js/commit/d7f2e82))
* replaced tuple type with an array for better user experience ([d65e4eb](https://github.com/cognitedata/cognitesdk-js/commit/d65e4eb))

## [2.2.1](https://github.com/cognitedata/cognitesdk-js/compare/v2.2.0...v2.2.1) (2019-08-09)


### Bug Fixes

* retry ETIMEDOUT connection failures ([b82736c](https://github.com/cognitedata/cognitesdk-js/commit/b82736c))

# [2.2.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.1.0...v2.2.0) (2019-08-09)


### Features

* add timeSeries and timeSeriesList class ([#258](https://github.com/cognitedata/cognitesdk-js/issues/258)) ([2aeb12f](https://github.com/cognitedata/cognitesdk-js/commit/2aeb12f))

# [2.1.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.0.4...v2.1.0) (2019-08-05)


### Features

* asset & assetList class ([66c4d5e](https://github.com/cognitedata/cognitesdk-js/commit/66c4d5e))

## [2.0.4](https://github.com/cognitedata/cognitesdk-js/compare/v2.0.3...v2.0.4) (2019-08-05)


### Bug Fixes

* added missing recursive flag to RAW deleteDatabase ([105cab0](https://github.com/cognitedata/cognitesdk-js/commit/105cab0))

## [2.0.3](https://github.com/cognitedata/cognitesdk-js/compare/v2.0.2...v2.0.3) (2019-08-01)


### Bug Fixes

* Added missing props to Event-filter ([33c7de0](https://github.com/cognitedata/cognitesdk-js/commit/33c7de0))
* Added missing rootId prop to Asset ([9e4a169](https://github.com/cognitedata/cognitesdk-js/commit/9e4a169))

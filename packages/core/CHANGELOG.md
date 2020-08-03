# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 1.0.0 (2020-08-03)


### Bug Fixes

* **core:** auto-conversion timestamp to Date ([2f06b60](https://github.com/cognitedata/cognite-sdk-js/commit/2f06b604f8c6276466d3105e60892a266eb2a4f7))


### Features

* removed AssetClass, AssetList, TimeseriesClass, TimeSeriesList ([9315a95](https://github.com/cognitedata/cognite-sdk-js/commit/9315a95360561429af2e6f050a1e13f9ac9a2979))


### BREAKING CHANGES

* **core:** Raw API doesn't automatically convert timestamp columns to Date objects.

Full list of column names affected: createdTime, lastUpdatedTime, uploadedTime, deletedTime, timestamp, sourceCreatedTime, sourceModifiedTime.
* Helper classes has been removed:
- AssetClass
- AssetList
- TimeseriesClass
- TimeSeriesList

Learn more: ./guides/MIGRATION_GUIDE_2xx_3xx.md

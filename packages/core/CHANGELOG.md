# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.1.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@1.0.6...@cognite/sdk-core@1.1.0) (2021-03-02)


### Features

* **aad-auth:** add ability to login using AzureAD auth flow ([#487](https://github.com/cognitedata/cognite-sdk-js/issues/487)) ([4cbadf1](https://github.com/cognitedata/cognite-sdk-js/commit/4cbadf1164b8e2ed3ade8fd3e0875d412739e7a3))





## [1.0.6](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@1.0.4...@cognite/sdk-core@1.0.6) (2021-03-01)


### Bug Fixes

* allows CDF authentication from localhost via http ([#489](https://github.com/cognitedata/cognite-sdk-js/issues/489)) ([9257972](https://github.com/cognitedata/cognite-sdk-js/commit/9257972dc87dfd5590df8d6ff253326407a8880a))





## [1.0.5](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@1.0.4...@cognite/sdk-core@1.0.5) (2021-02-26)


### Bug Fixes

* allows CDF authentication from localhost via http ([#489](https://github.com/cognitedata/cognite-sdk-js/issues/489)) ([9257972](https://github.com/cognitedata/cognite-sdk-js/commit/9257972dc87dfd5590df8d6ff253326407a8880a))





## [1.0.4](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@1.0.3...@cognite/sdk-core@1.0.4) (2020-12-17)


### Bug Fixes

* use granular lodash import ([2144d6f](https://github.com/cognitedata/cognite-sdk-js/commit/2144d6f439ba91ec47ba86052953b0240db7de22))





## [1.0.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@1.0.2...@cognite/sdk-core@1.0.3) (2020-11-18)


### Bug Fixes

* **files:** file upload for browsers in fileApi ([#446](https://github.com/cognitedata/cognite-sdk-js/issues/446)) ([41d2466](https://github.com/cognitedata/cognite-sdk-js/commit/41d2466c57f3ffd8069238556775177f67ac0180))





## [1.0.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@1.0.1...@cognite/sdk-core@1.0.2) (2020-09-17)


### Bug Fixes

* fileAPI upload endpoint ([#427](https://github.com/cognitedata/cognite-sdk-js/issues/427)) ([9c12661](https://github.com/cognitedata/cognite-sdk-js/commit/9c12661c12adc5312d0e5046adf6dd97c11554c8))





## [1.0.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@1.0.0...@cognite/sdk-core@1.0.1) (2020-09-10)


### Bug Fixes

* exports from packages, add guide for making derived SDKs ([#421](https://github.com/cognitedata/cognite-sdk-js/issues/421)) ([a3a2eb0](https://github.com/cognitedata/cognite-sdk-js/commit/a3a2eb03645733c289591b187f19e55b5294fbc7))





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

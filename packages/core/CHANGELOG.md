# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@2.2.0...@cognite/sdk-core@3.0.0) (2021-07-15)


### Features

* **core:** add oidc auth code flow [release] ([#587](https://github.com/cognitedata/cognite-sdk-js/issues/587)) ([0cc44aa](https://github.com/cognitedata/cognite-sdk-js/commit/0cc44aa82b7d7461e8629fe2e712f743bf6c7138))


### BREAKING CHANGES

* **core:** stop silencing errors from aad

* feat!: change loginWithOAuth API signature

BREAKING CHANGE!: stop guessing which flow to use based on content of options.

* feat: proforma changes to trigger major version bump

Co-authored-by: Vegard Økland <vegard.okland@cognite.com>





# [2.2.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@2.1.4...@cognite/sdk-core@2.2.0) (2021-07-14)


### Features

* add api version parameter to BaseCogniteClient [release] ([#610](https://github.com/cognitedata/cognite-sdk-js/issues/610)) ([11aca94](https://github.com/cognitedata/cognite-sdk-js/commit/11aca9498a8aef23c7855d675dc9d4d6cf70f10c))





## [2.1.4](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@2.1.3...@cognite/sdk-core@2.1.4) (2021-06-30)


### Reverts

* Revert "feat!: add client credentials flow (#589)" (#604) ([12d65a4](https://github.com/cognitedata/cognite-sdk-js/commit/12d65a41e919409582d76a3a59798737808cefac)), closes [#589](https://github.com/cognitedata/cognite-sdk-js/issues/589) [#604](https://github.com/cognitedata/cognite-sdk-js/issues/604)





## [2.1.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@2.1.2...@cognite/sdk-core@2.1.3) (2021-06-30)

**Note:** Version bump only for package @cognite/sdk-core





## [2.1.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@2.1.1...@cognite/sdk-core@2.1.2) (2021-04-26)


### Bug Fixes

* **core:** don't check if its https if its not a browser [release] ([#524](https://github.com/cognitedata/cognite-sdk-js/issues/524)) ([4ed1528](https://github.com/cognitedata/cognite-sdk-js/commit/4ed15281a21047b8230d9022b3cb9ab23768a3cc))





## [2.1.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@2.1.0...@cognite/sdk-core@2.1.1) (2021-04-13)

**Note:** Version bump only for package @cognite/sdk-core





# [2.1.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@2.0.0...@cognite/sdk-core@2.1.0) (2021-04-08)


### Features

* **adfs:** add auth flow for adfs ([#508](https://github.com/cognitedata/cognite-sdk-js/issues/508)) ([1130f8d](https://github.com/cognitedata/cognite-sdk-js/commit/1130f8d0d463144dff67480fdb960c531e9816ee))





# [2.0.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@1.2.2...@cognite/sdk-core@2.0.0) (2021-03-25)


### Features

* breaking changes to login with OAuth [release] ([#504](https://github.com/cognitedata/cognite-sdk-js/issues/504)) ([383d7f6](https://github.com/cognitedata/cognite-sdk-js/commit/383d7f6d0888a8acb8121af6cf39d1adbf724882))





## [1.2.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@1.2.1...@cognite/sdk-core@1.2.2) (2021-03-25)


### Bug Fixes

* revert breaking changes being published as patch ([#503](https://github.com/cognitedata/cognite-sdk-js/issues/503)) ([3b7afd9](https://github.com/cognitedata/cognite-sdk-js/commit/3b7afd94030c75b2122a8e8323678455bcef0a29))





## [1.2.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@1.2.0...@cognite/sdk-core@1.2.1) (2021-03-25)

**Note:** Version bump only for package @cognite/sdk-core





# [1.2.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@1.1.0...@cognite/sdk-core@1.2.0) (2021-03-05)


### Features

* **aad:** use LS state as source of truth ([#493](https://github.com/cognitedata/cognite-sdk-js/issues/493)) ([a03404c](https://github.com/cognitedata/cognite-sdk-js/commit/a03404c084d73c55ab22aeb29cd6724772c079a5))





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

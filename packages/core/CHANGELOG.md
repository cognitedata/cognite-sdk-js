# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.3.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.2.0...@cognite/sdk-core@4.3.0) (2022-06-02)


### Features

* automatic token management with @cognite/auth-wrapper  ([#796](https://github.com/cognitedata/cognite-sdk-js/issues/796)) ([d13c53f](https://github.com/cognitedata/cognite-sdk-js/commit/d13c53f9d5a5e65d6e2fc7d1a0e2efe2d36e678c))
* automatic token management with @cognite/auth-wrapper  ([#814](https://github.com/cognitedata/cognite-sdk-js/issues/814)) ([d2c3a30](https://github.com/cognitedata/cognite-sdk-js/commit/d2c3a3083746e234f5dfc3e290188414d9ea17a6))


### Reverts

* Revert "feat: automatic token management with @cognite/auth-wrapper  (#796)" (#813) ([0a8a61c](https://github.com/cognitedata/cognite-sdk-js/commit/0a8a61c2b2c3d992f80b40f6282b20595537edac)), closes [#796](https://github.com/cognitedata/cognite-sdk-js/issues/796) [#813](https://github.com/cognitedata/cognite-sdk-js/issues/813)





# [4.2.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.1.7...@cognite/sdk-core@4.2.0) (2022-05-27)


### Features

* **documents:** aggregate api ([#793](https://github.com/cognitedata/cognite-sdk-js/issues/793)) ([445c39f](https://github.com/cognitedata/cognite-sdk-js/commit/445c39ff90822a357e20e624828bcd6e2ee36369))





## [4.1.7](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.1.6...@cognite/sdk-core@4.1.7) (2022-05-23)


### Bug Fixes

* wrong token returned ([#807](https://github.com/cognitedata/cognite-sdk-js/issues/807)) ([420b741](https://github.com/cognitedata/cognite-sdk-js/commit/420b74150cec75ab6ef03f0c119f9dc2a96280bf))





## [4.1.6](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.1.5...@cognite/sdk-core@4.1.6) (2022-05-20)


### Bug Fixes

* 401 not authorized ([#804](https://github.com/cognitedata/cognite-sdk-js/issues/804)) ([0b4d8be](https://github.com/cognitedata/cognite-sdk-js/commit/0b4d8beb666aff24dbb1309b552193cdd1d80f94))





## [4.1.5](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.1.4...@cognite/sdk-core@4.1.5) (2022-05-20)


### Reverts

* Revert "fix: fixing 401 problem (#800)" (#802) ([341b68d](https://github.com/cognitedata/cognite-sdk-js/commit/341b68dd271b7781489343637c861921d647b483)), closes [#800](https://github.com/cognitedata/cognite-sdk-js/issues/800) [#802](https://github.com/cognitedata/cognite-sdk-js/issues/802)





## [4.1.4](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.1.3...@cognite/sdk-core@4.1.4) (2022-05-19)


### Bug Fixes

* fixing 401 problem ([#800](https://github.com/cognitedata/cognite-sdk-js/issues/800)) ([b5789b1](https://github.com/cognitedata/cognite-sdk-js/commit/b5789b1a15ed9fb574c636c5515c85a2868b60a2))





## [4.1.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.1.2...@cognite/sdk-core@4.1.3) (2022-05-16)


### Bug Fixes

* fixing missing token when call sdk methods using Promises ([#789](https://github.com/cognitedata/cognite-sdk-js/issues/789)) ([6a6d62a](https://github.com/cognitedata/cognite-sdk-js/commit/6a6d62a6744f94bef46e8fe1b397d07e8f9de873))





## [4.1.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.1.1...@cognite/sdk-core@4.1.2) (2022-05-13)


### Bug Fixes

* adding @types/geojson to core package ([#780](https://github.com/cognitedata/cognite-sdk-js/issues/780)) ([b8b5715](https://github.com/cognitedata/cognite-sdk-js/commit/b8b57155f1e40df33743a61bad8fce63fe2d247f))





## [4.1.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.1.0...@cognite/sdk-core@4.1.1) (2022-03-01)

**Note:** Version bump only for package @cognite/sdk-core





# [4.1.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.0.4...@cognite/sdk-core@4.1.0) (2022-01-10)


### Features

* **core:** add generic for id, path to aggregate ([#726](https://github.com/cognitedata/cognite-sdk-js/issues/726)) ([b927e24](https://github.com/cognitedata/cognite-sdk-js/commit/b927e24c044eb934bbc0fd74975b64660f8b599f))





## [4.0.4](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.0.3...@cognite/sdk-core@4.0.4) (2021-12-21)


### Bug Fixes

* use case-insensitive lookup for http header ([#724](https://github.com/cognitedata/cognite-sdk-js/issues/724)) ([e0f803f](https://github.com/cognitedata/cognite-sdk-js/commit/e0f803f79ae3bae2e6282bd8bfacab40bbf38050))





## [4.0.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.0.2...@cognite/sdk-core@4.0.3) (2021-12-07)


### Bug Fixes

* retry 429 responses, and fallback to text() if responseHandler fails [BEST-902] ([#705](https://github.com/cognitedata/cognite-sdk-js/issues/705)) ([f02946f](https://github.com/cognitedata/cognite-sdk-js/commit/f02946ff51382bec2a291f5f746dbf87a3bcbec1))





## [4.0.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.0.1...@cognite/sdk-core@4.0.2) (2021-10-29)

**Note:** Version bump only for package @cognite/sdk-core





## [4.0.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@4.0.0...@cognite/sdk-core@4.0.1) (2021-10-19)


### Bug Fixes

* **core:** re-export project name from sdk ([#706](https://github.com/cognitedata/cognite-sdk-js/issues/706)) ([34341f0](https://github.com/cognitedata/cognite-sdk-js/commit/34341f09222c0bb35578fa02f76aecf4aefbf01f))





# [4.0.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.4.1...@cognite/sdk-core@4.0.0) (2021-10-12)


### Features

* **auth:** re-release auth patch ([#700](https://github.com/cognitedata/cognite-sdk-js/issues/700)) ([a53c40d](https://github.com/cognitedata/cognite-sdk-js/commit/a53c40ddd7eca5d2dee9149f5df0b2e533d19575))


### BREAKING CHANGES

* **auth:** release v6

re-release (revert reversion) of "feat(core): move authentication out of CogniteClient"
https://github.com/cognitedata/cognite-sdk-js/pull/687

This reverts commit 72e1ecb61603e0ac3926124c26f4e009df88f020.

Co-authored-by: Vegard Økland <vegard.okland@cognite.com>





## [3.4.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.4.0...@cognite/sdk-core@3.4.1) (2021-10-12)


### Bug Fixes

* **release:** undo major version release without major version bump ([#697](https://github.com/cognitedata/cognite-sdk-js/issues/697)) ([72e1ecb](https://github.com/cognitedata/cognite-sdk-js/commit/72e1ecb61603e0ac3926124c26f4e009df88f020)), closes [#687](https://github.com/cognitedata/cognite-sdk-js/issues/687)





# [3.4.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.3.0...@cognite/sdk-core@3.4.0) (2021-10-12)


### Features

* **core:** move authentication out of CogniteClient ([#687](https://github.com/cognitedata/cognite-sdk-js/issues/687)) ([879ed31](https://github.com/cognitedata/cognite-sdk-js/commit/879ed31d05dd6d6f4b691b99eaca5fa7363e96e6))





# [3.3.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.2.5...@cognite/sdk-core@3.3.0) (2021-10-07)


### Features

* **spatial:** adds spatial API to playground ([#680](https://github.com/cognitedata/cognite-sdk-js/issues/680)) ([e0b2d1d](https://github.com/cognitedata/cognite-sdk-js/commit/e0b2d1dd6ac85eb6fd8a6d6fce61e26cc909c5e7))





## [3.2.5](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.2.4...@cognite/sdk-core@3.2.5) (2021-09-20)


### Bug Fixes

* better error message for flow param ([#681](https://github.com/cognitedata/cognite-sdk-js/issues/681)) ([31bb98b](https://github.com/cognitedata/cognite-sdk-js/commit/31bb98b8078ce1f30799fcc499bed23b2891c2d1))





## [3.2.4](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.2.3...@cognite/sdk-core@3.2.4) (2021-09-03)


### Bug Fixes

* remove test files in published packages ([#673](https://github.com/cognitedata/cognite-sdk-js/issues/673)) ([cf6deae](https://github.com/cognitedata/cognite-sdk-js/commit/cf6deae6d80d0bfb3b2b3e8a8db6c30a1bb1ec0a))





## [3.2.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.2.2...@cognite/sdk-core@3.2.3) (2021-08-20)

**Note:** Version bump only for package @cognite/sdk-core





## [3.2.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.2.1...@cognite/sdk-core@3.2.2) (2021-08-11)


### Bug Fixes

* **core:** headers set by the sdk must respect case insensitive keys ([#627](https://github.com/cognitedata/cognite-sdk-js/issues/627)) ([02703c5](https://github.com/cognitedata/cognite-sdk-js/commit/02703c53fc7e8779a8f01cc2da403d32208d9acb))





## [3.2.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.2.0...@cognite/sdk-core@3.2.1) (2021-08-10)


### Bug Fixes

* **core:** remove slash suffix from uris [release] ([#628](https://github.com/cognitedata/cognite-sdk-js/issues/628)) ([fe65d57](https://github.com/cognitedata/cognite-sdk-js/commit/fe65d57a4ce9f6fc37ce37ad2d295ef8006c603c))





# [3.2.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.1.2...@cognite/sdk-core@3.2.0) (2021-07-21)


### Features

* add custom login flow method [release] ([#620](https://github.com/cognitedata/cognite-sdk-js/issues/620)) ([d99a2aa](https://github.com/cognitedata/cognite-sdk-js/commit/d99a2aa25aa6a271c09c4cfc944e825047dec72a))





## [3.1.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.1.1...@cognite/sdk-core@3.1.2) (2021-07-21)


### Bug Fixes

* silentlogin added for oidc ([#619](https://github.com/cognitedata/cognite-sdk-js/issues/619)) ([b7977eb](https://github.com/cognitedata/cognite-sdk-js/commit/b7977eba255cda3b11d792b2934933854556c67c))





## [3.1.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.1.0...@cognite/sdk-core@3.1.1) (2021-07-21)


### Bug Fixes

* revert client credentials [release] ([#618](https://github.com/cognitedata/cognite-sdk-js/issues/618)) ([08a0d8c](https://github.com/cognitedata/cognite-sdk-js/commit/08a0d8cf01105aa326e73d93c703c7fc0ee6f68d))





# [3.1.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@3.0.0...@cognite/sdk-core@3.1.0) (2021-07-20)


### Features

* client credentials flow [release] ([#607](https://github.com/cognitedata/cognite-sdk-js/issues/607)) ([28ed890](https://github.com/cognitedata/cognite-sdk-js/commit/28ed890ebf15da151e05cf0c487bca4b91b8ea96))
* expose id token of AAD/ADFS/OIDC in one method ([#616](https://github.com/cognitedata/cognite-sdk-js/issues/616)) ([5179796](https://github.com/cognitedata/cognite-sdk-js/commit/5179796f83c51d6cec4323bf7ed06e6ea3df2434))





# [3.0.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk-core@2.2.0...@cognite/sdk-core@3.0.0) (2021-07-15)


### Features

* **core:** add oidc auth code flow [release] ([#587](https://github.com/cognitedata/cognite-sdk-js/issues/587)) ([0cc44aa](https://github.com/cognitedata/cognite-sdk-js/commit/0cc44aa82b7d7461e8629fe2e712f743bf6c7138))


### BREAKING CHANGES

* **core:** stop silencing errors from aad

* **core:** change loginWithOAuth API signature



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

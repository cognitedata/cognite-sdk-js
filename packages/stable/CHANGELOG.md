# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [9.7.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@9.7.0...@cognite/sdk@9.7.1) (2024-01-22)

**Note:** Version bump only for package @cognite/sdk

# [9.7.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@9.6.2...@cognite/sdk@9.7.0) (2024-01-18)

### Features

- instances/search and instances/list ([#1047](https://github.com/cognitedata/cognite-sdk-js/issues/1047)) ([84e5ea2](https://github.com/cognitedata/cognite-sdk-js/commit/84e5ea23f265a54aeafc0aa83e4607a7d1262d7c))

## [9.6.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@9.6.1...@cognite/sdk@9.6.2) (2023-12-22)

### Bug Fixes

- set empty array for no results ([#1046](https://github.com/cognitedata/cognite-sdk-js/issues/1046)) ([0ae93aa](https://github.com/cognitedata/cognite-sdk-js/commit/0ae93aa0e0ba55db9741138fc9b046a26e755883))

## [9.6.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@9.6.0...@cognite/sdk@9.6.1) (2023-12-19)

### Bug Fixes

- return all time series when asking for multiple time series of monthly aggregates ([#1045](https://github.com/cognitedata/cognite-sdk-js/issues/1045)) ([129de8b](https://github.com/cognitedata/cognite-sdk-js/commit/129de8be32f4cd8c6c2bb0910accd17df618f7d9))

# [9.6.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@9.5.0...@cognite/sdk@9.6.0) (2023-12-06)

### Features

- user profiles api ([#1019](https://github.com/cognitedata/cognite-sdk-js/issues/1019)) ([33eee73](https://github.com/cognitedata/cognite-sdk-js/commit/33eee73e40d8306ee145301641d7af1cdba2e3c5))

# [9.5.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@9.4.0...@cognite/sdk@9.5.0) (2023-12-01)

### Features

- **annotations:** generate annotations for isolation planning app ([#1033](https://github.com/cognitedata/cognite-sdk-js/issues/1033)) ([30418ac](https://github.com/cognitedata/cognite-sdk-js/commit/30418acb31d4a553a0c0d9174d5ae50c8b1c8d8e))

# [9.4.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@9.3.0...@cognite/sdk@9.4.0) (2023-11-28)

### Features

- add units catalog and timeseries unit conversion ([#1027](https://github.com/cognitedata/cognite-sdk-js/issues/1027)) ([89cffa8](https://github.com/cognitedata/cognite-sdk-js/commit/89cffa8d7a1401274f52008b7bd7745683a2d817))

# [9.3.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@9.2.1...@cognite/sdk@9.3.0) (2023-11-28)

### Features

- monitoring tasks upsert ([#1042](https://github.com/cognitedata/cognite-sdk-js/issues/1042)) ([7e0e24c](https://github.com/cognitedata/cognite-sdk-js/commit/7e0e24cfb5c4d91302e54a270457b8d9b914ffd4))

## [9.2.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@9.2.0...@cognite/sdk@9.2.1) (2023-11-24)

### Bug Fixes

- use UTC timezone regardless of client time zone ([#1040](https://github.com/cognitedata/cognite-sdk-js/issues/1040)) ([ad717bd](https://github.com/cognitedata/cognite-sdk-js/commit/ad717bd96ad4c3a5dbb6019b418417b23098c689))

# [9.2.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@9.1.0...@cognite/sdk@9.2.0) (2023-11-23)

### Features

- **stable:** generate new types ([#1039](https://github.com/cognitedata/cognite-sdk-js/issues/1039)) ([4dd4e5c](https://github.com/cognitedata/cognite-sdk-js/commit/4dd4e5c594d2db01d7d5051a4b96d01212122f84))

# [9.1.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@9.0.0...@cognite/sdk@9.1.0) (2023-11-21)

### Features

- **monthly aggregate:** retrieve datapoints where granularity set as month ([#1034](https://github.com/cognitedata/cognite-sdk-js/issues/1034)) ([4e4145d](https://github.com/cognitedata/cognite-sdk-js/commit/4e4145d8d4c560779b847d530311820723950a19))

# [9.0.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@8.3.0...@cognite/sdk@9.0.0) (2023-10-10)

### Features

- update openapi spec to bump types for docs, annotations and vision ([#1021](https://github.com/cognitedata/cognite-sdk-js/issues/1021)) ([#1024](https://github.com/cognitedata/cognite-sdk-js/issues/1024)) ([e337d73](https://github.com/cognitedata/cognite-sdk-js/commit/e337d73c9e6a1888e165d8b4a59bfe94b522bbb3))

### BREAKING CHANGES

- documents, annotations and vision types have been updated

Thanks to @danlevings for his work in commit: https://github.com/cognitedata/cognite-sdk-js/commit/ac6efec6e884d0cb436be7c2e91f3aa78bfbe15c

# [8.3.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@8.2.0...@cognite/sdk@8.3.0) (2023-09-27)

### Features

- **alpha:** monitoring task add source and sourceId props - [AH-1863] ([#1020](https://github.com/cognitedata/cognite-sdk-js/issues/1020)) ([506ad9b](https://github.com/cognitedata/cognite-sdk-js/commit/506ad9be6368322f08ac606642414a37f37cec67))

### Reverts

- "feat: update openapi spec to bump types fo docs, annotations and vision" ([#1021](https://github.com/cognitedata/cognite-sdk-js/issues/1021)) ([b908def](https://github.com/cognitedata/cognite-sdk-js/commit/b908defed27eb610c8c7b97d2c24013da735422f))

# [8.2.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@8.1.1...@cognite/sdk@8.2.0) (2023-06-20)

### Features

- annotation reverse-lookup [release] ([#1010](https://github.com/cognitedata/cognite-sdk-js/issues/1010)) ([8e8844d](https://github.com/cognitedata/cognite-sdk-js/commit/8e8844d46d16cbc7278ccf92b605248ed32604a2))

## [8.1.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@8.1.0...@cognite/sdk@8.1.1) (2023-04-28)

**Note:** Version bump only for package @cognite/sdk

# [8.1.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@8.0.1...@cognite/sdk@8.1.0) (2023-04-27)

### Features

- **project:** project update user profiles ([#1009](https://github.com/cognitedata/cognite-sdk-js/issues/1009)) ([ee3d952](https://github.com/cognitedata/cognite-sdk-js/commit/ee3d952635580c87624a48b480d1c2cc1a73817c))

## [8.0.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@8.0.0...@cognite/sdk@8.0.1) (2023-04-20)

**Note:** Version bump only for package @cognite/sdk

# [8.0.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.19.1...@cognite/sdk@8.0.0) (2023-03-21)

### Features

- **documents:** update uniqueProperties and allUniqueProperties ([#992](https://github.com/cognitedata/cognite-sdk-js/issues/992)) ([e9dfbc6](https://github.com/cognitedata/cognite-sdk-js/commit/e9dfbc611d870c1efcc81f6eedd57daa25fa3129))

### BREAKING CHANGES

- **documents:** uniqueProperties has a different value type and no longer supports CursorAndAsyncIterator. Please use allUniqueProperties for pagination instead.

## [7.19.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.19.0...@cognite/sdk@7.19.1) (2023-03-01)

**Note:** Version bump only for package @cognite/sdk

# [7.19.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.18.0...@cognite/sdk@7.19.0) (2023-02-08)

### Features

- **documents:** add `highlight` field for document search ([#977](https://github.com/cognitedata/cognite-sdk-js/issues/977)) ([8a02727](https://github.com/cognitedata/cognite-sdk-js/commit/8a02727aaa4344232c815d884e02b385b9e3915a))

# [7.18.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.17.0...@cognite/sdk@7.18.0) (2023-01-24)

### Features

- support names filter for 3D list nodes endpoint [release] ([#939](https://github.com/cognitedata/cognite-sdk-js/issues/939)) ([3a3e03f](https://github.com/cognitedata/cognite-sdk-js/commit/3a3e03f9c9a6e13b365362694c0720d8894bad2b))

# [7.17.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.16.0...@cognite/sdk@7.17.0) (2023-01-23)

### Features

- **documents:** add new document search functionality ([#937](https://github.com/cognitedata/cognite-sdk-js/issues/937)) ([9aee431](https://github.com/cognitedata/cognite-sdk-js/commit/9aee43199071b6101264a357302b673ffdde4fc6))

# [7.16.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.15.0...@cognite/sdk@7.16.0) (2023-01-23)

### Features

- translation and scale for 3D revisions [release] ([#938](https://github.com/cognitedata/cognite-sdk-js/issues/938)) ([30921ee](https://github.com/cognitedata/cognite-sdk-js/commit/30921ee6bdaa167a9f42e2c3bbc968084e549a5c))

# [7.15.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.14.1...@cognite/sdk@7.15.0) (2023-01-09)

### Features

- **documents:** add asset subtree filter ([#935](https://github.com/cognitedata/cognite-sdk-js/issues/935)) ([ba5e6a1](https://github.com/cognitedata/cognite-sdk-js/commit/ba5e6a1510fa7f14399c4400d37600b2042b9e45))

## [7.14.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.14.0...@cognite/sdk@7.14.1) (2023-01-06)

### Bug Fixes

- **stable:** document preview fields that were optional ([#933](https://github.com/cognitedata/cognite-sdk-js/issues/933)) ([f011dad](https://github.com/cognitedata/cognite-sdk-js/commit/f011dad9554d04619a4a0ce05242c49c8cf6d463))

# [7.14.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.13.0...@cognite/sdk@7.14.0) (2022-12-09)

### Bug Fixes

- add codegen support for CusrorAndAsyncIterator ([#907](https://github.com/cognitedata/cognite-sdk-js/issues/907)) ([3cde0d3](https://github.com/cognitedata/cognite-sdk-js/commit/3cde0d3df8a4135f38849a2cd6408ded32246065)), closes [#908](https://github.com/cognitedata/cognite-sdk-js/issues/908)

### Features

- **alpha:** monitoring tasks api ([#921](https://github.com/cognitedata/cognite-sdk-js/issues/921)) ([9161a69](https://github.com/cognitedata/cognite-sdk-js/commit/9161a69e2b0f4093099e0f36a79c0abefce6723c))

# [7.13.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.12.0...@cognite/sdk@7.13.0) (2022-11-21)

### Features

- geospatial compute endpoint ([#899](https://github.com/cognitedata/cognite-sdk-js/issues/899)) ([7496ad0](https://github.com/cognitedata/cognite-sdk-js/commit/7496ad023b970baac0857ea35dd7356d6fbebeee))

# [7.12.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.11.1...@cognite/sdk@7.12.0) (2022-11-18)

### Features

- **annotations:** add `description` ([#918](https://github.com/cognitedata/cognite-sdk-js/issues/918)) ([aefa215](https://github.com/cognitedata/cognite-sdk-js/commit/aefa215f8a78cc8ee370098757b2f65948648425))

## [7.11.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.11.0...@cognite/sdk@7.11.1) (2022-11-17)

**Note:** Version bump only for package @cognite/sdk

# [7.11.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.10.0...@cognite/sdk@7.11.0) (2022-11-02)

### Features

- **geospatial:** add feature list ([#900](https://github.com/cognitedata/cognite-sdk-js/issues/900)) ([fa71394](https://github.com/cognitedata/cognite-sdk-js/commit/fa71394748f661a79c62707f97ba671d9563e01a))

# [7.10.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.9.6...@cognite/sdk@7.10.0) (2022-10-28)

### Features

- **annotations:** add annotation payload types ([#905](https://github.com/cognitedata/cognite-sdk-js/issues/905)) ([990ea8f](https://github.com/cognitedata/cognite-sdk-js/commit/990ea8fda85bc26e9a50bd9160c6b8a76e26ed55))

## [7.9.6](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.9.5...@cognite/sdk@7.9.6) (2022-10-04)

### Bug Fixes

- move `@types/geojson` to depedencies ([#897](https://github.com/cognitedata/cognite-sdk-js/issues/897)) ([66b3bb0](https://github.com/cognitedata/cognite-sdk-js/commit/66b3bb0b8d37d814d5bb0dcc35b576fe924abce3))

## [7.9.5](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.9.4...@cognite/sdk@7.9.5) (2022-09-26)

**Note:** Version bump only for package @cognite/sdk

## [7.9.4](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.9.3...@cognite/sdk@7.9.4) (2022-09-23)

**Note:** Version bump only for package @cognite/sdk

## [7.9.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.9.2...@cognite/sdk@7.9.3) (2022-09-23)

**Note:** Version bump only for package @cognite/sdk

## [7.9.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.9.1...@cognite/sdk@7.9.2) (2022-09-23)

### Bug Fixes

- ensure response ordering matches request when chunking a request ([#893](https://github.com/cognitedata/cognite-sdk-js/issues/893)) ([77eb797](https://github.com/cognitedata/cognite-sdk-js/commit/77eb7976abb21029c22a16c0ceeb22d577d1ce68))

## [7.9.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.9.0...@cognite/sdk@7.9.1) (2022-09-12)

**Note:** Version bump only for package @cognite/sdk

# [7.9.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.8.7...@cognite/sdk@7.9.0) (2022-09-12)

### Features

- move vision extract api to v1 ([#872](https://github.com/cognitedata/cognite-sdk-js/issues/872)) ([23d0218](https://github.com/cognitedata/cognite-sdk-js/commit/23d021863020bc3e8caf2ad94caafefe1d1e405a)), closes [#873](https://github.com/cognitedata/cognite-sdk-js/issues/873)

## [7.8.7](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.8.6...@cognite/sdk@7.8.7) (2022-09-07)

**Note:** Version bump only for package @cognite/sdk

## [7.8.6](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.8.5...@cognite/sdk@7.8.6) (2022-09-07)

### Bug Fixes

- don't retry 401 requests ([#868](https://github.com/cognitedata/cognite-sdk-js/issues/868)) ([4d17461](https://github.com/cognitedata/cognite-sdk-js/commit/4d174616ccf8ddfafed8a45b64d99e5ceaa06ce7))

## [7.8.5](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.8.4...@cognite/sdk@7.8.5) (2022-09-06)

**Note:** Version bump only for package @cognite/sdk

## [7.8.4](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.8.3...@cognite/sdk@7.8.4) (2022-08-31)

**Note:** Version bump only for package @cognite/sdk

## [7.8.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.8.2...@cognite/sdk@7.8.3) (2022-08-21)

**Note:** Version bump only for package @cognite/sdk

## [7.8.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.8.1...@cognite/sdk@7.8.2) (2022-08-15)

**Note:** Version bump only for package @cognite/sdk

## [7.8.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.8.0...@cognite/sdk@7.8.1) (2022-08-05)

**Note:** Version bump only for package @cognite/sdk

# [7.8.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.7.1...@cognite/sdk@7.8.0) (2022-07-25)

### Features

- code generation for types based on openapi doc ([#801](https://github.com/cognitedata/cognite-sdk-js/issues/801)) ([07eb308](https://github.com/cognitedata/cognite-sdk-js/commit/07eb3087705c550758fcc9e1b12ea43428ecf79d)), closes [#820](https://github.com/cognitedata/cognite-sdk-js/issues/820)

## [7.7.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.7.0...@cognite/sdk@7.7.1) (2022-07-07)

**Note:** Version bump only for package @cognite/sdk

# [7.7.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.6.2...@cognite/sdk@7.7.0) (2022-06-20)

### Features

- **annotations:** move annotations to stable ([#823](https://github.com/cognitedata/cognite-sdk-js/issues/823)) ([b453685](https://github.com/cognitedata/cognite-sdk-js/commit/b4536855ad62e9888af11419b89af1621a50a7ff))

## [7.6.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.6.1...@cognite/sdk@7.6.2) (2022-06-17)

**Note:** Version bump only for package @cognite/sdk

## [7.6.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.6.0...@cognite/sdk@7.6.1) (2022-06-09)

**Note:** Version bump only for package @cognite/sdk

# [7.6.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.5.1...@cognite/sdk@7.6.0) (2022-06-02)

### Features

- automatic token management with @cognite/auth-wrapper ([#796](https://github.com/cognitedata/cognite-sdk-js/issues/796)) ([d13c53f](https://github.com/cognitedata/cognite-sdk-js/commit/d13c53f9d5a5e65d6e2fc7d1a0e2efe2d36e678c))
- automatic token management with @cognite/auth-wrapper ([#814](https://github.com/cognitedata/cognite-sdk-js/issues/814)) ([d2c3a30](https://github.com/cognitedata/cognite-sdk-js/commit/d2c3a3083746e234f5dfc3e290188414d9ea17a6))

### Reverts

- Revert "feat: automatic token management with @cognite/auth-wrapper (#796)" (#813) ([0a8a61c](https://github.com/cognitedata/cognite-sdk-js/commit/0a8a61c2b2c3d992f80b40f6282b20595537edac)), closes [#796](https://github.com/cognitedata/cognite-sdk-js/issues/796) [#813](https://github.com/cognitedata/cognite-sdk-js/issues/813)

## [7.5.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.5.0...@cognite/sdk@7.5.1) (2022-05-27)

### Bug Fixes

- **documents:** label type in documents ([#809](https://github.com/cognitedata/cognite-sdk-js/issues/809)) ([fd5dcf6](https://github.com/cognitedata/cognite-sdk-js/commit/fd5dcf6ba6401eade7ad4e9c1f970494223a8b4a))

# [7.5.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.4.0...@cognite/sdk@7.5.0) (2022-05-27)

### Features

- **documents:** aggregate api ([#793](https://github.com/cognitedata/cognite-sdk-js/issues/793)) ([445c39f](https://github.com/cognitedata/cognite-sdk-js/commit/445c39ff90822a357e20e624828bcd6e2ee36369))

# [7.4.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.3.4...@cognite/sdk@7.4.0) (2022-05-25)

### Features

- add fetchResources to relationships api ([#808](https://github.com/cognitedata/cognite-sdk-js/issues/808)) ([b37fdd2](https://github.com/cognitedata/cognite-sdk-js/commit/b37fdd230043c8c24af1e1fe6df339064d722636))

## [7.3.4](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.3.3...@cognite/sdk@7.3.4) (2022-05-23)

**Note:** Version bump only for package @cognite/sdk

## [7.3.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.3.2...@cognite/sdk@7.3.3) (2022-05-20)

### Bug Fixes

- 401 not authorized ([#804](https://github.com/cognitedata/cognite-sdk-js/issues/804)) ([0b4d8be](https://github.com/cognitedata/cognite-sdk-js/commit/0b4d8beb666aff24dbb1309b552193cdd1d80f94))

## [7.3.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.3.1...@cognite/sdk@7.3.2) (2022-05-20)

### Bug Fixes

- **geospatial:** change feature search stream response ([#805](https://github.com/cognitedata/cognite-sdk-js/issues/805)) ([4e207aa](https://github.com/cognitedata/cognite-sdk-js/commit/4e207aa41eab84a40968b9aed826ac29da7700d1))

### Reverts

- Revert "fix: fixing 401 problem (#800)" (#802) ([341b68d](https://github.com/cognitedata/cognite-sdk-js/commit/341b68dd271b7781489343637c861921d647b483)), closes [#800](https://github.com/cognitedata/cognite-sdk-js/issues/800) [#802](https://github.com/cognitedata/cognite-sdk-js/issues/802)

## [7.3.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.3.0...@cognite/sdk@7.3.1) (2022-05-19)

### Bug Fixes

- fixing 401 problem ([#800](https://github.com/cognitedata/cognite-sdk-js/issues/800)) ([b5789b1](https://github.com/cognitedata/cognite-sdk-js/commit/b5789b1a15ed9fb574c636c5515c85a2868b60a2))

# [7.3.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.2.5...@cognite/sdk@7.3.0) (2022-05-18)

### Features

- **documents:** content and list endpoints + stricter types ([#792](https://github.com/cognitedata/cognite-sdk-js/issues/792)) ([e906571](https://github.com/cognitedata/cognite-sdk-js/commit/e906571f0501312315b4a20909fb302ebc8a8827))

## [7.2.5](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.2.4...@cognite/sdk@7.2.5) (2022-05-16)

**Note:** Version bump only for package @cognite/sdk

## [7.2.4](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.2.3...@cognite/sdk@7.2.4) (2022-05-16)

### Bug Fixes

- use `type` field instead of instanceOf ([#761](https://github.com/cognitedata/cognite-sdk-js/issues/761)) ([45c5ca8](https://github.com/cognitedata/cognite-sdk-js/commit/45c5ca8a26f8dc6cbbd0efd9172d0fb1d7a842de))

## [7.2.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.2.2...@cognite/sdk@7.2.3) (2022-05-13)

### Bug Fixes

- adding @types/geojson to core package ([#780](https://github.com/cognitedata/cognite-sdk-js/issues/780)) ([b8b5715](https://github.com/cognitedata/cognite-sdk-js/commit/b8b57155f1e40df33743a61bad8fce63fe2d247f))

## [7.2.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.2.0...@cognite/sdk@7.2.2) (2022-04-12)

### Bug Fixes

- adding geojson to fix import problems ([#779](https://github.com/cognitedata/cognite-sdk-js/issues/779)) ([14d437a](https://github.com/cognitedata/cognite-sdk-js/commit/14d437af5e027ec7ef69b87442f1c0552fec7ee6))

# [7.2.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.1.1...@cognite/sdk@7.2.0) (2022-04-08)

### Features

- **documents:** add documents preview to stable ([#776](https://github.com/cognitedata/cognite-sdk-js/issues/776)) ([49f45f1](https://github.com/cognitedata/cognite-sdk-js/commit/49f45f1164f9af932eba56989172890ae2a55831))

## [7.1.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.1.0...@cognite/sdk@7.1.1) (2022-03-01)

**Note:** Version bump only for package @cognite/sdk

# [7.1.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@7.0.0...@cognite/sdk@7.1.0) (2022-02-09)

### Features

- **documents:** add document search API to stable ([#749](https://github.com/cognitedata/cognite-sdk-js/issues/749)) ([28c0a08](https://github.com/cognitedata/cognite-sdk-js/commit/28c0a0860e5d8ff1c8c1e6f48936eb4dec14341a)), closes [#753](https://github.com/cognitedata/cognite-sdk-js/issues/753) [#754](https://github.com/cognitedata/cognite-sdk-js/issues/754)

# [7.0.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@6.3.3...@cognite/sdk@7.0.0) (2022-01-10)

### chore

- **geospatial:** updates spatial to geospatial & type name changes ([#720](https://github.com/cognitedata/cognite-sdk-js/issues/720)) ([2e93d8b](https://github.com/cognitedata/cognite-sdk-js/commit/2e93d8b23de443e845eef1aa8dc9200483d27e76))

### Features

- **geospatial:** updates spatial to geospatial & type name ([#727](https://github.com/cognitedata/cognite-sdk-js/issues/727)) ([ad05a88](https://github.com/cognitedata/cognite-sdk-js/commit/ad05a885b6a16bd2ae5636fd2cbed2649dad5023))

### BREAKING CHANGES

- **geospatial:** updates spatial to geospatial & type name

- chore(geospatial): updates spatial to geospatial & types updated

- feat(geospatial): adds update api to featureType

- feat(geospatial): refactor feature APIs, filter types ,aggregateEndpoint

- chore(geospatial): place geojson type in stable package

- chore(geospatial): update types for breaking API changes

- chore(geospatial): updates Geospatial type

- chore(geospatial): remove filter bifurcation

- chore(geospatial): updates searchSpec

- chore(geospatial): adds crs & js code examples

- chore(geospatial): change generic id type for retrieve

- chore(geospatial): remove output params from delete feature

- chore(geospatial): change crs endpoint

- chore(geospatial): add more filters

- chore(geospatial): fix examples
- **geospatial:** changes api name from spatial to geospatial, features to feature & featureTypes to featureType

- feat(geospatial): adds update api to featureType

- feat(geospatial): refactor feature APIs, filter types ,aggregateEndpoint

- chore(geospatial): place geojson type in stable package

- chore(geospatial): update types for breaking API changes

- chore(geospatial): updates Geospatial type

- chore(geospatial): remove filter bifurcation

- chore(geospatial): updates searchSpec

- chore(geospatial): adds crs & js code examples

- chore(geospatial): change generic id type for retrieve

- chore(geospatial): remove output params from delete feature

- chore(geospatial): change crs endpoint

- chore(geospatial): add more filters

- chore(geospatial): fix example

- chore(geospatial): fix examples

## [6.3.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@6.3.2...@cognite/sdk@6.3.3) (2022-01-10)

**Note:** Version bump only for package @cognite/sdk

## [6.3.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@6.3.1...@cognite/sdk@6.3.2) (2021-12-21)

**Note:** Version bump only for package @cognite/sdk

## [6.3.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@6.3.0...@cognite/sdk@6.3.1) (2021-12-07)

**Note:** Version bump only for package @cognite/sdk

# [6.3.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@6.2.0...@cognite/sdk@6.3.0) (2021-11-19)

### Features

- add missing properties to update model ([#718](https://github.com/cognitedata/cognite-sdk-js/issues/718)) ([516fb20](https://github.com/cognitedata/cognite-sdk-js/commit/516fb20ea4d43949edb47244c7f9040e6d127dc9))

# [6.2.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@6.1.3...@cognite/sdk@6.2.0) (2021-11-17)

### Features

- add dataSetId support to 3dModel ([#665](https://github.com/cognitedata/cognite-sdk-js/issues/665)) ([cdea5a3](https://github.com/cognitedata/cognite-sdk-js/commit/cdea5a30cc3232af75f054c6322692801bcd8e87))

## [6.1.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@6.1.2...@cognite/sdk@6.1.3) (2021-11-04)

**Note:** Version bump only for package @cognite/sdk

## [6.1.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@6.1.1...@cognite/sdk@6.1.2) (2021-10-29)

**Note:** Version bump only for package @cognite/sdk

## [6.1.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@6.1.0...@cognite/sdk@6.1.1) (2021-10-19)

**Note:** Version bump only for package @cognite/sdk

# [6.1.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@6.0.0...@cognite/sdk@6.1.0) (2021-10-12)

### Features

- add dataSetId support to template groups ([#662](https://github.com/cognitedata/cognite-sdk-js/issues/662)) ([98827bc](https://github.com/cognitedata/cognite-sdk-js/commit/98827bcdb397484508ac36923b7006c4f140a43e))

# [6.0.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.6.1...@cognite/sdk@6.0.0) (2021-10-12)

### Features

- **auth:** re-release auth patch ([#700](https://github.com/cognitedata/cognite-sdk-js/issues/700)) ([a53c40d](https://github.com/cognitedata/cognite-sdk-js/commit/a53c40ddd7eca5d2dee9149f5df0b2e533d19575))

### BREAKING CHANGES

- **auth:** release v6

re-release (revert reversion) of "feat(core): move authentication out of CogniteClient"
https://github.com/cognitedata/cognite-sdk-js/pull/687

This reverts commit 72e1ecb61603e0ac3926124c26f4e009df88f020.

Co-authored-by: Vegard Økland <vegard.okland@cognite.com>

## [5.6.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.6.0...@cognite/sdk@5.6.1) (2021-10-12)

### Bug Fixes

- **release:** undo major version release without major version bump ([#697](https://github.com/cognitedata/cognite-sdk-js/issues/697)) ([72e1ecb](https://github.com/cognitedata/cognite-sdk-js/commit/72e1ecb61603e0ac3926124c26f4e009df88f020)), closes [#687](https://github.com/cognitedata/cognite-sdk-js/issues/687)

# [5.6.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.5.0...@cognite/sdk@5.6.0) (2021-10-12)

### Features

- **core:** move authentication out of CogniteClient ([#687](https://github.com/cognitedata/cognite-sdk-js/issues/687)) ([879ed31](https://github.com/cognitedata/cognite-sdk-js/commit/879ed31d05dd6d6f4b691b99eaca5fa7363e96e6))

# [5.5.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.4.0...@cognite/sdk@5.5.0) (2021-10-07)

### Features

- **spatial:** adds spatial API to playground ([#680](https://github.com/cognitedata/cognite-sdk-js/issues/680)) ([e0b2d1d](https://github.com/cognitedata/cognite-sdk-js/commit/e0b2d1dd6ac85eb6fd8a6d6fce61e26cc909c5e7))

# [5.4.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.3.3...@cognite/sdk@5.4.0) (2021-09-22)

### Features

- add types for template capabilities ([#679](https://github.com/cognitedata/cognite-sdk-js/issues/679)) ([1be2218](https://github.com/cognitedata/cognite-sdk-js/commit/1be2218ce6817f289d4541f18bd2df125f14343c))

## [5.3.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.3.2...@cognite/sdk@5.3.3) (2021-09-20)

**Note:** Version bump only for package @cognite/sdk

## [5.3.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.3.1...@cognite/sdk@5.3.2) (2021-09-03)

### Bug Fixes

- remove test files in published packages ([#673](https://github.com/cognitedata/cognite-sdk-js/issues/673)) ([cf6deae](https://github.com/cognitedata/cognite-sdk-js/commit/cf6deae6d80d0bfb3b2b3e8a8db6c30a1bb1ec0a))

## [5.3.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.3.0...@cognite/sdk@5.3.1) (2021-08-30)

### Bug Fixes

- **stable:** external id format for fetching rows ([#664](https://github.com/cognitedata/cognite-sdk-js/issues/664)) ([a637814](https://github.com/cognitedata/cognite-sdk-js/commit/a63781461544c6fefa9e9a0db54210e6544d7600))

# [5.3.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.2.1...@cognite/sdk@5.3.0) (2021-08-30)

### Features

- promote templates to stable ([#661](https://github.com/cognitedata/cognite-sdk-js/issues/661)) ([def00b6](https://github.com/cognitedata/cognite-sdk-js/commit/def00b654ad0696ef2be8dcd47a94fcd099f7277))

## [5.2.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.2.0...@cognite/sdk@5.2.1) (2021-08-20)

**Note:** Version bump only for package @cognite/sdk

# [5.2.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.1.5...@cognite/sdk@5.2.0) (2021-08-18)

### Features

- add update support template instances ([#634](https://github.com/cognitedata/cognite-sdk-js/issues/634)) ([15ca576](https://github.com/cognitedata/cognite-sdk-js/commit/15ca5762a8163fba8dd87d6a69124c4cf2c5dc38))

## [5.1.5](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.1.4...@cognite/sdk@5.1.5) (2021-08-11)

**Note:** Version bump only for package @cognite/sdk

## [5.1.4](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.1.3...@cognite/sdk@5.1.4) (2021-08-10)

**Note:** Version bump only for package @cognite/sdk

## [5.1.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.1.2...@cognite/sdk@5.1.3) (2021-07-21)

**Note:** Version bump only for package @cognite/sdk

## [5.1.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.1.1...@cognite/sdk@5.1.2) (2021-07-21)

**Note:** Version bump only for package @cognite/sdk

## [5.1.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.1.0...@cognite/sdk@5.1.1) (2021-07-21)

### Bug Fixes

- revert client credentials [release] ([#618](https://github.com/cognitedata/cognite-sdk-js/issues/618)) ([08a0d8c](https://github.com/cognitedata/cognite-sdk-js/commit/08a0d8cf01105aa326e73d93c703c7fc0ee6f68d))

# [5.1.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@5.0.0...@cognite/sdk@5.1.0) (2021-07-20)

### Features

- client credentials flow [release] ([#607](https://github.com/cognitedata/cognite-sdk-js/issues/607)) ([28ed890](https://github.com/cognitedata/cognite-sdk-js/commit/28ed890ebf15da151e05cf0c487bca4b91b8ea96))

# [5.0.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@4.3.1...@cognite/sdk@5.0.0) (2021-07-15)

### Features

- **core:** add oidc auth code flow [release] ([#587](https://github.com/cognitedata/cognite-sdk-js/issues/587)) ([0cc44aa](https://github.com/cognitedata/cognite-sdk-js/commit/0cc44aa82b7d7461e8629fe2e712f743bf6c7138))

### BREAKING CHANGES

- **core:** stop silencing errors from aad

- **core:** change loginWithOAuth API signature

## [4.3.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@4.3.0...@cognite/sdk@4.3.1) (2021-07-14)

**Note:** Version bump only for package @cognite/sdk

# [4.3.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@4.2.2...@cognite/sdk@4.3.0) (2021-07-08)

### Features

- **revisions3d:** parameter to update metadata property [release] ([#609](https://github.com/cognitedata/cognite-sdk-js/issues/609)) ([920ee0b](https://github.com/cognitedata/cognite-sdk-js/commit/920ee0b6992fb7ede4421983d59546864fb791b7))
- add accessor to filter 3d nodes endpoint ([#608](https://github.com/cognitedata/cognite-sdk-js/issues/608)) ([b64e39f](https://github.com/cognitedata/cognite-sdk-js/commit/b64e39f7397ecbc460d2844192bf569f780ed9cb))

## [4.2.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@4.2.1...@cognite/sdk@4.2.2) (2021-06-30)

### Reverts

- Revert "feat!: add client credentials flow (#589)" (#604) ([12d65a4](https://github.com/cognitedata/cognite-sdk-js/commit/12d65a41e919409582d76a3a59798737808cefac)), closes [#589](https://github.com/cognitedata/cognite-sdk-js/issues/589) [#604](https://github.com/cognitedata/cognite-sdk-js/issues/604)

## [4.2.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@4.2.0...@cognite/sdk@4.2.1) (2021-06-30)

**Note:** Version bump only for package @cognite/sdk

# [4.2.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@4.1.0...@cognite/sdk@4.2.0) (2021-06-30)

### Features

- appended oidc configuration to project response ([#576](https://github.com/cognitedata/cognite-sdk-js/issues/576)) ([2fd5fa4](https://github.com/cognitedata/cognite-sdk-js/commit/2fd5fa42d41d97623c2fba350a3846efef71ad2d))
- directoryPrefix filter for files [release] ([#590](https://github.com/cognitedata/cognite-sdk-js/issues/590)) ([ae59982](https://github.com/cognitedata/cognite-sdk-js/commit/ae599825f90c7fa1222f26c86fd4f79d9915f746))
- **project:** partial project update ([#573](https://github.com/cognitedata/cognite-sdk-js/issues/573)) ([230c23e](https://github.com/cognitedata/cognite-sdk-js/commit/230c23ef45028b025b85a3f020d31ee4e3a67a97))

# [4.1.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@4.0.4...@cognite/sdk@4.1.0) (2021-05-19)

### Features

- accessor for filtering 3D Asset Mappings [BND3D-676] ([#470](https://github.com/cognitedata/cognite-sdk-js/issues/470)) ([5e4de40](https://github.com/cognitedata/cognite-sdk-js/commit/5e4de403d2a7d088af1dbf451828ccdd56402756))

## [4.0.4](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@4.0.3...@cognite/sdk@4.0.4) (2021-04-30)

### Bug Fixes

- add cursor to Model3DListRequest ([#537](https://github.com/cognitedata/cognite-sdk-js/issues/537)) ([9a76843](https://github.com/cognitedata/cognite-sdk-js/commit/9a768438631c36707b2ec6a268f2eec602f127d2))

## [4.0.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@4.0.2...@cognite/sdk@4.0.3) (2021-04-26)

**Note:** Version bump only for package @cognite/sdk

## [4.0.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@4.0.1...@cognite/sdk@4.0.2) (2021-04-13)

**Note:** Version bump only for package @cognite/sdk

## [4.0.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@4.0.0...@cognite/sdk@4.0.1) (2021-04-08)

**Note:** Version bump only for package @cognite/sdk

# [4.0.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.5.2...@cognite/sdk@4.0.0) (2021-03-25)

**Note:** Version bump only for package @cognite/sdk

## [3.5.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.5.1...@cognite/sdk@3.5.2) (2021-03-25)

### Bug Fixes

- revert breaking changes being published as patch ([#503](https://github.com/cognitedata/cognite-sdk-js/issues/503)) ([3b7afd9](https://github.com/cognitedata/cognite-sdk-js/commit/3b7afd94030c75b2122a8e8323678455bcef0a29))

## [3.5.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.5.0...@cognite/sdk@3.5.1) (2021-03-25)

**Note:** Version bump only for package @cognite/sdk

# [3.5.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.4.0...@cognite/sdk@3.5.0) (2021-03-24)

### Features

- extend RawDB and RawDBTable interfaces ([#502](https://github.com/cognitedata/cognite-sdk-js/issues/502)) ([e1f8020](https://github.com/cognitedata/cognite-sdk-js/commit/e1f80200f189f9913619834c46546c3cdeb8f900))

# [3.4.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.3.6...@cognite/sdk@3.4.0) (2021-03-16)

### Bug Fixes

- 3d node sortByNodeId correct type ([#497](https://github.com/cognitedata/cognite-sdk-js/issues/497)) ([c53f92f](https://github.com/cognitedata/cognite-sdk-js/commit/c53f92fc9ece522f77cdea5b8440328c0027152f))

### Features

- add List 3D Nodes query parameters ([#494](https://github.com/cognitedata/cognite-sdk-js/issues/494)) ([11141c5](https://github.com/cognitedata/cognite-sdk-js/commit/11141c5ef43e99d966776534933941aaec095282))
- **entitymatching:** new stable api ([#491](https://github.com/cognitedata/cognite-sdk-js/issues/491)) ([e91e707](https://github.com/cognitedata/cognite-sdk-js/commit/e91e707d5a348537c24e3e27510580072e2acf71))

## [3.3.6](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.3.5...@cognite/sdk@3.3.6) (2021-03-05)

**Note:** Version bump only for package @cognite/sdk

## [3.3.5](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.3.4...@cognite/sdk@3.3.5) (2021-03-02)

**Note:** Version bump only for package @cognite/sdk

## [3.3.4](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.3.2...@cognite/sdk@3.3.4) (2021-03-01)

### Bug Fixes

- **timeseries:** synthetic/query is a retryable endpoint ([#475](https://github.com/cognitedata/cognite-sdk-js/issues/475)) ([7e03ae2](https://github.com/cognitedata/cognite-sdk-js/commit/7e03ae2f06d5c998c81d9e5ab743831f8cda9ead))

## [3.3.3](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.3.2...@cognite/sdk@3.3.3) (2021-02-26)

**Note:** Version bump only for package @cognite/sdk

## [3.3.2](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.3.1...@cognite/sdk@3.3.2) (2020-12-17)

**Note:** Version bump only for package @cognite/sdk

## [3.3.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.3.0...@cognite/sdk@3.3.1) (2020-12-14)

### Bug Fixes

- incorrect rotation types for 3d revision ([#452](https://github.com/cognitedata/cognite-sdk-js/issues/452)) ([4bfd3a5](https://github.com/cognitedata/cognite-sdk-js/commit/4bfd3a5efc6afcd4cd03ce6115254d24f61c483d))

# [3.3.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.2.1...@cognite/sdk@3.3.0) (2020-11-25)

### Bug Fixes

- datasets ID scope in datasets ACLs ([a9d7a44](https://github.com/cognitedata/cognite-sdk-js/commit/a9d7a440430c09ac8141fe8cc4799a43b7b70f9c))

### Features

- **relationships:** promote new api to stable ([526becc](https://github.com/cognitedata/cognite-sdk-js/commit/526beccaeb95371bc6504da2b434b6095415a878))

## [3.2.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.2.0...@cognite/sdk@3.2.1) (2020-11-18)

**Note:** Version bump only for package @cognite/sdk

# [3.2.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.1.1...@cognite/sdk@3.2.0) (2020-11-18)

### Features

- **files:** add geoLocation property ([#445](https://github.com/cognitedata/cognite-sdk-js/issues/445)) ([f5ff945](https://github.com/cognitedata/cognite-sdk-js/commit/f5ff945ab8548b3a811baf68e0830f1af90fd8f2))

## [3.1.1](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.1.0...@cognite/sdk@3.1.1) (2020-09-17)

**Note:** Version bump only for package @cognite/sdk

# [3.1.0](https://github.com/cognitedata/cognite-sdk-js/compare/@cognite/sdk@3.0.0...@cognite/sdk@3.1.0) (2020-09-10)

### Bug Fixes

- exports from packages, add guide for making derived SDKs ([#421](https://github.com/cognitedata/cognite-sdk-js/issues/421)) ([a3a2eb0](https://github.com/cognitedata/cognite-sdk-js/commit/a3a2eb03645733c289591b187f19e55b5294fbc7))

### Features

- add labels for files api ([#420](https://github.com/cognitedata/cognite-sdk-js/issues/420)) ([2c0356b](https://github.com/cognitedata/cognite-sdk-js/commit/2c0356bccef4f38b0365448f7eb66230ef6c9e53))

# 3.0.0 (2020-08-03)

### Bug Fixes

- make Node3D.boundingBox optional ([#403](https://github.com/cognitedata/cognite-sdk-js/issues/403)) ([768b0d9](https://github.com/cognitedata/cognite-sdk-js/commit/768b0d96de43f5a58da4b894993f484dd19dc75f))

### Features

- **datapoints:** add unit property to retrieve response ([5187c1c](https://github.com/cognitedata/cognite-sdk-js/commit/5187c1c2c30eaecbe7089770ad5c727735f71fd3))
- removed `AssetClass`, `AssetList`, `TimeseriesClass`, `TimeSeriesList` ([9315a95](https://github.com/cognitedata/cognite-sdk-js/commit/9315a95360561429af2e6f050a1e13f9ac9a2979))
- renamed interfaces ([#388](https://github.com/cognitedata/cognite-sdk-js/issues/388)) ([7f2ef5d](https://github.com/cognitedata/cognite-sdk-js/commit/7f2ef5d83869bffa932d8bc6f25a305e25a4e954))
- **avents-aggregate:** aggregates moved to separate api ([3f7f183](https://github.com/cognitedata/cognite-sdk-js/commit/3f7f183f02f230fa3d727c6b9dfe155c526d6d2c))

### BREAKING CHANGES

- Node3D.boundingBox has always been optional in API. This commit just fixes the bug in documentation.
- **core:** Fields that can have arbitrary string names (Raw, Metadata) are no longer converted to Date objects if their names happen to be:
  `createdTime`, `lastUpdatedTime`, `uploadedTime`, `deletedTime`, `timestamp`, `sourceCreatedTime` or `sourceModifiedTime`.

- Helper classes that have been removed:
  - AssetClass
  - AssetList
  - TimeseriesClass
  - TimeSeriesList

For replacements, see [MIGRATION_GUIDE_2xx_3xx.md](https://developer.cognite.com/sdks/js/migration/#upgrade-javascript-sdk-2-x-to-3-x)

- Interfaces renamed:

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

- Interfaces removed:

  - Filter (use TimeseriesFilter)
  - Search (use TimeseriesSearch)

- `timeseries.list()` signature is now consistent with other resource types

- **avents-aggregate:** Event aggregate methods moved to a separate api.

`client.events.aggregate(...)` -> `client.events.aggregate.count()`
`client.events.uniqueValuesAggregate(...)` -> `client.events.aggregate.uniqueValues(...)`

# [2.33.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.32.0...v2.33.0) (2020-07-09)

### Features

- **projects:** added application domains to the update object ([83c67ec](https://github.com/cognitedata/cognite-sdk-js/commit/83c67ec7c693eb4b0e7df0670299a7b27e99743e))

# [2.32.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.31.0...v2.32.0) (2020-06-26)

### Features

- **labels:** new resource type, works with assets ([e275b76](https://github.com/cognitedata/cognite-sdk-js/commit/e275b766d4ce82b264e23467dad59833679d2f53))
- **timeseries:** add synthetic timeseries query ([#375](https://github.com/cognitedata/cognite-sdk-js/issues/375)) ([72723d1](https://github.com/cognitedata/cognite-sdk-js/commit/72723d13d244c4dfb3aa556b0300f698dffcaa1e))

# [2.31.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.30.0...v2.31.0) (2020-06-23)

### Features

- **events:** unique values aggregate ([#377](https://github.com/cognitedata/cognite-sdk-js/issues/377)) ([d47152c](https://github.com/cognitedata/cognite-sdk-js/commit/d47152c4873274648e9bf525737810ef14e9572c))

# [2.30.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.29.0...v2.30.0) (2020-06-18)

### Features

- export Revision3DStatus type ([#374](https://github.com/cognitedata/cognite-sdk-js/issues/374)) ([54112f0](https://github.com/cognitedata/cognite-sdk-js/commit/54112f02a6dacd3afcbbdda529c762a156de25aa))

# [2.29.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.28.0...v2.29.0) (2020-06-08)

### Features

- **files:** create + update security categories ([#372](https://github.com/cognitedata/cognite-sdk-js/issues/372)) ([f7192ca](https://github.com/cognitedata/cognite-sdk-js/commit/f7192cae4d55192ae09d394718c755d025610ea4))

# [2.28.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.27.1...v2.28.0) (2020-05-19)

### Features

- **retrieve:** ignoreUnknownIds for events/sequences/files/timeseries ([a905795](https://github.com/cognitedata/cognite-sdk-js/commit/a905795a7bdeef49886c1cc687c1b6d8fe8fda42))

## [2.27.1](https://github.com/cognitedata/cognite-sdk-js/compare/v2.27.0...v2.27.1) (2020-04-29)

### Bug Fixes

- authentication with a token in node environment ([08b11b9](https://github.com/cognitedata/cognite-sdk-js/commit/08b11b97c5d2d7e90a5a74fc10f961ca46c8d796))

# [2.27.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.26.0...v2.27.0) (2020-04-28)

### Features

- **events:** filter for ongoing and active events ([#365](https://github.com/cognitedata/cognite-sdk-js/issues/365)) ([fb5d4e9](https://github.com/cognitedata/cognite-sdk-js/commit/fb5d4e943db17784ad5b5270a078276235416fe2))

# [2.26.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.25.0...v2.26.0) (2020-03-25)

### Features

- add 'extra' field to CogniteError ([#362](https://github.com/cognitedata/cognite-sdk-js/issues/362)) ([c263f6d](https://github.com/cognitedata/cognite-sdk-js/commit/c263f6de45f3b769416a34514335aceaa4179f0d))

# [2.25.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.24.1...v2.25.0) (2020-03-19)

### Features

- **timeseries, sequences, files:** added aggregate support ([0aa83b9](https://github.com/cognitedata/cognite-sdk-js/commit/0aa83b99b31d0c6323527317447d154d2b8b5d8c))

## [2.24.1](https://github.com/cognitedata/cognite-sdk-js/compare/v2.24.0...v2.24.1) (2020-03-11)

### Bug Fixes

- deploy pipeline ([#355](https://github.com/cognitedata/cognite-sdk-js/issues/355)) ([3ca80f2](https://github.com/cognitedata/cognite-sdk-js/commit/3ca80f2c0226ee12fb21e83944da2b7a5634528c))

# [2.24.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.23.0...v2.24.0) (2020-03-11)

### Features

- Introduce support for Data sets. Document and track data lineage, ensure data integrity, and allow 3rd parties to write their insights securely back to your Cognite Data Fusion (CDF) project. Learn more about data sets [here.](https://hub.cognite.com/product-updates/cognite-data-fusion-introducing-data-sets-369)

# [2.22.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.21.0...v2.22.0) (2020-03-05)

### Features

- **datapoints:** added ignoreUnknownIds to getAllDatapoints ([aa25062](https://github.com/cognitedata/cognite-sdk-js/commit/aa250621a860070260b024b00a06c598d687f2af))
- **datapoints:** added ignoreUnknownIds to retrieveLatest in datapoints ([60832e6](https://github.com/cognitedata/cognite-sdk-js/commit/60832e6d00ba915232433569cde9ec45312311ae))
- **events:** added type and subtype to event update ([e3fdf74](https://github.com/cognitedata/cognite-sdk-js/commit/e3fdf7407eeb6f59ba5fb8e75616b0b105a8cf6d))

# [2.21.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.20.0...v2.21.0) (2020-02-26)

### Features

- **assets-and-events:** aggregate endpoint ([#350](https://github.com/cognitedata/cognite-sdk-js/issues/350)) ([efe933f](https://github.com/cognitedata/cognite-sdk-js/commit/efe933f8f5577a32c6f93d2698025325ace20c9b))

# [2.20.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.19.0...v2.20.0) (2020-02-20)

### Features

- **assets:** ignoreUnknownIds and aggregates for retrieve(...) ([cb04c46](https://github.com/cognitedata/cognite-sdk-js/commit/cb04c46172e52bcae0409890faebecc1f50fad28))

# [2.19.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.18.0...v2.19.0) (2020-02-12)

### Features

- **assets:** added support for depth & path aggregates ([#347](https://github.com/cognitedata/cognite-sdk-js/issues/347)) ([367d163](https://github.com/cognitedata/cognite-sdk-js/commit/367d163c683d262f909d42c6685c8c4bd2ed5a35))

# [2.18.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.17.0...v2.18.0) (2020-02-11)

### Features

- add getDefaultRequestHeaders() to get headers required by the API ([c5f01eb](https://github.com/cognitedata/cognite-sdk-js/commit/c5f01eb2ac3f5938032a55ede184ec0b62ad2111))

# [2.17.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.16.2...v2.17.0) (2020-02-10)

### Bug Fixes

- correct type on deleteDatapointsEndpoint method ([32630b7](https://github.com/cognitedata/cognite-sdk-js/commit/32630b72c551991c74b9d99b50df14ac6f717264))

### Features

- return parentExternalId for assets ([#346](https://github.com/cognitedata/cognite-sdk-js/issues/346)) ([c464632](https://github.com/cognitedata/cognite-sdk-js/commit/c464632b9226ac89ac39955235a4c896c2a24c8c))

## [2.16.2](https://github.com/cognitedata/cognite-sdk-js/compare/v2.16.1...v2.16.2) (2020-01-17)

### Bug Fixes

- capitalize all HTTP method strings ([dedd4de](https://github.com/cognitedata/cognite-sdk-js/commit/dedd4de379c460b9dcdd370b44b0c4a7bdffd6a9))

## [2.16.1](https://github.com/cognitedata/cognite-sdk-js/compare/v2.16.0...v2.16.1) (2019-12-11)

### Bug Fixes

- support all query parameters on client.raw.listRows(...) ([03681cd](https://github.com/cognitedata/cognite-sdk-js/commit/03681cd9cb6823e7949f4605a404684b4c0a7556))

# [2.16.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.15.0...v2.16.0) (2019-12-11)

### Features

- support assetSubtreeIds and assetExternalIds filters ([2f34364](https://github.com/cognitedata/cognite-sdk-js/commit/2f34364af3423f4eabc9b8da7a01d1326c9b9354))
- **assets:** parentExternalIds filter ([3579640](https://github.com/cognitedata/cognite-sdk-js/commit/3579640b694ded55858b2409d6f316fab36d2f09))
- **files:** source created/modified time, rootAssetIds, assetSubtreeIds ([3886331](https://github.com/cognitedata/cognite-sdk-js/commit/388633134b5621cd4f85e07ae1d27904c807c261))
- **sequences:** assetSubtreeIds filter ([b5f7ece](https://github.com/cognitedata/cognite-sdk-js/commit/b5f7ece4ba91362fc403f80c3aa341e9c83763b7))

# [2.15.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.14.0...v2.15.0) (2019-12-02)

### Features

- add HTTP patch method to httpClient ([e37614d](https://github.com/cognitedata/cognite-sdk-js/commit/e37614d57a6f4bf2be29916960fab507d7129113))

# [2.14.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.13.0...v2.14.0) (2019-11-25)

### Features

- **capability:** add type for scope with time series ids ([5492adf](https://github.com/cognitedata/cognite-sdk-js/commit/5492adf5975e39c00210164bae3a50abf38b8d41))

# [2.13.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.12.0...v2.13.0) (2019-11-21)

### Features

- **asset mappings 3d:** add intersectsBoundingBox to filter [DEVX-185] ([a845b56](https://github.com/cognitedata/cognite-sdk-js/commit/a845b56b65c8d5fe4a699c10aead488179b4c44a))

# [2.12.0](https://github.com/cognitedata/cognite-sdk-js/compare/v2.11.1...v2.12.0) (2019-11-19)

### Features

- **events api:** support sorting [DEVX-145] ([97883ee](https://github.com/cognitedata/cognite-sdk-js/commit/97883eede2d6cdb88b466a11b12d4ae9f21cc6c8))

## [2.11.1](https://github.com/cognitedata/cognite-sdk-js/compare/v2.11.0...v2.11.1) (2019-11-18)

### Bug Fixes

- expose HttpError from main module ([12ecffa](https://github.com/cognitedata/cognite-sdk-js/commit/12ecffab8c4a2fa2ac0fe6e2d991922fbc87ea09))

# [2.11.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.10.0...v2.11.0) (2019-11-09)

### Features

- add support for one-time sdk header ([ff9931f](https://github.com/cognitedata/cognitesdk-js/commit/ff9931fa5763c8ac788d6b40a451e87edd9d160c))

# [2.10.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.9.0...v2.10.0) (2019-11-06)

### Features

- **assets, events:** add list partition parameter ([96db310](https://github.com/cognitedata/cognitesdk-js/commit/96db31019e87c2a73d6ab31a1ebac7137db73ed3))

# [2.9.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.8.0...v2.9.0) (2019-11-06)

### Features

- **timeseries:** support advanced filters, partitions [DEVX-162] ([fbd4d69](https://github.com/cognitedata/cognitesdk-js/commit/fbd4d69db17a9e6a4920d587899762ba4615a335))

# [2.8.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.7.2...v2.8.0) (2019-11-05)

### Features

- add query parameters for assets search ([#309](https://github.com/cognitedata/cognitesdk-js/issues/309)) ([438b134](https://github.com/cognitedata/cognitesdk-js/commit/438b1346b4995e8089c774132d5bf32db37906b4))

## [2.7.2](https://github.com/cognitedata/cognitesdk-js/compare/v2.7.1...v2.7.2) (2019-10-29)

### Bug Fixes

- assets acl actions enum didn't match API value [DEVX-126] ([98b3733](https://github.com/cognitedata/cognitesdk-js/commit/98b37331fd56a847b68ea4de2f721532696c4ac3))

## [2.7.1](https://github.com/cognitedata/cognitesdk-js/compare/v2.7.0...v2.7.1) (2019-10-22)

### Bug Fixes

- message serialisation for non-api errors ([b33e758](https://github.com/cognitedata/cognitesdk-js/commit/b33e7589ac6295c6d30185be5f04d5601675db3f))

# [2.7.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.6.1...v2.7.0) (2019-10-21)

### Features

- added withCredentials option to send raw HTTP request to other domains ([#299](https://github.com/cognitedata/cognitesdk-js/issues/299)) ([036dedc](https://github.com/cognitedata/cognitesdk-js/commit/036dedcbb8bf3e0e5df493401207bd25f84ea801))

## [2.6.1](https://github.com/cognitedata/cognitesdk-js/compare/v2.6.0...v2.6.1) (2019-10-13)

### Bug Fixes

- **autoPagination:** failing autoPagination - recursively add .next-property ([f7208cf](https://github.com/cognitedata/cognitesdk-js/commit/f7208cf4c5ef0135112ee6ba08c8ee163c65d616))

# [2.6.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.5.1...v2.6.0) (2019-10-07)

### Bug Fixes

- export asset and timeseries helper classes ([7cde371](https://github.com/cognitedata/cognitesdk-js/commit/7cde371))
- export auth-related types ([7f24e74](https://github.com/cognitedata/cognitesdk-js/commit/7f24e74))

### Features

- add metadata property to 3d models and revisions ([04bffc6](https://github.com/cognitedata/cognitesdk-js/commit/04bffc6))

## [2.5.1](https://github.com/cognitedata/cognitesdk-js/compare/v2.5.0...v2.5.1) (2019-10-07)

### Bug Fixes

- export error types from main module ([c5fc35d](https://github.com/cognitedata/cognitesdk-js/commit/c5fc35d))

# [2.5.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.4.3...v2.5.0) (2019-10-02)

### Features

- **new api:** sequences api support ([00bcb4a](https://github.com/cognitedata/cognitesdk-js/commit/00bcb4a))

## [2.4.3](https://github.com/cognitedata/cognitesdk-js/compare/v2.4.2...v2.4.3) (2019-09-27)

### Bug Fixes

- support baseUrl with path ([e8670a9](https://github.com/cognitedata/cognitesdk-js/commit/e8670a9))

## [2.4.2](https://github.com/cognitedata/cognitesdk-js/compare/v2.4.1...v2.4.2) (2019-09-25)

### Bug Fixes

- **OAuth:** add warning when using OAuth without SSL ([a81b08d](https://github.com/cognitedata/cognitesdk-js/commit/a81b08d))

## [2.4.1](https://github.com/cognitedata/cognitesdk-js/compare/v2.4.0...v2.4.1) (2019-09-18)

### Bug Fixes

- convert api class methods to arrow functions ([f200589](https://github.com/cognitedata/cognitesdk-js/commit/f200589))

# [2.4.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.3.1...v2.4.0) (2019-09-16)

### Features

- asset childCount-aggregates ([79129ce](https://github.com/cognitedata/cognitesdk-js/commit/79129ce))

## [2.3.1](https://github.com/cognitedata/cognitesdk-js/compare/v2.3.0...v2.3.1) (2019-09-16)

### Bug Fixes

- only data props on Timeseries and Asset class are enumerable ([a2f412d](https://github.com/cognitedata/cognitesdk-js/commit/a2f412d))

# [2.3.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.2.2...v2.3.0) (2019-09-10)

### Bug Fixes

- incorrect types on timeseries filters and missing filters ([363a00b](https://github.com/cognitedata/cognitesdk-js/commit/363a00b))
- safely delete assets with chunking ([424cba9](https://github.com/cognitedata/cognitesdk-js/commit/424cba9))

### Features

- custom toString & toJSON methods for resource class ([1eae87b](https://github.com/cognitedata/cognitesdk-js/commit/1eae87b))
- expose logout.getUrl() endpoint ([a85c4a0](https://github.com/cognitedata/cognitesdk-js/commit/a85c4a0))
- expose projectId on login.status() ([00ab757](https://github.com/cognitedata/cognitesdk-js/commit/00ab757))
- list 3d nodes with property filtering ([8b85817](https://github.com/cognitedata/cognitesdk-js/commit/8b85817))
- use cached access token to skip auth flow ([b28f506](https://github.com/cognitedata/cognitesdk-js/commit/b28f506))

## [2.2.2](https://github.com/cognitedata/cognitesdk-js/compare/v2.2.1...v2.2.2) (2019-08-12)

### Bug Fixes

- **delete datapoints:** make 'exclusiveEnd' filter prop as optional ([d7f2e82](https://github.com/cognitedata/cognitesdk-js/commit/d7f2e82))
- replaced tuple type with an array for better user experience ([d65e4eb](https://github.com/cognitedata/cognitesdk-js/commit/d65e4eb))

## [2.2.1](https://github.com/cognitedata/cognitesdk-js/compare/v2.2.0...v2.2.1) (2019-08-09)

### Bug Fixes

- retry ETIMEDOUT connection failures ([b82736c](https://github.com/cognitedata/cognitesdk-js/commit/b82736c))

# [2.2.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.1.0...v2.2.0) (2019-08-09)

### Features

- add timeSeries and timeSeriesList class ([#258](https://github.com/cognitedata/cognitesdk-js/issues/258)) ([2aeb12f](https://github.com/cognitedata/cognitesdk-js/commit/2aeb12f))

# [2.1.0](https://github.com/cognitedata/cognitesdk-js/compare/v2.0.4...v2.1.0) (2019-08-05)

### Features

- asset & assetList class ([66c4d5e](https://github.com/cognitedata/cognitesdk-js/commit/66c4d5e))

## [2.0.4](https://github.com/cognitedata/cognitesdk-js/compare/v2.0.3...v2.0.4) (2019-08-05)

### Bug Fixes

- added missing recursive flag to RAW deleteDatabase ([105cab0](https://github.com/cognitedata/cognitesdk-js/commit/105cab0))

## [2.0.3](https://github.com/cognitedata/cognitesdk-js/compare/v2.0.2...v2.0.3) (2019-08-01)

### Bug Fixes

- Added missing props to Event-filter ([33c7de0](https://github.com/cognitedata/cognitesdk-js/commit/33c7de0))
- Added missing rootId prop to Asset ([9e4a169](https://github.com/cognitedata/cognitesdk-js/commit/9e4a169))

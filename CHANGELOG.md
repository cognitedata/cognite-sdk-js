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

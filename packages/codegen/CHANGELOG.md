# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.0.0-development.0 (2025-09-25)


### Bug Fixes

* add codegen support for CusrorAndAsyncIterator  ([#907](https://github.com/cognitedata/cognite-sdk-js/issues/907)) ([3cde0d3](https://github.com/cognitedata/cognite-sdk-js/commit/3cde0d3df8a4135f38849a2cd6408ded32246065)), closes [#908](https://github.com/cognitedata/cognite-sdk-js/issues/908)


### Features

* add vision api ([#855](https://github.com/cognitedata/cognite-sdk-js/issues/855)) ([1d9116e](https://github.com/cognitedata/cognite-sdk-js/commit/1d9116ed53405c34b6c47b348644d093c61dde33))
* **annotations:** add annotation payload types ([#905](https://github.com/cognitedata/cognite-sdk-js/issues/905)) ([990ea8f](https://github.com/cognitedata/cognite-sdk-js/commit/990ea8fda85bc26e9a50bd9160c6b8a76e26ed55))
* code generation for types based on openapi doc ([#801](https://github.com/cognitedata/cognite-sdk-js/issues/801)) ([07eb308](https://github.com/cognitedata/cognite-sdk-js/commit/07eb3087705c550758fcc9e1b12ea43428ecf79d)), closes [#820](https://github.com/cognitedata/cognite-sdk-js/issues/820)
* release v10 [release] ([#1243](https://github.com/cognitedata/cognite-sdk-js/issues/1243)) ([b3d5595](https://github.com/cognitedata/cognite-sdk-js/commit/b3d55951bb2a302981fa67ce694d21749461386a)), closes [#1135](https://github.com/cognitedata/cognite-sdk-js/issues/1135) [#1144](https://github.com/cognitedata/cognite-sdk-js/issues/1144) [#1148](https://github.com/cognitedata/cognite-sdk-js/issues/1148) [#1150](https://github.com/cognitedata/cognite-sdk-js/issues/1150) [#1151](https://github.com/cognitedata/cognite-sdk-js/issues/1151) [#1152](https://github.com/cognitedata/cognite-sdk-js/issues/1152) [#1153](https://github.com/cognitedata/cognite-sdk-js/issues/1153) [#1029](https://github.com/cognitedata/cognite-sdk-js/issues/1029)
* update openapi spec to bump types for docs, annotations and vision ([#1021](https://github.com/cognitedata/cognite-sdk-js/issues/1021)) ([#1024](https://github.com/cognitedata/cognite-sdk-js/issues/1024)) ([e337d73](https://github.com/cognitedata/cognite-sdk-js/commit/e337d73c9e6a1888e165d8b4a59bfe94b522bbb3))


### Reverts

* "feat: update openapi spec to bump types fo docs, annotations and vision" ([#1021](https://github.com/cognitedata/cognite-sdk-js/issues/1021)) ([b908def](https://github.com/cognitedata/cognite-sdk-js/commit/b908defed27eb610c8c7b97d2c24013da735422f))


### BREAKING CHANGES

* es6 module (vs es5) and typescript 3 -> 5

* chore: release pre-release from the release-v10 branch

* test: skip flaky alerts test

* chore: trigger [release]

* chore(release): publish new package versions [skip ci]

 - @cognite/sdk-alpha@1.0.0-rc.0
 - @cognite/sdk-beta@6.0.0-rc.0
 - @cognite/sdk-core@5.0.0-rc.0
 - @cognite/sdk-playground@8.0.0-rc.0
 - @cognite/sdk@10.0.0-rc.0
* documents, annotations and vision types have been updated

Thanks to @danlevings for his work in commit: https://github.com/cognitedata/cognite-sdk-js/commit/ac6efec6e884d0cb436be7c2e91f3aa78bfbe15c

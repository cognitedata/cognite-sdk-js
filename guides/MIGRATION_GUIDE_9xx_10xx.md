# Migration guide: Upgrading from 9.x.x to 10.x.x

This guide provides instructions on migrating from SDK version 9.x.x to 10.x.x. While this major version upgrade includes breaking changes, most users should experience minimal disruption.

## CogniteClient Constructor Changes

The `getToken` property in the CogniteClient constructor has been renamed to `oidcTokenProvider`. Update your code accordingly:
```ts
// Before:
const client = new CogniteClient({ getToken: () => {}, ...})

// After:
const client = new CogniteClient({ oidcTokenProvider: () => {}, ...})
```
Using `getToken` is still supported but will trigger a console warning. [PR #1153](https://github.com/cognitedata/cognite-sdk-js/pull/1153)

## Breaking Changes

- **Deprecated API-key feature removed:** API-key authentication has been removed since the backend no longer supports it. [PR #1148](https://github.com/cognitedata/cognite-sdk-js/pull/1148)
- **Legacy authentication removed:** Removed support for deprecated authentication mechanisms. [PR #1150](https://github.com/cognitedata/cognite-sdk-js/pull/1150)
- **ADFS 2016 authentication removed:** No longer supported. [PR #1150](https://github.com/cognitedata/cognite-sdk-js/pull/1150)
- **Deprecated service account feature removed:** Note that this does not affect the upcoming new service account feature. [PR #1151](https://github.com/cognitedata/cognite-sdk-js/pull/1151)
- **Upgraded to TypeScript 5:** Ensure your code is compatible with TypeScript 5. [PR #1135](https://github.com/cognitedata/cognite-sdk-js/pull/1135)
- **Removed `update` and `updateProject` APIs from the Projects API:** These deprecated methods have been removed. [PR #1152](https://github.com/cognitedata/cognite-sdk-js/pull/1152)
- **Made `treeIndex` and `subtreeSize` optional in AssetMapping3D:** These fields are now optional. [PR #1029](https://github.com/cognitedata/cognite-sdk-js/pull/1029)
- **Removed deprecated Playground package:** The API is no longer supported. [PR #1218](https://github.com/cognitedata/cognite-sdk-js/pull/1218)
- **Removed noAuthMode option**: The same behavior can be achieved with a dummy `oidcTokenProvider` function. [PR #1150](https://github.com/cognitedata/cognite-sdk-js/pull/1150)


## New features:

- **Instance ID support added to Timeseries API** [PR #1165](https://github.com/cognitedata/cognite-sdk-js/pull/1165)
- **Instance ID support added to Files API** [PR #1166](https://github.com/cognitedata/cognite-sdk-js/pull/1166)
- **Asset instance (Core Data Modeling) support for 3D asset mappings:** Enhances 3D asset integration. [PR #1189](https://github.com/cognitedata/cognite-sdk-js/pull/1189)
- **CommonJS support added:** The SDK now ships both CommonJS and ES modules. [PR #1187](https://github.com/cognitedata/cognite-sdk-js/pull/1187), [PR #1135](https://github.com/cognitedata/cognite-sdk-js/pull/1135)
- **Exporting Data Modeling-related types:** Improves type availability for developers. [PR #1208](https://github.com/cognitedata/cognite-sdk-js/pull/1208)
- **Updated types for Vision and Annotations APIs:** Enhancements to API typings. [PR #1164](https://github.com/cognitedata/cognite-sdk-js/pull/1164)


## Documentation Updates

- **Cleaned up outdated samples:** Removed obsolete examples. [PR #1154](https://github.com/cognitedata/cognite-sdk-js/pull/1154)
- **Added Typedoc to core classes and improved contribution documentation:** Enhancements to developer resources. [PR #1156](https://github.com/cognitedata/cognite-sdk-js/pull/1156)

By following these updates, you can smoothly transition to SDK version 10.x.x while taking advantage of the latest features and improvements.

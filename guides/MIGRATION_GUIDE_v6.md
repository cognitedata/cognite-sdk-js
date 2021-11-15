# Version 6 breaking changes

## New authentication API

* New mandatory `getToken` argument to `CogniteClient` constructor

## General breaking changes

* `project` is changed from optional to mandatory constructor argument for `CogniteClient` and
  `setProject` is removed. Create a new SDK instance if you need to change the project.
* `setBaseUrl` removed, specify base url through constructor and make a new instance if you need a
  different base url.
* `CogniteClient#setOneTimeSdkHeader` removed

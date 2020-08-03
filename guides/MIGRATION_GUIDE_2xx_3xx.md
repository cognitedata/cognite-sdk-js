# Migration guide from 2.x.x to 3.x.x

Short migration guide on how to upgrade from SDK version 2.x.x to 3.x.x.

## Renamed interfaces

Some typescript interfaces has been renamed to comply the consistency between different resource types.
Among the most used ones:
- GetTimeSeriesMetadataDTO -> Timeseries
- PostTimeSeriesMetadataDTO -> ExternalTimeseries
- DatapointsGetAggregateDatapoint -> DatapointsAggregates
- FilesMetadata -> FileInfo
More comprehensive list can be found in [changelog](../packages/stable/CHANGELOG.md)

## Events aggregate endpoints moved to a sub-api 

- `client.events.aggregate(...)` -> `client.events.aggregate.count()`
- `client.events.uniqueValuesAggregate(...)` -> `client.events.aggregate.uniqueValues(...)`

## Timestamp-to-Date auto-conversion

The JavaScript SDK automatically converts response timestamp values to date objects. This caused a [bug](https://github.com/cognitedata/cognite-sdk-js/issues/333) in the Raw API. The fix can introduce a breaking change if you use the Raw API, and possibly in other places.

## Helper classes removed

AssetClass, TimeSeriesClass, TimeSeriesList and AssetList containing some helper methods has been removed.

Most of these helpers can be easily re-implemented using other SDK calls.

Some examples:

**Asset.delete()**
```ts
public async delete(options: DeleteOptions = {}) {
  return this.client.assets.delete(
    [{ id: this.id }],
    options
  );
}
```

**Asset.subtree()**
```ts
public async subtree() {
  const { items } = await client.assets.list({
    filter: {
      assetSubtreeIds: [{ id: this.id }],
    }
  });
}
```

**TimeSeriesList.getAllDatapoints(...)**
```ts
public getAllDatapoints = async (options: DatapointsMultiQueryBase = {}) => {
  const tsIds = this.map(({ id }) => ({ id }));
  return this.client.datapoints.retrieve({
    items: tsIds,
    ...options,
  });
};
```

## Removed client.assets.retrieveSubtree(...) 

Copies the functionality of `Asset.subtree()` (read above)

## Change filter passing to client.timeseries.list

The function previously took a `TimeseriesFilter` as input, but now takes a `TimeseriesFilterQuery` which
corresponds closely to the [API spec](https://docs.cognite.com/api/master/#operation/listTimeSeries).
All filter related fields should now be in the `filter` object.

### Example:
```ts
// Old way
const timeseries = await client.timeseries.list({ assetIds: [1, 2], unit: "liter", limit: 100});

//New way
const timeseries = await client.timeseries.list({ filter: { assetIds: [1, 2], unit: "liter" }, limit: 100});
```

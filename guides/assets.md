# Assets

<!--What are Assets?  Generic overview information-->

In Cognite Data Fusion, the [asset](https://docs.cognite.com/dev/concepts/resource_types/assets) **resource type** stores the **digital representations** of objects or groups of **objects from the physical world**. Water pumps, heart rate monitors, machine rooms, and production lines are examples for those assets.

:::info NOTE
**Note** A note to make is, all steps below you will need to be authenticated with [OIDC](./authentication.md#openid-connect-oidc).
:::

**In this article:**

- [Aggregate assets](#aggregate-assets)
- [Create a asset](#create-a-asset)
- [Delete assets](#delete-assets)
- [List assets](#list-assets)
- [Retrieve assets by id](#retrieve-assets-by-id)
- [Search for assets](#search-for-assets)
- [Update assets](#update-assets)

## Aggregate assets

Aggregate assets.

**_Parameters_**

| Properties                                                                                                          | Definition                                 |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **query** ([AssetAggregateQuery](https://cognitedata.github.io/cognite-sdk-js/interfaces/assetaggregatequery.html)) | Query schema for asset aggregate endpoint. |

**_Returns_**

| Return                    | Type                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| List of aggregated assets | Promise<[AssetAggregate](https://cognitedata.github.io/cognite-sdk-js/globals.html#assetaggregate)[]> |

**_Examples_**

Aggregating asset:

```ts
const filters: AssetAggregateQuery = { filter: { root: true } };

const aggregates: Promise<AggregateResponse[]> = await client.assets.aggregate(
  filters
);
```

## Create a asset

Creating assets.

**_Parameters_**

| Properties                                                                                                        | Definition                   |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **items** ([ExternalAssetItem](https://cognitedata.github.io/cognite-sdk-js/interfaces/externalassetitem.html)[]) | Array with asset properties. |

**_Returns_**

| Return                   | Type                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------- |
| List of requested assets | Promise<[Asset](https://cognitedata.github.io/cognite-sdk-js/interfaces/asset.html)[]> |

**_Examples_**

Creating a single asset:

```ts
const assets: ExternalAssetItem[] = [
  {
    name: 'First asset',
    description: 'My first asset',
    externalId: 'firstAsset',
  },
];

const createdAssets: Promise<Asset[]> = await client.assets.create(assets);
```

Creating multiple assets:

```ts
const assets: ExternalAssetItem[] = [
  { name: 'First asset' },
  {
    name: 'Second asset',
    description: 'Another asset',
    externalId: 'anotherAsset',
  },
  { name: 'Child asset', parentExternalId: 'anotherAsset' },
];

const createdAssets: Promise<Asset[]> = await client.assets.create(assets);
```

## Delete assets

Deleting assets.

**_Parameters_**

| Properties                                                                                                      | Definition                     |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **ids** ([AssetIdEither](https://cognitedata.github.io/cognite-sdk-js/globals.html#assetideither)[])            | Asset internal or externalIds. |
| **params** ([AssetDeleteParams](https://cognitedata.github.io/cognite-sdk-js/interfaces/assetdeleteparams.html) | (_Optional_). Delete params.   |

**_Returns_**

| Return        | Type        |
| ------------- | ----------- |
| Empty Promise | Promise<{}> |

**_Examples_**

Deleting single asset with id:

```ts
const ids: IdEither[] = [{ id: 123 }];

await client.assets.delete(ids);
```

Deleting multiple assets with id:

```ts
const ids: IdEither[] = [{ id: 123 }, { id: 456 }];

await client.assets.delete(ids);
```

Deleting single asset with externalId:

```ts
const ids: IdEither[] = [{ externalId: 'abc' }];

await client.assets.delete(ids);
```

Deleting multiple assets with externalId:

```ts
const ids: IdEither[] = [{ externalId: 'abc' }, { externalId: 'def' }];

await client.assets.delete(ids);
```

## List assets

Listing assets.

**_Parameters_**

| Properties                                                                                                | Definition                                          |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **scope** ([AssetListScope](https://cognitedata.github.io/cognite-sdk-js/interfaces/assetlistscope.html)) | (_Optional_). Query cursor, limit and some filters. |

**_Returns_**

| Return        | Type                                                                                                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Empty Promise | [CursorAndAsyncIterator](https://cognitedata.github.io/cognite-sdk-js/globals.html#cursorandasynciterator)<[Asset](https://cognitedata.github.io/cognite-sdk-js/interfaces/asset.html)> |

**_Examples_**

Listing assets:

```ts
const filters: AssetListScope = { filter: { name: '21PT1019' } };

const assets: CursorAndAsyncIterator<Asset> = await client.assets.list(filters);
```

## Retrieve assets by id

Retrieving assets by id.

**_Parameters_**

| Properties                                                                                                           | Definition                                                    |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **ids** ([IdEither[]](https://cognitedata.github.io/cognite-sdk-js/globals.html#ideither))                           | InternalId or ExternalId array.                               |
| **params** ([AssetRetrieveParams](https://cognitedata.github.io/cognite-sdk-js/interfaces/assetretrieveparams.html)) | _(Optional)_. Ignore IDs and external IDs that are not found. |

**_Returns_**

| Return                | Type                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------- |
| List requested assets | Promise<[Asset](https://cognitedata.github.io/cognite-sdk-js/interfaces/asset.html)[]> |

**_Examples_**

Retrieving a single asset by id:

```ts
const ids: IdEither[] = [{ id: 123 }];

const assets: Promise<Asset[]> = await client.assets.retrieve(ids);
```

Retrieving multiple assets by id:

```ts
const ids: IdEither[] = [{ id: 123 }, { id: 456 }];

const assets: Promise<Asset[]> = await client.assets.retrieve(ids);
```

Retrieving a single asset by externalId:

```ts
const ids: IdEither[] = [{ externalId: 'abc' }];

const assets: Promise<Asset[]> = await client.assets.retrieve(ids);
```

Retrieving multiple assets by externalId:

```ts
const ids: IdEither[] = [{ externalId: 'abc' }, { externalId: 'def' }];

const assets: Promise<Asset[]> = await client.assets.retrieve(ids);
```

## Search for assets

Searching for assets.

**_Parameters_**

| Properties                                                                                                      | Definition                            |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **query** ([AssetSearchFilter](https://cognitedata.github.io/cognite-sdk-js/interfaces/assetsearchfilter.html)) | Query cursor, limit and some filters. |

**_Returns_**

| Return               | Type                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| List searched assets | Promise<[Asset](https://cognitedata.github.io/cognite-sdk-js/interfaces/asset.html)[]> |

**_Examples_**

Searching assets:

```ts
const filters: AssetSearchFilter = {
  filter: {
    parentIds: [1, 2],
  },
  search: {
    query: '21PT1019',
  },
};

const assets: Promise<Asset[]> = await client.assets.search(filters);
```

## Update assets

Updating assets.

**_Parameters_**

| Properties                                                                                          | Definition              |
| --------------------------------------------------------------------------------------------------- | ----------------------- |
| **change** ([AssetChange](https://cognitedata.github.io/cognite-sdk-js/globals.html#assetchange)[]) | Assets data for update. |

**_Returns_**

| Return              | Type                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------- |
| List updated assets | Promise<[Asset](https://cognitedata.github.io/cognite-sdk-js/interfaces/asset.html)[]> |

**_Examples_**

Updating a single asset by id:

```ts
const assets: AssetChange[] = [
  { id: 123, update: { name: { set: 'New name' } } },
];

const updatedAssets: Asset[] = await client.assets.update(assets);
```

Updating multiple assets by id:

```ts
const assets: AssetChange[] = [
  { id: 123, update: { name: { set: 'New name 123' } } },
  { id: 456, update: { name: { set: 'New name 456' } } },
];

const updatedAssets: Asset[] = await client.assets.update(assets);
```

Updating a single asset by externalId:

```ts
const assets: AssetChange[] = [
  { externalId: 'abc', update: { name: { set: 'New name' } } },
];

const updatedAssets: Asset[] = await client.assets.update(assets);
```

Updating multiple assets by externalId:

```ts
const assets: AssetChange[] = [
  { externalId: 'abc', update: { name: { set: 'New name abc' } } },
  { externalId: 'def', update: { name: { set: 'New name def' } } },
];

const updatedAssets: Asset[] = await client.assets.update(assets);
```

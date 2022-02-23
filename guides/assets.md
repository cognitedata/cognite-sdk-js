# Assets

<!--What are Assets?  Generic overview information-->

In Cognite Data Fusion, the [asset](https://docs.cognite.com/dev/concepts/resource_types/assets) **resource type** stores the **digital representations** of objects or groups of **objects from the physical world**. Water pumps, heart rate monitors, machine rooms, and production lines are examples for those assets.

:::info NOTE
**Note** A note to make is, all steps below you will need to be authenticated with one of our methods, [legacy](./authentication.md#cdf-auth-flow) or [OIDC](../authentication.md#openid-connect-oidc)(*preferable*).
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

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **query** ([AssetAggregateQuery](https://cognitedata.github.io/cognite-sdk-js/interfaces/assetaggregatequery.html)) | Query schema for asset aggregate endpoint. |

***Returns***

| Return | Type |
| ------- | ---- |
| List of aggregated assets |  Promise<[AssetAggregate](https://cognitedata.github.io/cognite-sdk-js/globals.html#assetaggregate)[]> |

***Examples***

Aggregating asset:

```ts
const filters: AssetAggregateQuery = { filter: { root: true } };

const aggregates: Promise<AggregateResponse[]> =await client
    .assets.aggregate(filters);
```

## Create a asset

Creating assets.

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **items** ([ExternalAssetItem](https://cognitedata.github.io/cognite-sdk-js/interfaces/externalassetitem.html)[]) | Array with asset properties. |

***Returns***

| Return | Type |
| ------- | ---- |
| List of requested assets |  Promise<[Asset](https://cognitedata.github.io/cognite-sdk-js/interfaces/asset.html)[]> |

***Examples***

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

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **ids** ([AssetIdEither](https://cognitedata.github.io/cognite-sdk-js/globals.html#assetideither)[]) | Asset internal or externalIds. |
| **params** ([AssetDeleteParams](https://cognitedata.github.io/cognite-sdk-js/interfaces/assetdeleteparams.html) | (*Optional*). Delete params. |

***Returns***

| Return | Type |
| ------- | ---- |
| Empty Promise | Promise<{}> |

***Examples***

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

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **scope** ([AssetListScope](https://cognitedata.github.io/cognite-sdk-js/interfaces/assetlistscope.html)) | (*Optional*). Query cursor, limit and some filters. |

***Returns***

| Return | Type |
| ------- | ---- |
| Empty Promise | [CursorAndAsyncIterator](https://cognitedata.github.io/cognite-sdk-js/globals.html#cursorandasynciterator)<[Asset](https://cognitedata.github.io/cognite-sdk-js/interfaces/asset.html)> |

***Examples***

Listing assets:

```ts
const filters: AssetListScope = { filter: { name: '21PT1019' } };

const assets: CursorAndAsyncIterator<Asset> = await client.assets.list(filters);
```

## Retrieve assets by id

Retrieving assets by id.

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **ids** ([IdEither[]](https://cognitedata.github.io/cognite-sdk-js/globals.html#ideither)) | InternalId or ExternalId array. |
| **params** ([AssetRetrieveParams](https://cognitedata.github.io/cognite-sdk-js/interfaces/assetretrieveparams.html)) | *(Optional)*. Ignore IDs and external IDs that are not found. |

***Returns***

| Return | Type |
| ------- | ---- |
| List requested assets | Promise<[Asset](https://cognitedata.github.io/cognite-sdk-js/interfaces/asset.html)[]> |

***Examples***

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

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **query** ([AssetSearchFilter](https://cognitedata.github.io/cognite-sdk-js/interfaces/assetsearchfilter.html)) | Query cursor, limit and some filters. |

***Returns***

| Return | Type |
| ------- | ---- |
| List searched assets | Promise<[Asset](https://cognitedata.github.io/cognite-sdk-js/interfaces/asset.html)[]> |

***Examples***

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

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **change** ([AssetChange](https://cognitedata.github.io/cognite-sdk-js/globals.html#assetchange)[]) | Assets data for update. |

***Returns***

| Return | Type |
| ------- | ---- |
| List updated assets | Promise<[Asset](https://cognitedata.github.io/cognite-sdk-js/interfaces/asset.html)[]> |

***Examples***

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

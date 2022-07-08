# Relationships

<!--What are Relationships?  Generic overview information-->

The [**Relationships**](https://docs.cognite.com/dev/concepts/resource_types/relationships) resource type represents connections between resource objects in Cognite Data Fusion (CDF). Each relationship is between a source and a target object and is defined by a **relationship type** and the **external IDs** and **resource types** of the source and target objects. Optionally, a relationship can be time-constrained with a start and end time.

:::info NOTE
**Note** A note to make is, all steps below you will need to be authenticated with one of our methods, [legacy](./authentication.md#cdf-auth-flow) or [OIDC](./authentication.md#openid-connect-oidc)(*preferable*).
:::

**In this article:**

  - [Retrieve a relationship by id](#retrieve-a-relationship-by-id)
  - [Retrieve multiple relationships by id](#retrieve-multiple-relationships-by-id)
  - [List relationships](#list-relationships)
  <!-- - [Create relationship](#create-relationships) -->
  - [Delete relationships](#delete-relationships)

## Retrieve a relationship by id

Retrieve a single relationship by external id.

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **ids** ([ExternalId[]](https://cognitedata.github.io/cognite-sdk-js/interfaces/externalid.html)) | External ID's array. |
| **params** ([RelationshipsRetrieveParams](https://cognitedata.github.io/cognite-sdk-js/globals.html#relationshipsretrieveparams)) | *(Optional)*. Ignore IDs and external IDs that are not found |


***Returns***

| Return | Type |
| ------ | ---- |
| List of requested relationship |  Promise<[Relationship[]](https://cognitedata.github.io/cognite-sdk-js/interfaces/relationship.html)> |

***Examples***

Get relationship by external id:

```ts
const externalIds = [
	{ externalId: "relationship_1" }
];

const createdRelationships = await client.relationships.retrieve(externalIds);
```

## Retrieve multiple relationships by id

Retrieve multiple relationships by external id.

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **ids** ([ExternalId[]](https://cognitedata.github.io/cognite-sdk-js/interfaces/externalid.html)) | External ID's array. |
| **params** ([RelationshipsRetrieveParams](https://cognitedata.github.io/cognite-sdk-js/globals.html#relationshipsretrieveparams)) | *(Optional)*. Ignore IDs and external IDs that are not found |

***Returns***

| Return | Type |
| ------- | ---- |
| List of requested relationships |  Promise<[Relationship[]](https://cognitedata.github.io/cognite-sdk-js/interfaces/relationship.html)> |

***Examples***

Get relationships by external id:

```ts
const externalIds = [
	{ externalId: "relationship_1" },
    { externalId: "relationship_2" },
    { externalId: "relationship_3" },
    { externalId: "relationship_4" }
];

const createdRelationships = await client.relationships.retrieve(externalIds);
```

## List relationships

Lists relationships stored in the project based on a query filter given in the payload of this request. Up to 1000 relationships can be retrieved in one operation.

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **query** ([RelationshipsFilterRequest](https://cognitedata.github.io/cognite-sdk-js/interfaces/relationshipsfilterrequest.html) / undefined) | *(Optional)*. Query cursor, limit and some filters. |

***Returns***

| Return | Type |
| ------- | ---- |
| List of requested relationships |  [CursorAndAsyncIterator](https://cognitedata.github.io/cognite-sdk-js/globals.html#cursorandasynciterator)<[Relationship](https://cognitedata.github.io/cognite-sdk-js/interfaces/relationship.html)> |

***Examples***

List relationships with filters:

```ts
const filters = {
	filter: {
    	createdTime: {
        	min: new Date('1 jan 2018'),
            max: new Date('1 jan 2019')
        }
    }
};

const createdRelationships = await client.relationships.list(filters);
```

List relationships without filters:

```ts
const createdRelationships = await client.relationships.list();
```

## Create relationship

Create one or more relationships.

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **items** ([ExternalRelationship](https://cognitedata.github.io/cognite-sdk-js/interfaces/externalrelationship.html)) | Relationship or list of relationships to create. |

***Returns***

| Return | Type |
| ------- | ---- |
| List of created relationships |  Promise<[Relationship](https://cognitedata.github.io/cognite-sdk-js/interfaces/relationship.html)> |

***Examples***

Create a relationship between two assets:

```ts
const relationships = [
    {
      externalId: 'relationship_1',
      sourceExternalId: 'asset_1',
      sourceType: 'asset' as const,
      targetExternalId: 'asset_2',
      targetType: 'asset' as const,
    }
];

const createRelationships = await client.relationships.create(relationships);
```

Create a relationship between a file and an asset:

```ts
const relationships = [
    {
      externalId: 'relationship_1',
      sourceExternalId: 'file_1',
      sourceType: 'file' as const,
      targetExternalId: 'asset_1',
      targetType: 'asset' as const,
    }
];

const createRelationships = await client.relationships.create(relationships);
```

## Delete relationships

Delete one or more relationships.

***Parameters***

| Properties | Definition |
| ---------- | ---------- |
| **ids** ([ExternalId[]](https://cognitedata.github.io/cognite-sdk-js/interfaces/externalid.html)) | External ID's array. |
| **params** ([RelationshipsDeleteParams](https://cognitedata.github.io/cognite-sdk-js/globals.html#relationshipsdeleteparams)) | *(Optional)*. Ignore IDs and external IDs that are not found |

***Returns***

| Return | Type |
| ------- | ---- |
| Empty promise | Promise<{}> |

***Examples***

Delete one relationship:

```ts
await client.relationships.delete([{externalId: 'abc'}]);
```

Delete more than one relationship:

```ts
await client.relationships.delete([{externalId: 'abc'}, {externalId: 'def'}]);
```

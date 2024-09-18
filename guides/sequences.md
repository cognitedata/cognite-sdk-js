# Sequences

<!--What are Sequences?  Generic overview information-->

In Cognite Data Fusion, a [sequence](https://docs.cognite.com/dev/concepts/resource_types/sequences) is a generic **resource type** for indexing a series of **rows** by **row number**. Each **row** contains one or more **columns** with either string or numeric data. Examples of sequences are performance curves and various types of logs.

:::info NOTE
**Note** A note to make is, all steps below you will need to be authenticated with one of our methods, [legacy](./authentication.md#cdf-auth-flow) or [OIDC](./authentication.md#openid-connect-oidc)(*preferable*).
:::

**In this article:**

  - [Retrieve sequences by id](#retrieve-sequences-by-id)
  - [List sequences](#list-sequences)
  - [Aggregate sequences](#aggregate-sequences)
  - [Search for sequences](#search-for-sequences)
  - [Create a sequence](#create-a-sequence)
  - [Delete sequences](#delete-sequences)
  - [Update sequences](#update-sequences)
  - [Insert rows into a sequence](#insert-rows-into-a-sequence)
  - [Delete rows from a sequence](#delete-rows-from-a-sequence)
  - [Retrieve rows from a sequence](#retrieve-rows-from-a-sequence)

## Retrieve sequences by id

Retrieve a single or multiple sequences by external id.

***Parameters***

| Properties                                                                                                              | Definition                                                    |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **ids** ([IdEither[]](https://cognitedata.github.io/cognite-sdk-js/globals.html#ideither))                              | InternalId or ExternalId array.                               |
| **params** ([SequenceRetrieveParams](https://cognitedata.github.io/cognite-sdk-js/globals.html#sequenceretrieveparams)) | *(Optional)*. Ignore IDs and external IDs that are not found. |

***Returns***

| Return                      | Type                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| List of requested sequences | Promise<[Sequence[]](https://cognitedata.github.io/cognite-sdk-js/interfaces/sequence.html)> |

***Examples***

Get a single sequence by external id:

```ts
const externalId: IdEither[] = [{ externalId: 'abc' }];

const retrievedSequence: Promise<Sequence[]> = await client.sequences.retrieve(externalId);
```

Get a single sequence by id:

```ts
const id: IdEither[] = [{ id: 123 }];

const retrievedSequence: Promise<Sequence[]> = await client.sequences.retrieve(id);
```

Get multiple sequences by external id:

```ts
const externalIds: IdEither[] = [
    { externalId: 'abc' },
    { externalId: 'def' },
    { externalId: 'ghi' },
];

const retrievedSequence: Promise<Sequence[]> = await client.sequences.retrieve(externalIds);
```

Get multiple sequences by id:

```ts
const ids: IdEither[] = [
    { id: 123 },
    { id: 456 },
    { id: 789 }
];

const retrievedSequence: Promise<Sequence[]> = await client.sequences.retrieve(ids);
```

## List sequences

List sequences.

***Parameters***

| Properties                                                                                                      | Definition                                          |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **scope** ([SequenceListScope](https://cognitedata.github.io/cognite-sdk-js/interfaces/sequencelistscope.html)) | (*Optional*). Query cursor, limit and some filters. |

***Returns***

| Return                      | Type                                                                                                                                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List of requested sequences | [CursorAndAsyncIterator](https://cognitedata.github.io/cognite-sdk-js/globals.html#cursorandasynciterator)<[Sequence](https://cognitedata.github.io/cognite-sdk-js/interfaces/sequence.html)[]> |

***Examples***

List sequences with filters:

```ts
const filters: SequenceListScope = [{ filter: { name: 'sequence_name' } }];

const sequences: CursorAndAsyncIterator<Sequence[]> = await client.sequences.list(filters);
```

## Aggregate sequences

Aggregate sequences.

***Parameters***

| Properties                                                                                                | Definition |
| --------------------------------------------------------------------------------------------------------- | ---------- |
| **query** ([SequenceFilter](https://cognitedata.github.io/cognite-sdk-js/interfaces/sequencefilter.html)) | Filters.   |

***Returns***

| Return                      | Type                                                                                                        |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| List of sequence aggregates | Promise<[SequenceAggregate](https://cognitedata.github.io/cognite-sdk-js/globals.html#sequenceaggregate)[]> |

***Examples***

Aggregate sequences:

```ts
const filters: SequenceFilter = [{ filter: { name: "Well" } }];

const aggregates: Promise<SequenceAggregate[]> = await client.sequences.aggregate(filters);

console.log('Number of sequences named Well: ', aggregates[0].count)
```

## Search for sequences

Search sequences.

***Parameters***

| Properties                                                                                                            | Definition |
| --------------------------------------------------------------------------------------------------------------------- | ---------- |
| **query** ([SequenceSearchFilter](https://cognitedata.github.io/cognite-sdk-js/interfaces/sequencesearchfilter.html)) | Filters.   |

***Returns***

| Return                     | Type                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| List of searched sequences | Promise<[Sequence](https://cognitedata.github.io/cognite-sdk-js/interfaces/sequence.html)[]> |

***Examples***

Search for a sequence:

```ts
const filters: SequenceSearchFilter = [
    {
        filter: { assetIds: [1, 2] },
        search: { query: 'n*m* desc*ion' }
    }
];

const sequences: Promise<Sequence[]>  = await client.sequences.search(filters);
```

## Create a sequence

Some description.

***Parameters***

| Properties                                                                                                      | Definition           |
| --------------------------------------------------------------------------------------------------------------- | -------------------- |
| **items** ([ExternalSequence](https://cognitedata.github.io/cognite-sdk-js/interfaces/externalsequence.html)[]) | Sequence properties. |

***Returns***

| Return                      | Type                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| List of requested sequences | Promise<[Sequence](https://cognitedata.github.io/cognite-sdk-js/interfaces/sequence.html)[]> |

***Examples***

Creating a sequence:

```ts
const sequences: ExternalSequence[] = [
    {
        externalId: 'sequence_name',
        columns: [
            { externalId: 'one', valueType: SequenceValueType.LONG },
            { externalId: 'two' },
            { externalId: 'three', valueType: SequenceValueType.STRING }
        ]
    }
];

const [sequence]: Promise<Sequence[]> = await client.sequences.create(sequences);
```

Creating multiple sequences:

```ts
const sequences: ExternalSequence[] = [
    {
        externalId: 'sequence_name',
        columns: [
            { externalId: 'one', valueType: SequenceValueType.LONG },
            { externalId: 'two' },
            { externalId: 'three', valueType: SequenceValueType.STRING }
        ]
    },
    {
        externalId: 'sequence_name_two',
        columns: [
            { externalId: 'one_one', valueType: SequenceValueType.LONG },
            { externalId: 'two_two' },
            { externalId: 'three_three', valueType: SequenceValueType.STRING }
        ]
    }
];

const [sequence]: Promise<Sequence[]> = await client.sequences.create(sequences);
```

## Delete sequences

Delete sequences.

***Parameters***

| Properties                                                                                 | Definition                     |
| ------------------------------------------------------------------------------------------ | ------------------------------ |
| **ids** ([IdEither](https://cognitedata.github.io/cognite-sdk-js/globals.html#ideither)[]) | InternalId or ExternalId array |

***Returns***

| Return        | Type            |
| ------------- | --------------- |
| Empty Promise | Promise<object> |

***Examples***

Deleting a sequence by externalId:

```ts
const externalId: IdEither[] = [{ externalId: 'abc' }];

await client.sequences.delete(externalId);
```

Deleting multiple sequences by externalId:

```ts
const externalId: IdEither[] = [{ externalId: 'abc' }, { externalId: 'def' }];

await client.sequences.delete(externalId);
```

Deleting a sequence by id:

```ts
const ids: IdEither[] = [{ id: 123 }];

await client.sequences.delete(ids);
```

Deleting multiple sequences by id:

```ts
const ids: IdEither[] = [{ id: 123 }, { id: 456 }];

await client.sequences.delete(ids);
```

## Update sequences

Update sequences.

***Parameters***

| Properties                                                                                                 | Definition      |
| ---------------------------------------------------------------------------------------------------------- | --------------- |
| **changes** ([SequenceChange](https://cognitedata.github.io/cognite-sdk-js/globals.html#sequencechange)[]) | Sequences data. |

***Returns***

| Return                    | Type                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| List of updated sequences | Promise<[Sequence](https://cognitedata.github.io/cognite-sdk-js/interfaces/sequence.html)[]> |

***Examples***

Updating sequence by id:

```ts
const sequence: SequenceChange[] = [{id: 123, update: {name: {set: 'New name'}}}];

const [updatedSequence]: Promise<Sequence[]> = await client.sequences.update(sequence);
```

Updating multiple sequences by id:

```ts
const sequence: SequenceChange[] = [
    {id: 123, update: {name: {set: 'New name'}}},
    {id: 456, update: {name: {set: 'New name two'}}}
];

const [updatedSequence]: Promise<Sequence[]> = await client.sequences.update(sequence);
```

Updating sequence by externalId:

```ts
const sequence: SequenceChange[] = [{externalId: 'abc', update: {name: {set: 'New name'}}}];

const [updatedSequence]: Promise<Sequence[]> = await client.sequences.update(sequence);
```

Updating multiple sequences by externalId:

```ts
const sequence: SequenceChange[] = [
    {externalId: 'abc', update: {name: {set: 'New name'}}},
    {externalId: 'def', update: {name: {set: 'New name two'}}}
];

const [updatedSequence]: Promise<Sequence[]> = await client.sequences.update(sequence);
```

## Insert rows into a sequence

Insert rows.

***Parameters***

| Properties                                                                                                       | Definition                       |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **items** ([SequenceRowsInsert](https://cognitedata.github.io/cognite-sdk-js/globals.html#sequencerowsinsert)[]) | A request for datapoints stored. |

***Returns***

| Return        | Type            |
| ------------- | --------------- |
| Empty Promise | Promise<object> |

***Examples***

Inserting row with id:

```ts
const rows: SequenceRowsInsert[] = [
    {
        id: 123,
        rows: [
            { rowNumber: 0, values: [1, 2.2, 'three'] },
            { rowNumber: 1, values: [4, 5, 'six'] }
        ],
        columns: ['one', 'two', 'three'],
    }
];

await client.sequences.insertRows(rows);
```

Inserting multiple rows with id:

```ts
const rows: SequenceRowsInsert[] = [
    {
        id: 123,
        rows: [
            { rowNumber: 0, values: [1, 2.2, 'three'] },
            { rowNumber: 1, values: [4, 5, 'six'] }
        ],
        columns: ['one', 'two', 'three'],
    },
    {
        id: 456,
        rows: [
            { rowNumber: 0, values: [1, 2.2, 'three'] },
            { rowNumber: 1, values: [4, 5, 'six'] }
        ],
        columns: ['one', 'two', 'three'],
    }
];

await client.sequences.insertRows(rows);
```

Inserting row with externalId:

```ts
const rows: SequenceRowsInsert[] = [
    {
        externalId: 'abc',
        rows: [
            { rowNumber: 0, values: [1, 2.2, 'three'] },
            { rowNumber: 1, values: [4, 5, 'six'] }
        ],
        columns: ['one', 'two', 'three'],
    }
];

await client.sequences.insertRows(rows);
```

Inserting multiple rows with externalId:

```ts
const rows: SequenceRowsInsert[] = [
    {
        externalId: 'abc',
        rows: [
            { rowNumber: 0, values: [1, 2.2, 'three'] },
            { rowNumber: 1, values: [4, 5, 'six'] }
        ],
        columns: ['one', 'two', 'three'],
    },
    {
        externalId: 'def',
        rows: [
            { rowNumber: 0, values: [1, 2.2, 'three'] },
            { rowNumber: 1, values: [4, 5, 'six'] }
        ],
        columns: ['one', 'two', 'three'],
    }
];

await client.sequences.insertRows(rows);
```

## Delete rows from a sequence

Delete rows.

***Parameters***

| Properties                                                                                                       | Definition                      |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **query** ([SequenceRowsDelete](https://cognitedata.github.io/cognite-sdk-js/globals.html#sequencerowsdelete)[]) | Rows to delete from a sequence. |

***Returns***

| Return        | Type            |
| ------------- | --------------- |
| Empty Promise | Promise<object> |

***Examples***

Delete a single row sequence by id.

```ts
const rows: SequenceRowsDelete[] = [{ id: 32423849, rows: [1, 2, 3] }];

await client.sequences.deleteRows(rows);
```

Delete a single row sequence by externalId.

```ts
const rows: SequenceRowsDelete[] = [{ externalId: 'abcdef', rows: [1, 2, 3] }];

await client.sequences.deleteRows(rows);
```

Delete multiple row sequences by id.

```ts
const rows: SequenceRowsDelete[] = [
    { id: 32423849, rows: [1, 2, 3] },
    { id: 37481923, rows: [1, 2, 3] }
];

await client.sequences.deleteRows(rows);
```

Delete multiples row sequences by externalId.

```ts
const rows: SequenceRowsDelete[] = [
    { externalId: 'abcdef', rows: [1, 2, 3] },
    { externalId: 'ghijkl', rows: [1, 2, 3] }
];

await client.sequences.deleteRows(rows);
```

## Retrieve rows from a sequence

Retrieve rows.

***Parameters***

| Properties                                                                                                         | Definition                       |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| **query** ([SequenceRowsRetrieve](https://cognitedata.github.io/cognite-sdk-js/globals.html#sequencerowsretrieve)) | A request for datapoints stored. |

***Returns***

| Return                          | Type                                                                                                                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List of requested sequence rows | [CursorAndAsyncIterator](https://cognitedata.github.io/cognite-sdk-js/globals.html#cursorandasynciterator)<[SequenceRow](https://cognitedata.github.io/cognite-sdk-js/interfaces/sequencerow.html)> |

***Examples***

Retrieving a single row by id:

```ts
const rows: SequenceRowsRetrieve = { id: 123 };

const retrievedRows: SequenceRow[] = await client.sequences
    .retrieveRows(rows)
    .autoPagingToArray({ limit: 100 });
```

Retrieving a single row by externalId:

```ts
const rows: SequenceRowsRetrieve = { externalId: 'sequence1' };

const retrievedRows: SequenceRow[] = await client.sequences
    .retrieveRows(rows)
    .autoPagingToArray({ limit: 100 });
```

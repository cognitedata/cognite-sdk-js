# Files

<!--What are Files?  Generic overview information-->

In Cognite Data Fusion, the [file](https://docs.cognite.com/dev/concepts/resource_types/files) **resource type** stores **files** and **documents** that are related to one or more assets. For example, a file can contain a piping and instrumentation diagram (P&ID) that shows how multiple assets are connected.

:::info NOTE
**Note** A note to make is, all steps below you will need to be authenticated with [OIDC](./authentication.md#openid-connect-oidc).
:::

**In this article:**

- [Aggregate files](#aggregate-files)
- [Delete files](#delete-files)
- [List files](#list-files)
- [Retrieve files by id](#retrieve-files-by-id)
- [Search for file](#search-for-files)
- [Update files](#update-files)
- [Upload files](#upload-files)

## Aggregate files

Aggregating files.

**_Parameters_**

| Properties                                                                                                        | Definition                                 |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **query** ([FileAggregateQuery](https://cognitedata.github.io/cognite-sdk-js/interfaces/fileaggregatequery.html)) | Query schema for files aggregate endpoint. |

**_Returns_**

| Return                   | Type                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| List of aggregated files | Promise<[FileAggregate](https://cognitedata.github.io/cognite-sdk-js/globals.html#fileaggregate)[]> |

**_Examples_**

Aggregating files:

```ts
const filters: FileAggregateQuery = { filter: { uploaded: true } };

const aggregates: Promise<FileAggregate[]> = await client.files.aggregate(
  filters
);
```

## Delete files

Deleting files.

**_Parameters_**

| Properties                                                                                 | Definition                     |
| ------------------------------------------------------------------------------------------ | ------------------------------ |
| **ids** ([IdEither](https://cognitedata.github.io/cognite-sdk-js/globals.html#ideither)[]) | InternalId or ExternalId array |

**_Returns_**

| Return        | Type        |
| ------------- | ----------- |
| Empty Promise | Promise<{}> |

**_Examples_**

Deleting a single file by id:

```ts
const ids: IdEither[] = [{ id: 123 }];

await client.files.delete(ids);
```

Deleting multiple files by id:

```ts
const ids: IdEither[] = [{ id: 123 }, { id: 456 }];

await client.files.delete(ids);
```

Deleting a single file by externalId:

```ts
const ids: IdEither[] = [{ externalId: 'abc' }];

await client.files.delete(ids);
```

Deleting multiple files by externalId:

```ts
const ids: IdEither[] = [{ externalId: 'abc' }, { externalId: 'def' }];

await client.files.delete(ids);
```

## List files

Listing files.

**_Parameters_**

| Properties                                                                                                      | Definition                                          |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **scope** ([FileRequestFilter](https://cognitedata.github.io/cognite-sdk-js/interfaces/filerequestfilter.html)) | (_Optional_). Query cursor, limit and some filters. |

**_Returns_**

| Return                  | Type                                                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List of requested files | [CursorAndAsyncIterator](https://cognitedata.github.io/cognite-sdk-js/globals.html#cursorandasynciterator)<[FileInfo](https://cognitedata.github.io/cognite-sdk-js/interfaces/fileinfo.html)> |

**_Examples_**

List files with filters:

```ts
const filters: FileRequestFilter = { filter: { mimeType: 'image/png' } };

const sequences: CursorAndAsyncIterator<FileInfo> = await client.files.list(
  filters
);
```

## Retrieve files by id

Retrieve a single or multiple sequences by external id.

**_Parameters_**

| Properties                                                                                                      | Definition                                                    |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **ids** ([IdEither[]](https://cognitedata.github.io/cognite-sdk-js/globals.html#ideither))                      | InternalId or ExternalId array.                               |
| **params** ([FileRetrieveParams](https://cognitedata.github.io/cognite-sdk-js/globals.html#fileretrieveparams)) | _(Optional)_. Ignore IDs and external IDs that are not found. |

**_Returns_**

| Return                  | Type                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| List of requested files | Promise<[FileInfo](https://cognitedata.github.io/cognite-sdk-js/interfaces/fileinfo.html)[]> |

**_Examples_**

Get a single file by external id:

```ts
const externalId: IdEither[] = [{ externalId: 'abc' }];

const retrievedFiles: Promise<FileInfo[]> = await client.files.retrieve(
  externalId
);
```

Get a single file by id:

```ts
const id: IdEither[] = [{ id: 123 }];

const retrievedFiles: Promise<FileInfo[]> = await client.files.retrieve(id);
```

Get multiple files by external id:

```ts
const externalIds: IdEither[] = [
  { externalId: 'abc' },
  { externalId: 'def' },
  { externalId: 'ghi' },
];

const retrievedFiles: Promise<FileInfo[]> = await client.files.retrieve(
  externalIds
);
```

Get multiple files by id:

```ts
const ids: IdEither[] = [{ id: 123 }, { id: 456 }, { id: 789 }];

const retrievedFiles: Promise<FileInfo[]> = await client.files.retrieve(ids);
```

## Search for files

Searching for files.

**_Parameters_**

| Properties                                                                                                      | Definition |
| --------------------------------------------------------------------------------------------------------------- | ---------- |
| **query** ([FilesSearchFilter](https://cognitedata.github.io/cognite-sdk-js/interfaces/filessearchfilter.html)) | Filters.   |

**_Returns_**

| Return                 | Type                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| List of searched files | Promise<[FileInfo](https://cognitedata.github.io/cognite-sdk-js/interfaces/fileinfo.html)[]> |

**_Examples_**

Search for files:

```ts
const filters: FilesSearchFilter = [
  {
    filter: { mimeType: 'image/jpeg' },
    search: { name: 'Pump' },
  },
];

const sequences: Promise<FileInfo[]> = await client.files.search(filters);
```

## Update files

Updating files.

**_Parameters_**

| Properties                                                                                                     | Definition  |
| -------------------------------------------------------------------------------------------------------------- | ----------- |
| **changes** ([FileChangeUpdate](https://cognitedata.github.io/cognite-sdk-js/globals.html#filechangeupdate)[]) | Files data. |

**_Returns_**

| Return                | Type                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------- |
| List of updated files | Promise<[FileInfo](https://cognitedata.github.io/cognite-sdk-js/interfaces/fileinfo.html)[]> |

**_Examples_**

Updating file by id:

```ts
const files: FileChangeUpdate[] = [
  { id: 123, update: { source: { set: 'New source' } } },
];

const [updatedFile]: Promise<FileInfo[]> = await client.files.update(sequence);
```

Updating multiple files by id:

```ts
const files: FileChangeUpdate[] = [
  { id: 123, update: { source: { set: 'New source' } } },
  { id: 456, update: { source: { set: 'New source two' } } },
];

const [updatedFile]: Promise<FileInfo[]> = await client.files.update(sequence);
```

Updating files by externalId:

```ts
const files: FileChangeUpdate[] = [
  { externalId: 'abc', update: { source: { set: 'New source' } } },
];

const [updatedFile]: Promise<FileInfo[]> = await client.files.update(sequence);
```

Updating multiple files by externalId:

```ts
const files: FileChangeUpdate[] = [
  { externalId: 'abc', update: { source: { set: 'New source' } } },
  { externalId: 'def', update: { source: { set: 'New source two' } } },
];

const [updatedFile]: Promise<FileInfo[]> = await client.files.update(sequence);
```

## Upload files

Uploading files.

**_Parameters_**

| Properties                                                                                                       | Definition                  |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------- |
| **fileInfo** ([ExternalFileInfo](https://cognitedata.github.io/cognite-sdk-js/interfaces/externalfileinfo.html)) | File information.           |
| **fileContent** ([FileContent](https://cognitedata.github.io/cognite-sdk-js/globals.html#filecontent))           | (_Optional_). File content. |
| **overwrite** (boolean = false)                                                                                  | (_Optional_).               |
| **waitUntilAcknowledged** (boolean = false)                                                                      | (_Optional_).               |

**_Returns_**

| Return                 | Type                                                                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uploaded file response | Promise<[FileUploadResponse](https://cognitedata.github.io/cognite-sdk-js/interfaces/fileuploadresponse.html) / [FileInfo](https://cognitedata.github.io/cognite-sdk-js/interfaces/fileinfo.html)> |

**_Examples_**

Uploading files with fileContent:

```ts
const fileContent: FileContent = 'file data here'; // can also be of type ArrayBuffer, Buffer, Blob, File or any

const file: Promise<FileUploadResponse | FileInfo> = await client.files.upload(
  { name: 'examplefile.jpg', mimeType: 'image/jpeg' },
  fileContent
);
```

Uploading files with manually:

```ts
const file: Promise<FileUploadResponse | FileInfo> = await client.files.upload({
  name: 'examplefile.jpg',
  mimeType: 'image/jpeg',
});
// then upload using the file.uploadUrl
```

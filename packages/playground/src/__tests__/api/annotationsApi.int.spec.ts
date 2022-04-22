// Copyright 2022 Cognite AS

import CogniteClientPlayground from '../../cogniteClientPlayground';
import { CogniteClient, InternalId } from '@cognite/sdk';
import { setupLoggedInClient } from '../testUtils';
import { setupLoggedInClient as stableApiClientSetup } from '../../../../stable/src/__tests__/testUtils';
import {
  AnnotationChangeById,
  AnnotationCreate,
  AnnotationFilterProps,
} from '@cognite/sdk-playground';

// Variables to be used in the tests
let ANNOTATED_FILE_ID: number;
let ANNOTATIONS: AnnotationCreate[];
let FILE_FILTER: AnnotationFilterProps;

describe('Annotations API', () => {
  let client: CogniteClientPlayground;
  let stableClient: CogniteClient;
  const createdAnnotationIds: InternalId[] = [];

  beforeAll(async () => {
    client = setupLoggedInClient();
    stableClient = stableApiClientSetup();

    const fileInfo = await stableClient.files.upload({
      name: 'testfile.bin',
    });

    // Set global variables
    ANNOTATED_FILE_ID = fileInfo.id;
    FILE_FILTER = {
      annotatedResourceType: 'file',
      annotatedResourceIds: [{ id: ANNOTATED_FILE_ID }],
    };
    ANNOTATIONS = [
      {
        annotatedResourceType: 'file',
        annotatedResourceId: ANNOTATED_FILE_ID,
        annotationType: 'diagrams.FileLink',
        creatingApp: 'integration-tests',
        creatingAppVersion: '0.0.1',
        creatingUser: 'integration-tests',
        status: 'suggested',
        data: {
          pageNumber: 7,
          fileRef: { externalId: 'abc' },
          textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.2 },
        },
      },
      {
        annotatedResourceType: 'file',
        annotatedResourceId: ANNOTATED_FILE_ID,
        annotationType: 'diagrams.AssetLink',
        creatingApp: 'integration-tests',
        creatingAppVersion: '0.0.1',
        creatingUser: 'integration-tests',
        status: 'suggested',
        data: {
          pageNumber: 42,
          assetRef: { externalId: 'def' },
          textRegion: { xMax: 0.15, xMin: 0.1, yMax: 0.15, yMin: 0.1 },
        },
      },
    ];

    const created = await client.annotations.create(ANNOTATIONS);
    created.forEach((annotation) =>
      createdAnnotationIds.push({ id: annotation.id })
    );
  });

  afterAll(async () => {
    await client.annotations.delete(createdAnnotationIds);
    await stableClient.files.delete([
      {
        id: ANNOTATED_FILE_ID,
      },
    ]);
  });

  test('create annotation', async () => {
    const data = {
      pageNumber: 7,
      textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.2 },
      extractedText: 'i am your father',
    };
    const partial: AnnotationCreate = {
      annotatedResourceType: 'file',
      annotatedResourceId: ANNOTATED_FILE_ID,
      annotationType: 'documents.ExtractedText',
      creatingApp: 'integration-tests',
      creatingAppVersion: '0.0.1',
      creatingUser: 'integration-tests',
      status: 'suggested',
      data,
    };
    const created = await client.annotations.create([partial]);

    expect(created).toHaveLength(1);
    const annotation = created[0];

    expect(annotation).toHaveProperty('id');
    expect(annotation).toHaveProperty('createdTime');
    expect(annotation).toHaveProperty('lastUpdatedTime');
    expect(annotation.annotatedResourceType).toEqual(
      partial.annotatedResourceType
    );
    expect(annotation.annotatedResourceExternalId).toEqual(
      partial.annotatedResourceExternalId
    );
    expect(annotation.annotationType).toEqual(partial.annotationType);
    expect(annotation.creatingApp).toEqual(partial.creatingApp);
    expect(annotation.creatingAppVersion).toEqual(partial.creatingAppVersion);
    expect(annotation.status).toEqual(partial.status);
    expect(annotation).toHaveProperty('data');
    const annotationData: any = annotation.data;
    expect(annotationData.pageNumber).toEqual(data.pageNumber);
    expect(annotationData.textRegion.xMin).toEqual(data.textRegion.xMin);
    expect(annotationData.textRegion.xMax).toEqual(data.textRegion.xMax);
    expect(annotationData.textRegion.yMin).toEqual(data.textRegion.yMin);
    expect(annotationData.textRegion.yMax).toEqual(data.textRegion.yMax);
    expect(annotationData.extractedText).toEqual(data.extractedText);

    await client.annotations.delete([{ id: annotation.id }]);
  });

  test('create annotation, service is creating', async () => {
    const partial: AnnotationCreate = {
      annotatedResourceType: 'file',
      annotatedResourceId: ANNOTATED_FILE_ID,
      annotationType: 'documents.ExtractedText',
      creatingApp: 'integration-tests',
      creatingAppVersion: '0.0.1',
      creatingUser: null,
      status: 'suggested',
      data: {
        pageNumber: 7,
        textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.2 },
        extractedText: 'i am your father',
      },
    };
    const created = await client.annotations.create([partial]);
    const annotation = created[0];
    expect(annotation.creatingUser).toBeNull();

    await client.annotations.delete([{ id: annotation.id }]);
  });

  test('retrieve annotations', async () => {
    const response = await client.annotations.retrieve(createdAnnotationIds);
    expect(response).toHaveLength(createdAnnotationIds.length);
  });

  test('list annotations, limit to 1', async () => {
    const limitOne = await client.annotations.list({
      limit: 1,
      filter: FILE_FILTER,
    });
    expect(limitOne.items).toHaveLength(1);
  });

  test('list annotations, pagination works', async () => {
    const first = await client.annotations.list({
      limit: 1,
      filter: FILE_FILTER,
    });
    expect(first.nextCursor).not.toBeNull();

    const second = await client.annotations.list({
      limit: 1,
      filter: FILE_FILTER,
      cursor: first.nextCursor,
    });
    expect(second.nextCursor).toBeNull();
  });

  test('list annotations', async () => {
    const items = await client.annotations
      .list({ filter: FILE_FILTER })
      .autoPagingToArray();
    expect(items).toHaveLength(createdAnnotationIds.length);
  });

  test('update annotation', async () => {
    const listResponse = await client.annotations.retrieve([
      createdAnnotationIds[0],
    ]);
    const annotation = listResponse[0];
    const data = {
      pageNumber: 8,
      fileRef: { externalId: 'def_file_changed' },
      textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.2 },
    };
    const changes: AnnotationChangeById[] = [
      {
        id: annotation.id,
        update: {
          data: {
            set: data,
          },
        },
      },
    ];
    const updatedResp = await client.annotations.update(changes);
    const updated = updatedResp[0];
    expect(updated).toHaveProperty('data');
    const updatedData: any = updated.data;
    expect(updatedData.pageNumber).toEqual(data.pageNumber);
    expect(updatedData.fileRef.externalId).toEqual(data.fileRef.externalId);
    expect(updatedData.textRegion.xMin).toEqual(data.textRegion.xMin);
    expect(updatedData.textRegion.xMax).toEqual(data.textRegion.xMax);
    expect(updatedData.textRegion.yMin).toEqual(data.textRegion.yMin);
    expect(updatedData.textRegion.yMax).toEqual(data.textRegion.yMax);
  });
});

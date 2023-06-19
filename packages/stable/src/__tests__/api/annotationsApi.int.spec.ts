// Copyright 2022 Cognite AS
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';
import {
  AnnotationChangeById,
  AnnotationCreate,
  AnnotationSuggest,
  AnnotationFilterProps,
  InternalId,
} from '../../types';

const ANNOTATED_FILE_EXTERNAL_ID =
  'sdk-integration-tests-file-' + new Date().toISOString();

function fileFilter(annotatedResourceId: number): AnnotationFilterProps {
  return {
    annotatedResourceType: 'file',
    annotatedResourceIds: [{ id: annotatedResourceId }],
  };
}

function baseAnnotations(annotatedResourceId: number): AnnotationCreate[] {
  return [
    {
      annotatedResourceType: 'file',
      annotationType: 'diagrams.FileLink',
      annotatedResourceId,
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
      annotationType: 'diagrams.AssetLink',
      annotatedResourceId,
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
}

describe('Annotations API', () => {
  let client: CogniteClient;
  const createdAnnotationIds: InternalId[] = [];
  let annotatedFileId: number;

  beforeAll(async () => {
    client = setupLoggedInClient();

    jest.setTimeout(5 * 60 * 1000);

    const fileInfo = await client.files.upload(
      {
        externalId: ANNOTATED_FILE_EXTERNAL_ID,
        name: ANNOTATED_FILE_EXTERNAL_ID,
      },
      'This is the content of the Cognite JS SDK Annotations API test file'
    );
    annotatedFileId = fileInfo.id;
    const annotations = baseAnnotations(annotatedFileId);
    const created = await client.annotations.create(annotations);
    created.forEach((annotation) =>
      createdAnnotationIds.push({ id: annotation.id })
    );
  });

  afterAll(async () => {
    await client.annotations.delete(createdAnnotationIds);
    await client.files.delete([
      {
        externalId: ANNOTATED_FILE_EXTERNAL_ID,
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
      annotatedResourceId: annotatedFileId,
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
    expect(annotation.annotatedResourceId).toEqual(partial.annotatedResourceId);
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

  test('suggest annotation', async () => {
    const data = {
      pageNumber: 7,
      textRegion: { xMin: 0, xMax: 0.1, yMin: 0, yMax: 0.2 },
      extractedText: 'i am your father',
    };
    const partial: AnnotationSuggest = {
      annotatedResourceType: 'file',
      annotatedResourceId: annotatedFileId,
      annotationType: 'documents.ExtractedText',
      creatingApp: 'integration-tests',
      creatingAppVersion: '0.0.1',
      creatingUser: 'integration-tests',
      data,
    };
    const created = await client.annotations.suggest([partial]);

    expect(created).toHaveLength(1);
    const annotation = created[0];
    expect(annotation.status).toEqual('suggested');

    await client.annotations.delete([{ id: annotation.id }]);
  });

  test('create annotation, service is creating', async () => {
    const partial: AnnotationCreate = {
      annotatedResourceType: 'file',
      annotatedResourceId: annotatedFileId,
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
      filter: fileFilter(annotatedFileId),
    });
    expect(limitOne.items).toHaveLength(1);
  });

  test('list annotations, pagination works', async () => {
    const first = await client.annotations.list({
      limit: 1,
      filter: fileFilter(annotatedFileId),
    });
    expect(first.nextCursor).not.toBeNull();

    const second = await client.annotations.list({
      limit: 1,
      filter: fileFilter(annotatedFileId),
      cursor: first.nextCursor,
    });
    expect(second.nextCursor).toBeNull();
  });

  test('list annotations', async () => {
    const items = await client.annotations
      .list({ filter: fileFilter(annotatedFileId) })
      .autoPagingToArray();
    expect(items).toHaveLength(createdAnnotationIds.length);
  });

  test('list annotations with data filter', async () => {
    const items = await client.annotations
      .list({
        filter: {
          ...fileFilter(annotatedFileId),
          data: {
            assetRef: { externalId: 'def' },
          },
        },
      })
      .autoPagingToArray();
    expect(items).toHaveLength(1);
  });

  test('reverse lookup annotation', async () => {
    await new Promise((resolve) => setTimeout(resolve, 30000));
    const retrievedAnnotations = await client.annotations
      .list({ filter: fileFilter(annotatedFileId) })
      .autoPagingToArray();

    console.log(
      'Retrieved annotations: ',
      JSON.stringify(retrievedAnnotations)
    );

    const listResponse = await client.annotations.reverseLookup({
      limit: 1000,
      filter: {
        annotatedResourceType: 'file',
        data: retrievedAnnotations[1].data,
      },
    });

    console.log('Response from reverse query', JSON.stringify(listResponse));

    expect(listResponse.items).toHaveLength(1);
    expect(listResponse.items[0].id).toBe(createdAnnotationIds[1]);
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

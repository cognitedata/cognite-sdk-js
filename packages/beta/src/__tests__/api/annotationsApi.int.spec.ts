import { default as BetaClient } from '../../cogniteClient';
import { AnnotationCreate, InternalId } from '@cognite/sdk-core';
import { setupLoggedInClient } from '../testUtils';

const ANNOTATED_FILE_EXTERNAL_ID =
  'sdk-integration-tests-file-' + new Date().toISOString();

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

describe('Annotations Beta API', () => {
  let client: BetaClient;
  const createdAnnotationIds: InternalId[] = [];
  let annotatedFileId: number;

  beforeAll(async () => {
    client = setupLoggedInClient();

    const fileInfo = await client.files.upload({
      externalId: ANNOTATED_FILE_EXTERNAL_ID,
      name: ANNOTATED_FILE_EXTERNAL_ID,
    });
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

  test('reverse lookup annotation', async () => {
    const listResponse = await client.annotations.reverseLookup({
      filter: {
        annotatedResourceType: 'file',
        data: {
          assetRef: {
            externalId: 'def',
          },
        },
      },
    });

    expect(listResponse.items).toHaveLength(1);
    expect(listResponse.items[0].id).toBe(createdAnnotationIds[1]);
    expect(listResponse.annotatedResourceType).toBe('file');
  });
});

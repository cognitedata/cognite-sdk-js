// Copyright 2020 Cognite AS

import { ExtractPostResponse } from 'playground/dist/src/api/vision/types';
import CogniteClientPlayground from '../../cogniteClientPlayground';
import { setupLoggedInClient as setupLoggedinPlaygroundClient } from '../testUtils';

describe('Vision API', () => {
  const TEST_IMAGE_ID = 3779952822789602;
  let playgroundClient: CogniteClientPlayground;
  let extractJob: ExtractPostResponse;

  beforeAll(async () => {
    jest.setTimeout(2 * 60 * 1000); // timeout after 2 minutes
    playgroundClient = setupLoggedinPlaygroundClient();

    extractJob = await playgroundClient.vision.extract(
      ['PeopleDetection'],
      [{ fileId: TEST_IMAGE_ID }]
    );
  });

  test('extract', async () => {
    expect(extractJob.status).toEqual('Queued');
    expect(extractJob.jobId).toBeGreaterThan(0);
    expect(extractJob.createdTime).toBeGreaterThan(0);
    expect(extractJob.statusTime).toBeGreaterThan(0);
    expect(extractJob.features).toEqual(['PeopleDetection']);
    expect(extractJob.items).toEqual([
      { fileId: TEST_IMAGE_ID, fileExternalId: 'vision_extract_test_image' },
    ]);
  });

  describe('retrieve extract job', () => {
    test('waitForCompletion=false', async () => {
      const result = await playgroundClient.vision.getExtractJob(
        extractJob.jobId,
        false
      );
      expect(result.status).toEqual(extractJob.status);
      expect(result.jobId).toEqual(extractJob.jobId);
      expect(result.createdTime).toEqual(extractJob.createdTime);
      expect(result.statusTime).toBeGreaterThanOrEqual(extractJob.statusTime);
    });
    test('waitForCompletion=true, should timeout', async () => {
      await expect(
        playgroundClient.vision.getExtractJob(extractJob.jobId, true, 1000, 0)
      ).rejects.toThrowError(
        `Timed out while waiting for vision job to complete.`
      );
    });
    test('waitForCompletion=true', async () => {
      const result = await playgroundClient.vision.getExtractJob(
        extractJob.jobId,
        true
      );
      expect(result.status).toEqual('Completed');
      expect(result.jobId).toEqual(extractJob.jobId);
      expect(result.createdTime).toEqual(extractJob.createdTime);
      expect(result.statusTime).toBeGreaterThanOrEqual(extractJob.statusTime);
      expect(result.startTime).toBeGreaterThan(0);

      // We don't really care about what specific values are returned.  What
      // we care in the following checks is that the *data structure* is
      // correctly filled.
      expect(result.parameters).toBeDefined();
      expect(result.parameters!.peopleDetectionParameters).toBeDefined();

      expect(result.items?.length).toBeGreaterThan(0);
      const resultItem = result.items![0];
      expect(resultItem.fileId).toEqual(TEST_IMAGE_ID);

      // Check if people prediction exist
      expect(resultItem.predictions.peoplePredictions?.length).toBeGreaterThan(
        0
      );
      const peoplePrediction = resultItem.predictions.peoplePredictions![0];
      // Check that its values are defined. D
      expect(peoplePrediction.confidence).toBeGreaterThanOrEqual(0.0);
      expect(peoplePrediction.label).toEqual('person');
      expect(peoplePrediction.boundingBox).toBeDefined();
      const boundingBox = peoplePrediction.boundingBox!;
      expect(boundingBox.xMin).toBeGreaterThanOrEqual(0.0);
      expect(boundingBox.xMax).toBeGreaterThanOrEqual(0.0);
      expect(boundingBox.yMin).toBeGreaterThanOrEqual(0.0);
      expect(boundingBox.yMax).toBeGreaterThanOrEqual(0.0);
    });
  });
});

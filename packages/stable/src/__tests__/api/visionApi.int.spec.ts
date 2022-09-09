// Copyright 2020 Cognite AS

import { VisionExtractPostResponse } from '@cognite/sdk-playground';
import CogniteClientPlayground from '../../cogniteClientPlayground';
import { setupLoggedInClient as setupLoggedinPlaygroundClient } from '../testUtils';

describe('Vision API', () => {
  const TEST_IMAGE_ID = 4745168244986665;
  let playgroundClient: CogniteClientPlayground;
  let extractJob: VisionExtractPostResponse;

  beforeAll(async () => {
    jest.setTimeout(2 * 60 * 1000); // timeout after 2 minutes
    playgroundClient = setupLoggedinPlaygroundClient();

    extractJob = await playgroundClient.vision.extract(
      ['TextDetection'],
      [{ fileId: TEST_IMAGE_ID }],
      { textDetectionParameters: { threshold: 0.4 } }
    );
  });

  test('extract', async () => {
    expect(extractJob.status).toEqual('Queued');
    expect(extractJob.jobId).toBeGreaterThan(0);
    expect(extractJob.createdTime).toBeGreaterThan(0);
    expect(extractJob.statusTime).toBeGreaterThan(0);
    expect(extractJob.features).toEqual(['TextDetection']);
    expect(extractJob.items).toEqual([
      { fileId: TEST_IMAGE_ID, fileExternalId: 'vision_extract_test_image' },
    ]);
    expect(extractJob.parameters).toBeDefined();
    expect(extractJob.parameters!.textDetectionParameters).toEqual({
      threshold: 0.4,
    });
  });

  describe('retrieve extract job', () => {
    test('waitForCompletion=false', async () => {
      const result = await playgroundClient.vision.getExtractJob(
        extractJob.jobId,
        false
      );
      expect(result.status == 'Queued' || result.status == 'Running').toBe(
        true
      );
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
      expect(result.parameters!.textDetectionParameters).toEqual({
        threshold: 0.4,
      });

      expect(result.items?.length).toBeGreaterThan(0);
      const resultItem = result.items![0];
      expect(resultItem.fileId).toEqual(TEST_IMAGE_ID);

      // Check if text prediction exist
      expect(resultItem.predictions.textPredictions?.length).toBeGreaterThan(0);
      const textPrediction = resultItem.predictions.textPredictions![0];
      // Check that its values are defined. D
      expect(textPrediction.confidence).toBeGreaterThanOrEqual(0.0);
      expect(textPrediction.text).toEqual('TEST');
      expect(textPrediction.textRegion).toBeDefined();
      const textRegion = textPrediction.textRegion!;
      expect(textRegion.xMin).toBeGreaterThanOrEqual(0.0);
      expect(textRegion.xMax).toBeGreaterThanOrEqual(0.0);
      expect(textRegion.yMin).toBeGreaterThanOrEqual(0.0);
      expect(textRegion.yMax).toBeGreaterThanOrEqual(0.0);
    });
  });
});

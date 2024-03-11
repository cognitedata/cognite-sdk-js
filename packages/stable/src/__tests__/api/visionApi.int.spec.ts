// Copyright 2020 Cognite AS

import { VisionExtractPostResponse } from '@cognite/sdk';
import CogniteClient from '../../cogniteClient';
import { BETA_FEATURES } from '../../api/vision/visionApi';
import { setupLoggedInClient } from '../testUtils';

describe('Vision API', () => {
  const TEST_IMAGE_ID = 3285495312337188;
  let client: CogniteClient;
  let consoleSpy: jest.SpyInstance;
  let extractJob: VisionExtractPostResponse;
  let extractBetaJob: VisionExtractPostResponse;

  beforeAll(async () => {
    jest.setTimeout(3 * 60 * 1000); // timeout after 3 minutes
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    client = setupLoggedInClient();

    extractJob = await client.vision.extract(
      ['TextDetection'],
      [{ fileId: TEST_IMAGE_ID }],
      { textDetectionParameters: { threshold: 0.4 } }
    );
    extractBetaJob = await client.vision.extract(BETA_FEATURES, [
      { fileId: TEST_IMAGE_ID },
    ]);
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

  test('extract using beta feature', async () => {
    // Check that the beta flag is correctly used.
    // Unfortunately, 'cdf-version' is not listed in
    // access-control-allow-headers, which means we cannot explicitly check for
    // that the 'cdf-version' entry is set to 'beta'. However, what we instead
    // can do is to check that the API does not return 400 when a beta feature
    // is sent.
    const metadata = client.getMetadata(extractBetaJob);
    expect(metadata).toBeDefined();
    expect(metadata?.status).toEqual(200);
    expect(consoleSpy).toBeCalledWith(
      `Features '${BETA_FEATURES}' are in beta and are still in development`
    );
    // Only care that the job is queued with the correct feature. The other
    // properties are checked for in the test above.
    expect(extractBetaJob.status).toEqual('Queued');
    expect(extractBetaJob.features).toEqual(BETA_FEATURES);
  });

  describe('retrieve extract job', () => {
    test('waitForCompletion=false', async () => {
      const result = await client.vision.getExtractJob(extractJob.jobId, false);
      expect(result.status == 'Queued' || result.status == 'Running').toBe(
        true
      );
      expect(result.jobId).toEqual(extractJob.jobId);
      expect(result.createdTime).toEqual(extractJob.createdTime);
      expect(result.statusTime).toBeGreaterThanOrEqual(extractJob.statusTime);
    });
    test('waitForCompletion=true, should timeout', async () => {
      await expect(
        client.vision.getExtractJob(extractJob.jobId, true, 1000, 0)
      ).rejects.toThrowError(
        `Timed out while waiting for vision job to complete.`
      );
    });
    test('waitForCompletion=true', async () => {
      const result = await client.vision.getExtractJob(extractJob.jobId, true);
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

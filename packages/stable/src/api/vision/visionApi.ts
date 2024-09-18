// Copyright 2022 Cognite AS

import { BaseResourceAPI, sleepPromise } from '@cognite/sdk-core';
import type {
  FeatureParameters,
  FileReference,
  JobId,
  JobStatus,
  VisionExtractFeature,
  VisionExtractGetResponse,
  VisionExtractPostResponse,
} from '../../types';

const JOB_COMPLETE_STATES: JobStatus[] = ['Completed', 'Failed'];
/** @hidden */
export const BETA_FEATURES: VisionExtractFeature[] = [
  'IndustrialObjectDetection',
  'PersonalProtectiveEquipmentDetection',
];

export class VisionAPI extends BaseResourceAPI<VisionExtractGetResponse> {
  /**
   * [Extract features from image](https://docs.cognite.com/api/v1/#tag/Vision/operation/postVisionExtract)
   *
   * ```js
   * const job = await client.vision.extract(['TextDetection', 'AssetTagDetection', 'PeopleDetection'], [{ fileId: 1234 }]);
   * ```
   */
  public extract = async (
    features: VisionExtractFeature[],
    ids: FileReference[],
    parameters?: FeatureParameters
  ): Promise<VisionExtractPostResponse> => {
    const path = this.url('extract');

    let headers = {};
    const betaFeatures = features.filter((f) => BETA_FEATURES.includes(f));
    if (betaFeatures.length > 0) {
      console.warn(
        `Features '${betaFeatures}' are in beta and are still in development`
      );
      headers = { ...headers, 'cdf-version': 'beta' };
    }

    const response = await this.post<VisionExtractPostResponse>(path, {
      data: { features: features, items: ids, parameters: parameters },
      headers: headers,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve extract job](https://docs.cognite.com/api/v1/#tag/Vision/operation/getVisionExtract)
   *
   * ```js
   * const { items } = await client.vision.getExtractJob(12345678, true); // get an existing job, wait for it to complete, and get the results
   * items.forEach((item) => {
   *  const predictions = item.predictions // do something with the predictions
   * });
   * ```
   */
  public getExtractJob = async (
    jobId: JobId,
    waitForCompletion = true,
    pollingTimeMs = 1000,
    maxRetries = 600
  ): Promise<VisionExtractGetResponse> => {
    const path = this.url(`extract/${jobId}`);
    const getJobResult = async () => {
      const response = await this.get<VisionExtractGetResponse>(path);
      return this.addToMapAndReturn(response.data, response);
    };
    const isJobCompleted = (result: VisionExtractGetResponse) => {
      return JOB_COMPLETE_STATES.includes(result.status);
    };
    return waitForCompletion
      ? this.waitForJobToCompleteAndReturn(
          getJobResult,
          isJobCompleted,
          pollingTimeMs,
          maxRetries
        )
      : getJobResult();
  };

  private async waitForJobToCompleteAndReturn<T>(
    getJobResult: () => Promise<T>,
    isJobCompleted: (result: T) => boolean,
    pollingTimeMs: number,
    maxRetries: number
  ) {
    let retryCount = 0;
    do {
      // Get newest job result
      const result = await getJobResult();
      // Job is in a complete state. We can now exit this loop.
      if (isJobCompleted(result)) return result;
      // Wait a bit before retrying..
      await sleepPromise(pollingTimeMs);
      retryCount++;
    } while (retryCount < maxRetries);
    throw new Error('Timed out while waiting for vision job to complete.');
  }
}

// Copyright 2022 Cognite AS

import { BaseResourceAPI, sleepPromise } from '@cognite/sdk-core';
import {
  VisionExtractGetResponse,
  VisionExtractPostResponse,
  VisionExtractFeature,
  FileReference,
  JobStatus,
  JobId,
  FeatureParameters,
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
   * const response = await client.vision.extract(["TextDetection"], [{ fileId: 1234}], {textDetectionParameters: {threshold: 0.4}});
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
   * const job = await client.vision.getExtractJob(12345678);
   * ```
   */
  public getExtractJob = async (
    jobId: JobId,
    waitForCompletion: boolean = true,
    pollingTimeMs: number = 1000,
    maxRetries: number = 600
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
    throw new Error(`Timed out while waiting for vision job to complete.`);
  }
}
